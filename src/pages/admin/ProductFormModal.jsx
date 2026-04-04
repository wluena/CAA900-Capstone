import React, { useState, useEffect } from 'react';
import { X, Save, PackagePlus } from 'lucide-react';
// Using standard inputs for maximum control, but keeping the styling consistent
export default function ProductFormModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    isFeatured: false,
    description: '',
    imageUrl: '',
    stock: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        isFeatured: product.isFeatured === true || product.isFeatured === 'true'
      });
    } else {
      setFormData({ 
        name: '', price: '', category: '', brand: '', 
        isFeatured: false, description: '', imageUrl: '', stock: '' 
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure numbers are actually numbers before saving
    const finalData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-zinc-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PackagePlus className="text-rose-500" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Product Name</label>
              <input 
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price ($)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stock</label>
              <input 
                type="number"
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Brand</label>
              <input
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</label>
              <input 
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</label>
              <textarea 
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Image URL</label>
              <textarea 
                className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all min-h-[80px]"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                required
              />
            </div>
            <div className="col-span-2 flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <input 
                type="checkbox"
                id="isFeatured"
                className="w-5 h-5 accent-rose-500 rounded"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
              />
              <label htmlFor="isFeatured" className="text-xs font-bold uppercase tracking-widest text-zinc-700 cursor-pointer">
                Enable to feature this product
              </label>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-900 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={16} /> {product ? 'Update Details' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
}