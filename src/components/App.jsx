import React, { useState } from 'react'
import productData from './products.json'
import { ShoppingCart, Zap, LogIn } from 'lucide-react'

// UI COMPONENTS (Imported from your new /components folder)
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import AuthModal from './components/AuthModal'

function App() {
  // --- 1. STATE: UI & DATA ---
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [cart, setCart] = useState([]);

  // --- 2. LOGIC: CART ACTIONS ---
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* --- 3. NAVIGATION --- */}
      <nav className="border-b sticky top-0 bg-white/90 backdrop-blur-md z-40 h-16 flex items-center justify-between px-6">
        <div 
          className="flex items-center gap-2 text-[--color-primary] font-black text-2xl tracking-tighter cursor-pointer" 
          onClick={() => setActiveCategory('All')}
        >
          <Zap fill="currentColor" /> ELECTRO<span className="text-zinc-900">TECH</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setShowAuthModal(true)} className="nav-icon-btn">
            <LogIn size={18} /> <span className="hidden sm:block">Account</span>
          </button>
          
          <button onClick={() => setShowCartDrawer(true)} className="relative hover:text-[--color-primary] transition-colors">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[--color-primary] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* --- 4. MAIN STOREFRONT --- */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="heading-hero italic">Best Deals</h1>
            <p className="text-zinc-500 text-sm border-l-4 border-[--color-primary] pl-4 uppercase tracking-widest font-bold">
              2026 Performance Gear
            </p>
          </div>
          
          {/* CATEGORY SELECTOR */}
          <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 overflow-x-auto no-scrollbar">
            {['All', 'Mobile Phones', 'Laptops', 'Accessories'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-5 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* PRODUCT GRID: Filtered by category state */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productData.products
            .filter(p => activeCategory === 'All' || p.category === activeCategory)
            .map(product => (
              <ProductCard 
                key={product.productId} 
                product={product} 
                onSelect={setSelectedProduct} 
                onAdd={addToCart} 
              />
            ))}
        </div>
      </main>

      {/* --- 5. MODALS & OVERLAYS --- */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAdd={addToCart} 
      />
      
      <CartDrawer 
        isOpen={showCartDrawer} 
        cart={cart} 
        onClose={() => setShowCartDrawer(false)} 
        onRemove={removeFromCart} 
      />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* --- 6. FOOTER --- */}
      <footer className="p-12 border-t border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 ElectroTech Store</p>
        <div className="flex gap-8 items-center">
          <span className="text-[--color-primary] italic">Secure Payments via Stripe</span>
          <span className="text-zinc-900">Developed by WJL</span>
        </div>
      </footer>
    </div>
  )
}

export default App