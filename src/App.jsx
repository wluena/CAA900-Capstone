import React, { useEffect, useState } from 'react';
import { ShoppingCart, User, Search, LogOut, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

// AWS AMPLIFY V6
import { fetchAuthSession } from 'aws-amplify/auth'
import { withAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useAuthenticator, Authenticator } from '@aws-amplify/ui-react';
import { X } from 'lucide-react'


// UI COMPONENTS
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'


// ASSETS & CONSTANTS
import logoImg from './assets/logo.png'
import { APP_CONFIG, CATEGORIES, UI_STRINGS } from './constants/appConstants'


function App() {
  const { user: authUser, signOut: amplifySignOut } = useAuthenticator((context) => [context.user]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cart, setCart] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. STRIPE SUCCESS DETECTION ---
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    
    if (query.get('success')) {
      setShowSuccess(true);
      setCart([]); // Clear the local cart state
      // Clean the URL so the modal doesn't re-appear on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (query.get('canceled')) {
      console.log("Payment canceled by user.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- 2. RESILIENT GET API INTEGRATION ---
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let token = null;
      
      // 1. TRY to get session, but don't crash if guest
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString();
        
        // Update user email state if logged in
        const email = session.tokens?.idToken?.payload?.email;
        if (email) setUserEmail(email);
      } catch (e) {
        console.log("Guest mode: No active session found.");
      }

      // 2. Setup headers (only add Authorization if token exists)
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = token;
      }

      const response = await fetch(`${APP_CONFIG.API_URL}/products`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      
      let productArray = [];
      if (result.body) {
        productArray = JSON.parse(result.body);
      } else if (Array.isArray(result)) {
        productArray = result;
      }

      const cleanData = productArray.map(item => ({
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        model: item.model,
        // Match your DB naming 'category' and ensure it exists
        category: item.category || 'Uncategorized',
        price: Number(item.price),
        imageUrl: item.imageUrl,
        description: item.description,
        stock: item.stock,
        warranty: item.warranty,
        images: Array.isArray(item.images) ? item.images : [item.imageUrl]
      }));

      setProducts(cleanData);
    } catch (err) {
      console.error("Critical Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchProducts();
}, []); // Runs on mount

useEffect(() => {
  if (authUser) setShowAuthModal(false);
}, [authUser]);

  // --- UI LOGIC ---
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.productId === product.productId);
      if (exists) return prev.map(item => item.productId === product.productId ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    setShowCartDrawer(true);
  };

  // CATEGORY FILTER LOGIC 👇
  const filteredProducts = products.filter(p => {
    const matchesCategory = 
      activeCategory.toLowerCase() === 'all' || 
      p.category === activeCategory;
      
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Order Confirmed!</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              Your payment was successful. We've sent a confirmation email and your gear is being prepped.
            </p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-40 h-20 flex items-center justify-between px-8">
        <div className="flex items-center cursor-pointer" onClick={() => setActiveCategory(CATEGORIES[0])}>
          <img src={logoImg} alt="Logo" className="h-12 w-auto" />
        </div>
        <div className="flex items-center gap-6">
          {authUser ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-tight">
                {userEmail || authUser.signInDetails?.loginId || 'Member'}
              </span>
              <button onClick={amplifySignOut} className="text-[9px] text-rose-500 font-bold hover:underline tracking-widest">
                SIGN OUT
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)} // This triggers the Cognito overlay
              className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-rose-600 transition-all active:scale-95"
            >
              SIGN IN
            </button>
          )}
          <button onClick={() => setShowCartDrawer(true)} className="p-2.5 bg-zinc-100 rounded-full relative hover:bg-zinc-200 transition-colors">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold animate-in zoom-in">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
        <header className="mb-16">
            <h1 className="heading-hero italic tracking-tighter text-6xl font-black uppercase leading-[0.9]">{UI_STRINGS.HERO_TITLE}</h1>
            <p className="text-zinc-500 text-sm border-l-4 border-rose-500 pl-4 uppercase tracking-[0.2em] font-bold mt-4">{UI_STRINGS.HERO_SUBTITLE}</p>
        </header>
        {/* CATEGORY FILTER BAR */}
        <div className="flex flex-wrap gap-4 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border-2 
                ${activeCategory === cat 
                  ? 'bg-zinc-900 text-white border-zinc-900' 
                  : 'bg-transparent text-zinc-400 border-zinc-100 hover:border-zinc-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-rose-500" size={40} />
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Syncing with AWS Stack...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="text-rose-500 mb-4" size={48} />
            <h2 className="text-lg font-black uppercase">Database Offline</h2>
            <p className="text-zinc-500 text-sm max-w-md mt-2">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-rose-600 transition-colors">
                Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map(product => (
              <ProductCard key={product.productId} product={product} onSelect={setSelectedProduct} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAdd={addToCart} 
      />
      
      <CartDrawer 
        isOpen={showCartDrawer} 
        cart={cart} 
        user={authUser} 
        onClose={() => setShowCartDrawer(false)} 
        onRemove={(id) => setCart(prev => prev.filter(i => i.productId !== id))} 
        onClearCart={() => setCart([])}
        // NOTE: onCheckout is now handled inside the Checkout component itself
        // because we updated Checkout.jsx to handle the Stripe redirect.
      />

      {/* LOGIN OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-auto flex items-center justify-center p-4">
          {/* 1. BACKDROP (Clicking this also closes the modal) */}
          <div 
            className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setShowAuthModal(false)}
          />

          {/* 2. MODAL CONTAINER */}
          <div className="relative w-auto max-w-auto bg-white rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            
            {/* 3. CLOSE BUTTON */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* HEADER (Optional: helps the form look less abrupt) */}
            <div className="mb-6 pr-8">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">ElectroTech Portal</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Member Access</p>
            </div>

            {/* 4. THE COGNITO FORM */}
            <div className="amplify-custom-wrapper">
              <Authenticator />
            </div>
          </div>
        </div>
      )}
    

      <footer className="border-t border-zinc-100 py-12 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xl font-black italic tracking-tighter uppercase">
              {APP_CONFIG.NAME}<span className="text-rose-500">.</span>
            </span>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
              {UI_STRINGS.FOOTER_TEXT}
            </p>
          </div>
          
          <div className="flex flex-col md:items-end text-right">
            <p className="text-[10px] font-black uppercase text-zinc-900">
              © {APP_CONFIG.YEAR} {APP_CONFIG.DEVELOPER}
            </p>
            <p className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-tighter">
              {UI_STRINGS.SECURE_PAYMENT}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

//export default withAuthenticator(App);
export default (App);