import { useState, useEffect, useCallback } from 'react';

export function useCart(setShowCartDrawer) {
  // 1. Initialize cart from LocalStorage if it exists
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('electrotech_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Sync cart to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('electrotech_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Add to Cart Logic
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product.productId);
      if (exists) {
        return prev.map((item) =>
          item.productId === product.productId 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    
    // Automatically open the drawer so the user sees the item was added
    if (setShowCartDrawer) setShowCartDrawer(true);
  }, [setShowCartDrawer]);

  // 4. Remove from Cart
  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // 5. Clear Cart (Used after successful checkout)
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('electrotech_cart');
  }, []);

  // 6. Calculate Totals
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.qty, 0);

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal
  };
}