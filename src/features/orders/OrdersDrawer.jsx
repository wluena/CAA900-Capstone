import { Package, Calendar, ChevronRight, X } from 'lucide-react';

export default function OrdersDrawer({ isOpen, onClose, orders = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Drawer Panel */}
      <div className="relative w-screen max-w-md bg-zinc-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="p-6 border-b bg-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">My Orders</h2>
            <p className="text-[9px] text-rose-500 font-bold tracking-widest uppercase">ElectroTech History</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {orders.length === 0 ? (
            <div className="text-center py-32">
              <Package className="mx-auto text-zinc-200 mb-4" size={64} strokeWidth={1} />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.orderId} 
                className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 group hover:border-rose-200 transition-all duration-300"
              >
                {/* Order Top Bar */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">
                      {order.status || 'PROCESSED'}
                    </span>
                    <h3 className="text-[10px] font-bold text-zinc-400 block uppercase tracking-tight">
                      #{order.orderId.replace('STRIPE-', '')}
                    </h3>
                  </div>
                  <span className="text-lg font-black text-zinc-900 tracking-tighter">
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
                
                {/* Items List */}
                <div className="space-y-2 mb-4">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-zinc-600 font-medium">
                      <span className="flex gap-2">
                        <span className="font-bold text-zinc-400">{item.qty}x</span> 
                        <span className="truncate max-w-[180px]">{item.name}</span>
                      </span>
                      <span className="font-bold text-zinc-900">${item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-zinc-50 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Calendar size={12} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  {/*<button className="text-[10px] font-black text-zinc-900 group-hover:text-rose-600 flex items-center gap-1 transition-colors">
                    DETAILS <ChevronRight size={12} strokeWidth={3} />
                  </button>*/}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}