import React, { useState } from 'react'
import productData from './products.json'
import { ShoppingCart, Zap, User, Search } from 'lucide-react'

// UI COMPONENTS
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import AuthModal from './components/AuthModal'

// UI ASSETS
import logoImg from './assets/logo.png'


// CONSTANTS
import { APP_CONFIG, CATEGORIES, UI_STRINGS } from './constants/appConstants'

function App() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]); // Uses 'All' from constants
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Future state for AWS integration
  const [user, setUser] = useState(null); // Will hold Cognito User data

  // --- LOGIC ---
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.productId === product.productId);
      if (exists) return prev.map(item => 
        item.productId === product.productId ? { ...item, qty: item.qty + 1 } : item
      );
      return [...prev, { ...product, qty: 1 }];
    });
    setShowCartDrawer(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.productId !== id));

  const filteredProducts = productData.products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* NAVIGATION */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-40 h-20 flex items-center justify-between px-8">
        <div 
          className="flex items-center cursor-pointer group" 
          onClick={() => { setActiveCategory(CATEGORIES[0]); setSearchQuery(''); }}
        >
          <img 
            src={logoImg} 
            alt="ElectroTech Logo" 
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105" 
          />
        </div>

        {/* SEARCH: Preparing for Item 4 (Backend API Search) 
        <div className="hidden md:flex items-center bg-zinc-100 px-5 py-2.5 rounded-full w-full max-w-sm mx-8 border border-transparent focus-within:border-[#e11d48] transition-all">
          <Search size={18} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-transparent border-none outline-none text-xs font-bold ml-3 w-full text-zinc-900 placeholder:text-zinc-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>*/}

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAuthModal(true)} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:text-[#e11d48] transition-colors group"
          >
            <div className="p-2.5 bg-zinc-100 rounded-full group-hover:bg-rose-50 transition-colors">
              <User size={20} className="group-hover:text-[#e11d48]" />
            </div>
            <span className="hidden lg:block">{user ? user.name : 'Account'}</span>
          </button>
          
          <button 
            onClick={() => setShowCartDrawer(true)} 
            className="relative flex items-center group"
          >
            <div className="p-2.5 bg-zinc-100 rounded-full group-hover:bg-rose-50 transition-colors">
              <ShoppingCart size={20} className="text-zinc-900 group-hover:text-[#e11d48]" />
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e11d48] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* MAIN: Static Header */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="heading-hero italic">{UI_STRINGS.HERO_TITLE}</h1>
            <p className="text-zinc-500 text-sm border-l-4 border-[#e11d48] pl-4 uppercase tracking-widest font-bold">
              {UI_STRINGS.HERO_SUBTITLE}
            </p>
          </div>
          
          <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-6 py-2.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-widest ${
                  activeCategory === cat ? 'bg-zinc-900 text-white shadow-xl' : 'text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.productId} 
              product={product} 
              onSelect={setSelectedProduct} 
              onAdd={addToCart} 
            />
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-12 border-t border-zinc-100 bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© {APP_CONFIG.YEAR} {APP_CONFIG.NAME}{APP_CONFIG.SUFFIX} • {UI_STRINGS.FOOTER_TEXT}</p>
        <div className="flex gap-8 items-center">
          {/* <span className="text-[#e11d48] italic">{UI_STRINGS.SECURE_PAYMENT}</span>*/}
          <span className="text-zinc-900">Developed by {APP_CONFIG.DEVELOPER}</span>
        </div>
      </footer>

      {/* MODALS */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
      <CartDrawer isOpen={showCartDrawer} cart={cart} onClose={() => setShowCartDrawer(false)} onRemove={removeFromCart} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default App