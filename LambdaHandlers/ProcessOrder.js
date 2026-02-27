import Stripe from 'stripe'; 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
    try {
        // Log the incoming event to CloudWatch so we can see what React is sending
        console.log("Event Received:", event.body);
        
        const body = JSON.parse(event.body);

        // MINIFY the cart items to stay under 500 characters
        const simplifiedItems = body.items.map(item => ({
            id: item.productId,
            n: item.name.substring(0, 20), // Grab the first 20 chars to keep it short
            q: item.qty,
            p: item.price
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: body.items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: { 
                        name: item.name,
                        // Stripe doesn't need the description here to process payment, name is enough
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.qty,
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
            metadata: {
                userId: body.userId,
                cartItems: JSON.stringify(simplifiedItems) 
            },
            phone_number_collection: {
                enabled: true,
              },
        });

        // 2. Return the URL to React
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Crucial for CORS
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
                error: err.message,
                stack: err.stack 
            })
        };
    }
};