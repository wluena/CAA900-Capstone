import React from 'react';
import { X, Trash2, ShoppingBag, Lock } from 'lucide-react'; // Added Lock icon
import { Authenticator } from '@aws-amplify/ui-react'; // Import this
import Checkout from './Checkout';

export default function CartDrawer({ isOpen, onClose, cart, onRemove, onClearCart, user }) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          
          {/* HEADER */}
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tighter">Your Cart</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* ITEM LIST */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <ShoppingBag size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-50" />
                    <div className="flex-1">
                      <h4 className="text-[11px] font-black uppercase leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Qty: {item.qty} • ${item.price}</p>
                    </div>
                    <button onClick={() => onRemove(item.productId)} className="p-2 text-zinc-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER & CHECKOUT GATE */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
              <div className="flex justify-between mb-6">
                <span className="font-bold text-zinc-400 uppercase text-[10px]">Total Amount</span>
                <span className="font-black text-xl">${total.toLocaleString()}</span>
              </div>
              
              {user ? (
                /* 1. LOGGED IN: Show the Checkout Component */
                <Checkout 
                  cart={cart} 
                  userId={user?.userId} 
                  onClearCart={onClearCart} 
                  onSuccess={(orderId) => {
                    onClose();
                    const displayId = String(orderId).slice(0, 8).toUpperCase();
                    alert(`ORDER #${displayId} PLACED SUCCESSFULLY!`);
                  }}
                />
              ) : (
                /* 2. GUEST: Show the Login Gate */
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 py-2 bg-rose-50 rounded-lg text-rose-600">
                        <Lock size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Login required for checkout</span>
                    </div>
                    {/* This renders the login form right inside the drawer */}
                    <Authenticator>
                        {({ signOut, user }) => (
                            <div className="pt-4 text-center">
                                <p className="text-[10px] font-bold mb-4">Logged in! Ready to complete your order.</p>
                                {/* We don't need a button here; as soon as Authenticator completes, 
                                    the parent component (App.jsx) will update the 'user' prop 
                                    and the 'Checkout' component will appear above. */}
                            </div>
                        )}
                    </Authenticator>
                </div>
              )}
              
              <p className="text-center text-[9px] text-zinc-400 mt-4 font-bold uppercase tracking-widest">
                Secure Checkout via Stripe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}