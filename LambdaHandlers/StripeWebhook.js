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
    /* --- 1. SECURITY & SIGNATURE VERIFICATION --- */
    // Log the event so you can debug in CloudWatch
    console.log("Webhook received. Header signature check...");

    const headers = event.headers || {};
    // Extract the Stripe signature. Stripe sends this to prove the request is authentic.
    const sig = headers['stripe-signature'] || headers['Stripe-Signature'];
    
    if (!sig) {
        console.error("No Stripe signature found in headers.");
        return { statusCode: 400, body: "Missing signature" };
    }
    
    let stripeEvent;
    try {
        // Verify call from Stripe
        /* Zero Trust Implementation: We use Stripe's library to re-construct the event.
           If even one character in the body was tampered with, this will fail.
        */
        stripeEvent = stripe.webhooks.constructEvent(
            event.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Signature verification failed: ${err.message}`);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    /* --- 2. EVENT FILTERING --- */
    // We only care about successful checkouts. Other events (like refund or failure) are ignored here.
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        console.log("Processing Session ID:", session.id);

        // Extract customer details captured on Stripe's secure page
        const customerEmail = session.customer_details?.email;
        const customerPhone = session.customer_details?.phone; 
        const totalAmount = session.amount_total / 100; // Stripe provides amounts in cents

        /* 3. DATA RECONSTRUCTION 
           Retrieve the verified userId and items we passed from the ProcessOrder Lambda
        */
        const userId = session.metadata?.userId;
        const minifiedItems = JSON.parse(session.metadata?.cartItems || "[]");
        
        // Transform the shortened metadata keys (n, q, p) back into readable object properties
        const fullItems = minifiedItems.map(item => ({
            productId: item.id,
            name: item.n,
            qty: item.q,
            price: item.p
        }));

        // Prepare the Order Object for DynamoDB
        const order = {
            orderId: `STRIPE-${session.id.slice(-8)}`, // Create a readable short ID
            userId: userId, // This matches the Cognito 'sub' UUID
            items: fullItems,
            total: totalAmount,
            status: "PAID", // This confirms fulfillment can begin
            createdAt: new Date().toISOString(),
            email: customerEmail,
            phone: customerPhone
        };

        try {
            /* --- 4. DATABASE --- */
            // Save the finalized order to the 'Orders' table in Dynamodb
            await docClient.send(new PutCommand({
                TableName: "Orders", // Ensure this matches table name exactly
                Item: order
            }));
            console.log("Order saved to DynamoDB for user:", userId);

            // 5. TRIGGER NOTIFICATIONS
            // Trigger SES for professional Email Confirmation
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
                                        <p style="font-size: 10px; color: #999;">ELECTROTECH STORE</p>
                                    </div>
                                `
                            }
                        }
                    }
                }));
            }
            // Trigger SNS for SMS Confirmation (if phone provided)
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
    /* --- 6. STRIPE ACKNOWLEDGEMENT --- */
    // Stripe requires a 200 response to acknowledge receipt
    // Stripe will keep retrying the webhook (causing duplicate orders) if we don't return a 200 OK.
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
};