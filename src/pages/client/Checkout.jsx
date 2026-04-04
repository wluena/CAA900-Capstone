import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { APP_CONFIG } from '../../constants/appConstants';

export default function Checkout({ cart, userId, onClearCart, onSuccess }) {
  // State to track if we are currently waiting for a response from the API
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = async () => {
    /* --- 1. PRE-FLIGHT AUTH CHECK --- */
    // Even though the backend validates the token, we check 'userId' here
    // to provide immediate feedback to the user before making a network call.
    if (!userId) {
      alert("Please sign in to complete your purchase.");
      return;
    }

    try {
      setIsRedirecting(true); // Disable the button and show the loading spinner
      
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      /* --- 3. BACKEND API CALL --- */
      //Send the cart contents to /checkout Lambda endpoint.
      if (!token) throw new Error("No valid authentication token found.");

      const response = await fetch(`${APP_CONFIG.API_URL}/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Secure Bearer Token strategy
        },
        body: JSON.stringify({
          // Map the cart items to only send necessary data
          items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            imageUrl: item.imageUrl
          })),
          // Note: userId is omitted because the Lambda extracts it from the claims
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout failed with status: ${response.status}`);
      }

      /* --- 4. REDIRECT TO STRIPE --- */
      const data = await response.json();
      
      // If the Lambda successfully created a Stripe Session, it returns a URL.
      // Redirect the browser entirely to Stripe's hosted checkout page.
      if (data.url) {
        // Redirect to Stripe Checkout page
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsRedirecting(false); // Re-enable the button if something goes wrong
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isRedirecting || cart.length === 0}
      className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-600 transition-all disabled:opacity-50"
    >
      {isRedirecting ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          <Lock size={18} /> 
          Secure Checkout
        </>
      )}
    </button>
  );
}