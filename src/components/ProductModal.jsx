import { X, ChevronLeft, ChevronRight, Box, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

export default function ProductModal({ product, onClose, onAdd }) {
  const [imgIndex, setImgIndex] = useState(0);
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/95 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="md:w-1/2 bg-zinc-50 flex items-center justify-center p-12 relative border-r border-zinc-100">
          <img src={product.images?.[imgIndex] || product.imageUrl} className="max-h-[400px] w-full object-contain" alt="Product" />
          {product.images?.length > 1 && (
            <div className="absolute inset-x-6 flex justify-between top-1/2 -translate-y-1/2">
              <button onClick={() => setImgIndex(prev => (prev === 0 ? product.images.length-1 : prev-1))} className="p-3 bg-white hover:bg-[--color-primary] hover:text-white rounded-full transition-all shadow-md"><ChevronLeft /></button>
              <button onClick={() => setImgIndex(prev => (prev === product.images.length-1 ? 0 : prev+1))} className="p-3 bg-white hover:bg-[--color-primary] hover:text-white rounded-full transition-all shadow-md"><ChevronRight /></button>
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-12 flex flex-col overflow-y-auto text-left">
          <button onClick={onClose} className="self-end text-zinc-400 hover:text-[--color-primary] mb-6 transition-colors"><X size={28} /></button>
          <span className="text-[--color-primary] font-black text-xs uppercase tracking-[0.3em] mb-2">{product.brand} • {product.model}</span>
          <h2 className="text-4xl font-black mb-4 leading-none italic uppercase tracking-tighter">{product.name}</h2>
          
          <div className="flex gap-3 mb-8">
            <div className="data-badge"><Box size={14}/> Stock: {product.stock}</div>
            <div className="data-badge"><ShieldCheck size={14}/> {product.warranty}</div>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed mb-10">{product.description}</p>
          <div className="mt-auto pt-8 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-4xl font-black text-zinc-900">${product.price}</span>
            <button onClick={() => { onAdd(product); onClose(); }} className="btn-primary">Add To Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}