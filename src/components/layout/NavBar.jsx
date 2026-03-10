import React from 'react';
import { ShoppingCart } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function NavBar({ 
  cartCount, 
  authUser, 
  onSignOut, 
  onOpenCart, 
  onOpenOrders, 
  onOpenAuth 
}) {
  
  // Extract email carefully from the Amplify user object
  const userEmail = authUser?.signInDetails?.loginId || authUser?.attributes?.email || 'Member';

  return (
    <nav className="border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-40 h-20 flex items-center justify-between px-8">
      {/* Brand Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <img src={logoImg} alt="ElectroTech Logo" className="h-10 md:h-12 w-auto object-contain" />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {authUser ? (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
            {/* My Orders Button */}
            <button 
            onClick={onOpenOrders} // <--- This MUST match the prop name in App.jsx
            className="text-[10px] font-black uppercase tracking-widest hover:text-rose-600"
            >
            My Orders
            </button>

            {/* User Profile Info */}
            <div className="flex flex-col items-end border-l pl-6 border-zinc-200">
              <span className="text-[10px] font-black uppercase tracking-tight text-zinc-900">
                {userEmail}
              </span>
              <button 
                onClick={onSignOut} 
                className="text-[9px] text-rose-500 font-bold hover:underline tracking-widest uppercase transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          /* Guest Sign In Button */
          <button 
            onClick={onOpenAuth} 
            className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-6 py-2.5 rounded-full hover:bg-rose-600 transition-all active:scale-95"
          >
            Sign In
          </button>
        )}
        
        {/* Cart Trigger */}
        <button 
          onClick={onOpenCart} 
          className="p-3 bg-zinc-100 rounded-full relative hover:bg-zinc-200 transition-all active:scale-90"
        >
          <ShoppingCart size={20} className="text-zinc-900" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}