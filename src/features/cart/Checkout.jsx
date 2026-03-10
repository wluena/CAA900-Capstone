import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { APP_CONFIG } from '../../constants/appConstants';

export default function Checkout({ cart, userId, onClearCart, onSuccess }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = async () => {
    // Note: 'userId' here is good for a quick UI check, 
    // but the Lambda will use the JWT for the actual source of truth.
    if (!userId) {
      alert("Please sign in to complete your purchase.");
      return;
    }

    try {
      setIsRedirecting(true);
      
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) throw new Error("No valid authentication token found.");

      const response = await fetch(`${APP_CONFIG.API_URL}/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Matching the 'Bearer' prefix used in your other components
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            imageUrl: item.imageUrl
          })),
          // We can omit userId here because Lambda will pull it from the JWT!
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout failed with status: ${response.status}`);
      }

      const data = await response.json();
      
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
      setIsRedirecting(false);
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