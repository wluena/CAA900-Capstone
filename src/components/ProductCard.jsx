import { ShoppingCart } from 'lucide-react'

export default function ProductCard({ product, onSelect, onAdd }) {
  return (
    <div onClick={() => onSelect(product)} className="product-card group">
      <div className="aspect-square bg-zinc-100 overflow-hidden rounded-xl mb-4">
        <img 
          src={product.imageUrl} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>

      <div className="flex flex-col flex-grow">
        <span className="text-[10px] font-black text-[#e11d48] uppercase tracking-widest">
          {product.brand}
        </span>
        
        <h2 className="font-bold text-lg leading-tight mb-4 text-zinc-900">
          {product.name}
        </h2>

        <div className="mt-auto flex justify-between items-center border-t border-zinc-100 pt-4">
          <span className="text-2xl font-black text-zinc-900">${Number(product.price).toLocaleString()}</span>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onAdd(product); 
            }}
            className="cart-button-fixed"
          >
            <ShoppingCart size={20} color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}