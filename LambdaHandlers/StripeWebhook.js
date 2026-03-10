import Stripe from 'stripe';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({ region: "us-east-1" });
const sns = new SNSClient({ region: "us-east-1" });

export const handler = async (event) => {
    // 1. Log the event so you can debug in CloudWatch
    console.log("Webhook received. Header signature check...");

    const headers = event.headers || {};
    // API Gateway headers can be lowercase or uppercase depending on configuration
    const sig = headers['stripe-signature'] || headers['Stripe-Signature'];
    
    if (!sig) {
        console.error("No Stripe signature found in headers.");
        return { statusCode: 400, body: "Missing signature" };
    }
    
    let stripeEvent;
    try {
        // 2. VERIFY THE CALL CAME FROM STRIPE
        // strip security check since we disable Cognito for this route
        stripeEvent = stripe.webhooks.constructEvent(
            event.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Signature verification failed: ${err.message}`);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // 3. PROCESS SUCCESSFUL PAYMENT
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        console.log("Processing Session ID:", session.id);
        
        const customerEmail = session.customer_details?.email;
        const customerPhone = session.customer_details?.phone; 
        const totalAmount = session.amount_total / 100;

        // Retrieve the verified userId and items we passed from the ProcessOrder Lambda
        const userId = session.metadata?.userId;
        const minifiedItems = JSON.parse(session.metadata?.cartItems || "[]");
        
        const fullItems = minifiedItems.map(item => ({
            productId: item.id,
            name: item.n,
            qty: item.q,
            price: item.p
        }));

        const order = {
            orderId: `STRIPE-${session.id.slice(-8)}`,
            userId: userId, // This matches the Cognito 'sub' UUID
            items: fullItems,
            total: totalAmount,
            status: "PAID",
            createdAt: new Date().toISOString(),
            email: customerEmail,
            phone: customerPhone
        };

        try {
            // Save to DynamoDB
            await docClient.send(new PutCommand({
                TableName: "Orders", // Ensure this matches your table name exactly
                Item: order
            }));
            console.log("Order saved to DynamoDB for user:", userId);

            // 4. TRIGGER NOTIFICATIONS
            if (customerEmail) {
                await ses.send(new SendEmailCommand({
                    Source: "winlyntiuluena@gmail.com", 
                    Destination: { ToAddresses: [customerEmail] },
                    Message: {
                        Subject: { Data: "ElectroTech Order Confirmed!" },
                        Body: {
                            Html: {
                                Data: `
                                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                                        <h2 style="color: #e11d48;">Order Confirmed!</h2>
                                        <p>Order ID: <strong>${order.orderId}</strong></p>
                                        <p>Thank you for your purchase of $${totalAmount}.</p>
                                        <hr />
                                        <p style="font-size: 10px; color: #999;">ELECTROTECH STORE - AWS Project</p>
                                    </div>
                                `
                            }
                        }
                    }
                }));
            }

            if (customerPhone) {
                await sns.send(new PublishCommand({
                    Message: `ElectroTech: Order ${order.orderId} confirmed! Total: $${totalAmount}.`,
                    PhoneNumber: customerPhone 
                }));
            }

        } catch (err) {
            console.error("Error during post-payment processing:", err);
            // We still return 200 to Stripe because we received the event, 
            // but we log the internal failure.
        }
    }

    // Stripe requires a 200 response to acknowledge receipt
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
};