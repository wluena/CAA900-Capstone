import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Inside your handler...
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: body.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: item.price * 100, // Stripe uses cents!
    },
    quantity: item.qty,
  })),
  mode: 'payment',
  success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/cart`,
});

return {
  statusCode: 200,
  headers: { "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ url: session.url }) // Return the redirect URL
};