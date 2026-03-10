import Stripe from 'stripe'; 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
    try {
        // 1. SECURE IDENTITY CHECK
        // We pull the verified ID from Cognito, not the request body
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

        // MINIFY the cart items to stay under Stripe's 500-character metadata limit
        const simplifiedItems = body.items.map(item => ({
            id: item.productId,
            n: item.name.substring(0, 20), 
            q: item.qty,
            p: item.price
        }));

        // 2. CREATE STRIPE SESSION
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: body.items.map(item => ({
                price_data: {
                    currency: 'cad',
                    product_data: { 
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.qty,
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
            metadata: {
                // Use the verified IDs from Cognito here
                userId: authenticatedUserId,
                email: userEmail, 
                cartItems: JSON.stringify(simplifiedItems) 
            },
            customer_email: userEmail, // Pre-fills the Stripe email field for the user
            phone_number_collection: {
                enabled: true,
            },
        });

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
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