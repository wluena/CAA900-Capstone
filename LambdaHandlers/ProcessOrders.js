import Stripe from 'stripe';
// Initialize Stripe with the Secret Key from environment variables for security
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
    try {
        /* --- 1. SECURE IDENTITY CHECK --- */
        // Do not trust the User ID from the frontend body. 
        // Pull the 'sub' (UUID) and 'email' directly from the Cognito claims.
        const authenticatedUserId = event.requestContext?.authorizer?.claims?.sub;
        const userEmail = event.requestContext?.authorizer?.claims?.email;

        if (!authenticatedUserId) {
            return { 
                statusCode: 401, 
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Unauthorized" }) 
            };
        }

        const body = JSON.parse(event.body);
        /* --- 2. DATA MINIFICATION --- */
        // Stripe has a 500-character limit for metadata strings.
        // Shrink cart data (e.g., changing 'name' to 'n') to ensure it fits.
        const simplifiedItems = body.items.map(item => ({
            id: item.productId,
            n: item.name.substring(0, 20), // Truncate name to save space
            q: item.qty,
            p: item.price
        }));

        /* --- 3. STRIPE SESSION CREATION --- */
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            // Map  cart items into Stripe's 'price_data' format
            line_items: body.items.map(item => ({
                price_data: {
                    currency: 'cad', // Set currency to CAD
                    product_data: { 
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert dollars to cents
                },
                quantity: item.qty,
            })),
            mode: 'payment',
            // Redirect URLs back to our frontend based on the result
            success_url: `${process.env.FRONTEND_URL}?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,

            /* --- 4. PERSISTENCE VIA METADATA --- */
            // We "hide" our app data here so the Stripe Webhook can read it later
            metadata: {
                // Use the verified IDs from Cognito
                userId: authenticatedUserId,
                email: userEmail, 
                cartItems: JSON.stringify(simplifiedItems) 
            },
            customer_email: userEmail, // Pre-fills the Stripe email field for the user
            phone_number_collection: {
                enabled: true, // Enables SMS fulfillment later via SNS
            },
        });

        /* --- 5. REDIRECT RESPONSE --- */
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            // Send back the Stripe URL for the React app to navigate to
            body: JSON.stringify({ 
                url: session.url
            })
        };
    } catch (err) {
        console.error("Stripe Session Error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
                error: "Unable to process checkout. Please try again."
            })
        };
    }
};