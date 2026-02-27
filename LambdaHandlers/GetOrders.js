import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    // Get userId from query parameters: ?userId=xxx
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: "userId query parameter is required" }) 
        };
    }

    const params = {
        TableName: "Orders",
        IndexName: "userId-index", // Use the index we just created
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: {
            ":u": userId
        },
        ScanIndexForward: false // Sorts by date (newest first) if createdAt is present
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
            body: JSON.stringify({ error: "Could not fetch orders" })
        };
    }
};