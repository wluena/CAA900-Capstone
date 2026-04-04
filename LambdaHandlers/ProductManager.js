import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "Products"; 

export const handler = async (event) => {
    // 1. Extract request details
    const { httpMethod, body, pathParameters } = event;
    
    /* --- 2. ROLE-BASED ACCESS CONTROL (RBAC) --- */
    // Check the token's 'cognito:groups' claim.
    // If the user isn't in the "Admins" group, block their write/delete requests.
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || "";
    const isAdmin = groups.includes("Admins");

    // 3. UNIFIED CORS HEADERS
    // Required for the Admin Dashboard to communicate with this API
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
    };

    try {
        // Handle browser preflight checks
        if (httpMethod === "OPTIONS") {
            return { statusCode: 200, headers, body: "" };
        }

        /* --- 4. MULTI-METHOD ROUTING (CRUD) --- */
        switch (httpMethod) {
            case "GET":
                // READ: Fetch all products for the dashboard
                const data = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
                return { statusCode: 200, headers, body: JSON.stringify(data.Items) };

            case "POST":
                // CREATE: Add a new product (Admin Only)
                if (!isAdmin) return { statusCode: 403, headers, body: JSON.stringify({ message: "Admin Only" }) };
                
                const newProduct = JSON.parse(body);
                // Auto-generate ID if missing to prevent primary key collisions
                if (!newProduct.productId) newProduct.productId = `prod_${Date.now()}`;
                
                // DATA SANITIZATION: Force correct types before saving to DynamoDB
                const postItem = {
                    ...newProduct,
                    price: parseFloat(newProduct.price || 0),
                    stock: parseInt(newProduct.stock || 0, 10),
                    isFeatured: newProduct.isFeatured === true || newProduct.isFeatured === "true"
                };
                
                await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: postItem }));
                return { statusCode: 201, headers, body: JSON.stringify(postItem) };

            case "PUT":
                // UPDATE: Modify existing product details (Admin Only)
                if (!isAdmin) return { statusCode: 403, headers, body: JSON.stringify({ message: "Admin Only" }) };
                
                // Flexible ID check (handles {productId} or {id} in API Gateway)
                const idToUpdate = pathParameters?.productId || pathParameters?.id;
                if (!idToUpdate) throw new Error("Missing productId in path parameters");

                const updatedData = JSON.parse(body);
                
                // Format the item to ensure correct DynamoDB types and keep ID consistent
                const putItem = {
                    ...updatedData,
                    productId: idToUpdate, 
                    price: parseFloat(updatedData.price || 0),
                    stock: parseInt(updatedData.stock || 0, 10),
                    isFeatured: updatedData.isFeatured === true || updatedData.isFeatured === "true"
                };

                await docClient.send(new PutCommand({ 
                    TableName: TABLE_NAME, 
                    Item: putItem 
                }));
                return { statusCode: 200, headers, body: JSON.stringify({ message: "Updated", id: idToUpdate }) };

            case "DELETE":
                // DELETE: Remove product from catalog (Admin Only)
                if (!isAdmin) return { statusCode: 403, headers, body: JSON.stringify({ message: "Admin Only" }) };
                
                const deleteId = pathParameters?.productId || pathParameters?.id;
                if (!deleteId) throw new Error("Missing productId for deletion");

                await docClient.send(new DeleteCommand({ 
                    TableName: TABLE_NAME, 
                    Key: { productId: deleteId } 
                }));
                return { statusCode: 200, headers, body: JSON.stringify({ message: "Deleted" }) };

            default:
                return { statusCode: 405, headers, body: JSON.stringify({ message: "Method Not Allowed" }) };
        }
    } catch (err) {
        console.error("Lambda Error:", err); // Logs to CloudWatch for debugging
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ 
                error: err.message,
                details: "Check Lambda CloudWatch logs for more info"
            }) 
        };
    }
};