import Stripe from 'stripe';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
    // 1. Get headers safely
    const headers = event.headers || {};

    // 2. Look for the signature in both common formats
    const sig = headers['stripe-signature'] || headers['Stripe-Signature'];
    console.log("Full Event Headers:", JSON.stringify(event.headers));
    if (!sig) {
        console.error("Missing Stripe-Signature header!");
        return { statusCode: 400, body: "Missing signature" };
    }
    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("X. Signature Failed:", err.message);
        console.error("Signature verification failed:", err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        console.log("3. Processing Session for User:", session.metadata?.userId);
        const minifiedItems = JSON.parse(session.metadata.cartItems || "[]");

        // We create ONE 'fullItems' array
        const fullItems = minifiedItems.map(item => ({
            productId: item.id,
            name: item.n,
            qty: item.q,
            price: item.p
        }));

        // We create ONE 'order' object
        const order = {
            orderId: `STRIPE-${session.id.slice(-8)}`, // One unique ID for the whole cart
            userId: session.metadata.userId,
            items: fullItems, // This saves as a List/Array in DynamoDB
            total: session.amount_total / 100,
            status: "PAID",
            createdAt: new Date().toISOString()
        };

        try {
            await docClient.send(new PutCommand({
                TableName: "Orders",
                Item: order
            }));
            console.log("Order Saved Successfully:", order.orderId);
            console.log("4. SUCCESS: Saved to DynamoDB");
        } catch (dbError) {
            console.error("DynamoDB Save Error:", dbError);
            // We still return 200 to Stripe because we received the event, 
            // but we'll see the error in our CloudWatch logs.
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
    };
};