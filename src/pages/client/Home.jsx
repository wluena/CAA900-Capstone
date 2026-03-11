import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

// LAYOUT & UI (Go up TWO levels: out of home, out of pages)
import NavBar from '../../components/layout/NavBar.jsx'; 
import Footer from '../../components/layout/Footer.jsx';
import AuthModal from '../../features/auth/AuthModal.jsx';
import ProfileModal from '../../features/auth/ProfileModal.jsx';
import SuccessOverlay from '../../components/ui/SuccessOverlay.jsx';

// FEATURE COMPONENTS (Same folder or neighbor folder)
import ProductModal from "./ProductModal.jsx";
import ProductCard from "./ProductCard.jsx";
import CartDrawer from "./CartDrawer.jsx";
import OrdersDrawer from "./OrdersDrawer.jsx";
import FeaturedCarousel from './FeaturedCarousel.jsx';

// HOOKS & CONSTANTS (Go up TWO levels)
import { useProducts } from '../../hooks/useProducts.js';
import { useCart } from '../../hooks/useCart.js';
import { APP_CONFIG, CATEGORIES, UI_STRINGS } from '../../constants/appConstants.js';

export default function Home() {
  const { user: authUser, signOut: amplifySignOut} = useAuthenticator((context) => [context.user]);
  
  // UI States
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrdersDrawer, setShowOrdersDrawer] = useState(false);
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  // Data Hooks
  const { products, isLoading, error } = useProducts();
  const { cart, addToCart, removeFromCart, clearCart, cartCount } = useCart(setShowCartDrawer);

  // Create the featured list
  const featuredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.isFeatured === true || 
      p.isFeatured === "true" ||
      p.isFeatured === 1
    );
  }, [products]);

  // --- STRIPE SUCCESS DETECTION ---
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') === 'true') {
      clearCart(); 
      setShowSuccess(true);
      setShowCartDrawer(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [clearCart]);

  // --- SECURE MY ORDERS FETCHING ---
  const fetchOrders = async () => {
    if (!authUser) return setShowAuthModal(true);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      setToken(session.tokens)
      if (!token) {
        console.error("No valid session found");
        return setShowAuthModal(true);
      }

      // We no longer pass ?userId= in the URL. Lambda gets it from the token!
      const res = await fetch(`${APP_CONFIG.API_URL}/my-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) alert("Session expired. Please log in again.");
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setOrders(data || []);
      setShowOrdersDrawer(true);
    } catch (err) {
      console.error("Order fetch failed:", err);
    }
  };

  const handleOpenProductModal = (productId) => {
    const product = products.find(p => p.productId === productId);
    if (product) setSelectedProduct(product);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => (
      (activeCategory.toLowerCase() === 'all' || p.category === activeCategory) &&
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SuccessOverlay isVisible={showSuccess} onClose={() => setShowSuccess(false)} />

      <NavBar 
        cartCount={cartCount}
        authUser={authUser}
        onSignOut={amplifySignOut}
        onOpenCart={() => setShowCartDrawer(true)}
        onOpenOrders={fetchOrders}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}

      />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
        <header className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-zinc-900">
            {UI_STRINGS.HERO_TITLE}
          </h1>
          <p className="text-zinc-400 text-xs border-l-4 border-rose-500 pl-4 uppercase tracking-[0.3em] font-bold mt-6">
            {UI_STRINGS.HERO_SUBTITLE}
          </p>
          
        </header>
        
        {featuredProducts.length > 0 && (
          <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl">
            <FeaturedCarousel ads={featuredProducts} onShopNow={handleOpenProductModal} />
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border-2 
              ${activeCategory === cat ? 'bg-zinc-900 text-white border-zinc-900' : 'text-zinc-400 border-zinc-100 hover:border-zinc-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <Loader2 className="animate-spin text-rose-500" size={32} />
            <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em]">Syncing Systems...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
            <AlertCircle className="text-rose-500 mx-auto mb-4" size={40} />
            <h2 className="text-sm font-black uppercase">Uplink Failed</h2>
            <button onClick={() => window.location.reload()} className="mt-4 text-[10px] font-black text-rose-500 underline">RETRY</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.productId} product={product} onSelect={setSelectedProduct} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {/* MODALS & DRAWERS */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
      <CartDrawer isOpen={showCartDrawer} cart={cart} user={authUser} onClose={() => setShowCartDrawer(false)} onRemove={removeFromCart} onClearCart={clearCart} />
      <OrdersDrawer isOpen={showOrdersDrawer} onClose={() => setShowOrdersDrawer(false)} orders={orders} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={authUser} />

      <Footer />
    </div>
  );
}