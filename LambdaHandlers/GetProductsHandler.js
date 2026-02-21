import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
    try {
        const command = new ScanCommand({ TableName: "Products" });
        const { Items } = await client.send(command);
        
        // This converts DynamoDB types to standard JS objects
        // If 'category' is a string in DB, it will be a string here.
        const unmarshalledItems = (Items || []).map(item => unmarshall(item));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify(unmarshalledItems), 
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message }),
        };
    }
};