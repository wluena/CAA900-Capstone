import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    // 1. Extract the secure userId (sub) from the Cognito Authorizer
    // This is much safer than getting it from the query parameters.
    const authenticatedUserId = event.requestContext?.authorizer?.claims?.sub;
    const userEmail = event.requestContext?.authorizer?.claims?.email;

    if (!authenticatedUserId) {
        return { 
            statusCode: 401, 
            body: JSON.stringify({ message: "Unauthorized: No valid session found." }) 
        };
    }

    console.log(`Fetching orders for user: ${userEmail} (${authenticatedUserId})`);

    const params = {
        TableName: "Orders",
        IndexName: "userId-index", 
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: {
            ":u": authenticatedUserId // Use the ID from the token
        },
        ScanIndexForward: false // Sorts by date (newest first)
    };

    try {
        const result = await docClient.send(new QueryCommand(params));
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
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