import { X, ShoppingCart, Package, Trash2, CreditCard } from 'lucide-react'

export default function CartDrawer({ isOpen, onClose, cart, onRemove }) {
  if (!isOpen) return null;
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <ShoppingCart className="text-[--color-primary]" /> My Cart
          </h2>
          <button onClick={onClose} className="hover:text-[--color-primary] transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50">
              <Package size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.productId} className="flex gap-4 items-center bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <img src={item.imageUrl || item.images?.[0]} className="w-16 h-16 rounded-lg object-cover" alt={item.name} />
              <div className="flex-grow">
                <h4 className="font-bold text-xs uppercase leading-tight">{item.name}</h4>
                <p className="text-[--color-primary] font-black text-sm">${item.price} <span className="text-zinc-400 text-[10px]">x {item.qty}</span></p>
              </div>
              <button onClick={() => onRemove(item.productId)} className="text-zinc-300 hover:text-[--color-primary] transition-colors"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black uppercase tracking-widest text-zinc-400 text-xs">Total</span>
              <span className="text-3xl font-black text-zinc-900">${total.toFixed(2)}</span>
            </div>
            <button 
                  onClick={() => alert("Connecting to Stripe API Gateway...")}
                  className="w-full bg-zinc-900 text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl shadow-rose-600/10 uppercase tracking-[0.2em] text-xs"
                >
                  <CreditCard size={18} /> Check Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}