import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import { APP_CONFIG } from '../../constants/appConstants';
import ProductFormModal from './ProductFormModal'; 
import Toast from './Toast'; // Ensure this matches your file path

export default function AdminDashboard() {
  /* --- 1. STATE MANAGEMENT --- */
  const [products, setProducts] = useState([]);      // The master list of inventory
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the Add/Edit popup
  const [selectedProduct, setSelectedProduct] = useState(null); // Data for the product being edited
  const [toast, setToast] = useState(null);           // Success/Error notification state

  // Fetch inventory immediately when the admin logs in
  useEffect(() => {
    fetchProducts();
  }, []);

  /* --- 2. DATA ACQUISITION --- */
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${APP_CONFIG.API_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /* --- 3. CRUD OPERATIONS (The Core Logic) --- */

  // --- TRIGGER FUNCTIONS ---
  
  const handleOpenAdd = () => {
    setSelectedProduct(null); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product); 
    setIsModalOpen(true);
  };

  // --- API OPERATIONS ---
  // SAVE (Create or Update)
  const handleSaveProduct = async (formData) => {
    try {
      // Security: Fetch the token to prove Admin identity to the backend
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const isEdit = !!selectedProduct; // If we have a selectedProduct, we are EDITING
      const url = isEdit 
        ? `${APP_CONFIG.API_URL}/products/${selectedProduct.productId}` 
        : `${APP_CONFIG.API_URL}/products`;
      
      // CRITICAL: Merge the productId into the body for PUT requests
      const payload = isEdit 
        ? { ...formData, productId: selectedProduct.productId } 
        : formData;

      // We use PUT for updates and POST for new items
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchProducts(); // Refresh the list
        setIsModalOpen(false); // Close the form
        showToast(isEdit ? "Product Updated" : "Product Created");
      } else {
        const errorData = await res.json();
        console.error("Server says:", errorData);
        showToast(errorData.message || "Save failed", "error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Connection Failed", "error");
    }
  };

  // DELETE
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch(`${APP_CONFIG.API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // UI update: Remove from local state immediately
        setProducts(prev => prev.filter(p => p.productId !== productId));
        showToast("Product Deleted", "success");
      } else {
        showToast("Server denied deletion", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Delete Failed", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-zinc-900 text-white p-6 flex flex-col">
        <h2 className="text-xl font-black italic tracking-tighter mb-8">
          ELECTROTECH ADMIN
        </h2>

        <div className="pt-6 border-t border-zinc-800">
          <Link 
            to="/" 
            className="flex items-center gap-3 w-full p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg font-bold transition-all group"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" /> 
            <span>Main Store</span>
          </Link>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {/* Active Inventory Link */}
          <button className="flex items-center gap-3 w-full p-3 bg-rose-600 rounded-lg font-bold transition-all">
            <Package size={20} /> Inventory
          </button>
          <button className="flex items-center gap-3 w-full p-3 bg-rose-600 rounded-lg font-bold transition-all">
            <Package size={20} /> Manage User
          </button>
          {/* Future links like Orders or Users can go here */}

        </nav>
        
      </aside>
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">Inventory</h1>
            <p className="text-zinc-500 font-medium">Manage your products and stock levels</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-xl active:scale-95"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
        {/* --- INVENTORY TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-zinc-200">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-white">
              <tr>
                <th className="p-6 uppercase text-[10px] font-black tracking-[0.2em]">Product Details</th>
                <th className="p-6 uppercase text-[10px] font-black tracking-[0.2em]">Category</th>
                <th className="p-6 uppercase text-[10px] font-black tracking-[0.2em]">Price</th>
                <th className="p-6 uppercase text-[10px] font-black tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => (
                <tr key={product.productId} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="font-bold text-zinc-900">{product.name}</div>
                    <div className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-xs">{product.description}</div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-6 font-black text-rose-600">${product.price}</td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      {/* EDIT TRIGGER */}
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        className="p-3 hover:bg-zinc-900 hover:text-white rounded-xl text-zinc-400 transition-all active:scale-90"
                      >
                        <Edit size={18} />
                      </button>
                      {/* DELETE TRIGGER */}
                      <button 
                        onClick={() => handleDeleteProduct(product.productId)}
                        className="p-3 hover:bg-rose-50 rounded-xl text-rose-600 transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveProduct}
        product={selectedProduct} 
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}