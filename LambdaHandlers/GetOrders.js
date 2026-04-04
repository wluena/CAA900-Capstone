import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    // 1. Extract the secure userId (sub) from the Cognito Authorizer
    /* --- 1. IDENTITY ENFORCEMENT --- */
    // Retrieve the 'sub' (the unique Cognito ID) from Cognito Authorizer.
    // This ensures User A can never see User B's orders by just changing a URL parameter.
    const authenticatedUserId = event.requestContext?.authorizer?.claims?.sub;
    const userEmail = event.requestContext?.authorizer?.claims?.email;

    if (!authenticatedUserId) {
        return { 
            statusCode: 401, 
            body: JSON.stringify({ message: "Unauthorized: No valid session found." }) 
        };
    }

    console.log(`Fetching orders for user: ${userEmail} (${authenticatedUserId})`);

    /* --- 2. THE QUERY CONFIGURATION --- */
    const params = {
        TableName: "Orders",
        // Use a Global Secondary Index (GSI) because 'userId' is likely not the Primary Key
        IndexName: "userId-index",
        // Look for rows where the userId matches our authenticated ID
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: {
            ":u": authenticatedUserId // Use the ID from the token
        },
        // Sort results to see most recent orders appear at the top
        ScanIndexForward: false // Sorts by date (newest first)
    };

    try {
        /* --- 3. EXECUTION --- */
        const result = await docClient.send(new QueryCommand(params));
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS Required for frontend communication
                "Content-Type": "application/json"
            },
            // result.Items contains the array of order objects
            body: JSON.stringify(result.Items)
        };
    } catch (error) {
        console.error("Query Error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Could not fetch orders" })
        };
    }
};