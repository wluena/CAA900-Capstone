import Stripe from 'stripe';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// 1. Import SES and SNS
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
// 2. Initialize Clients
const ses = new SESClient({ region: "us-east-1" });
const sns = new SNSClient({ region: "us-east-1" });

export const handler = async (event) => {
    const headers = event.headers || {};
    const sig = headers['stripe-signature'] || headers['Stripe-Signature'];
    
    if (!sig) return { statusCode: 400, body: "Missing signature" };
    
    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        
        // 3. Extract Customer Info
        // Stripe stores these in customer_details
        const customerEmail = session.customer_details?.email;
        const customerPhone = session.customer_details?.phone; 
        const totalAmount = session.amount_total / 100;

        const minifiedItems = JSON.parse(session.metadata.cartItems || "[]");
        const fullItems = minifiedItems.map(item => ({
            productId: item.id,
            name: item.n,
            qty: item.q,
            price: item.p
        }));

        const order = {
            orderId: `STRIPE-${session.id.slice(-8)}`,
            userId: session.metadata.userId,
            items: fullItems,
            total: totalAmount,
            status: "PAID",
            createdAt: new Date().toISOString(),
            email: customerEmail // Good to save this in the DB too!
        };

        try {
            // Save to DynamoDB
            await docClient.send(new PutCommand({
                TableName: "Orders",
                Item: order
            }));

            // 4. TRIGGER NOTIFICATIONS
            // We do this AFTER the database save is successful
            
            // EMAIL NOTIFICATION
            if (customerEmail) {
                await ses.send(new SendEmailCommand({
                    Source: "wluena@myseneca.ca", // MUST BE VERIFIED IN SES
                    Destination: { ToAddresses: [customerEmail] },
                    Message: {
                        Subject: { Data: "Order Confirmed" },
                        Body: {
                            Html: {
                                Data: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                                        <h2 style="color: #e11d48; text-transform: uppercase;">Order Confirmed!</h2>
                                        <p>Order ID: <strong>${order.orderId}</strong></p>
                                        <p>Thank you for your purchase of $${totalAmount}. We are processing your items now.</p>
                                        <hr />
                                        <p style="font-size: 10px; color: #999;">ELECTROTECH - High Performance Tech</p>
                                    </div>
                                `
                            }
                        }
                    }
                }));
            }

            // SMS NOTIFICATION
            if (customerPhone) {
                await sns.send(new PublishCommand({
                    Message: `ElectroTech: Order ${order.orderId} confirmed! Total: $${totalAmount}. Thanks for shopping!`,
                    PhoneNumber: customerPhone 
                }));
            }

            console.log("SUCCESS: Order saved and notifications sent.");
        } catch (err) {
            console.error("Post-Payment Error:", err);
        }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
};