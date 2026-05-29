import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Loader2 } from 'lucide-react';
import { auth, db, collection, query, onSnapshot, where } from '../../lib/firebase';

export default function OrderHistoryView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('uid', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      // Client-side sort by createdAt descending to avoid composite index limits
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={48} className="text-stone-300 mx-auto mb-4" />
        <h3 className="font-bold text-primary">No orders yet</h3>
        <p className="text-sm text-on-surface-variant">Your order history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const itemsSummary = Array.isArray(order.items)
          ? order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')
          : String(order.items || '');
        
        return (
          <button key={order.id} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low flex items-center justify-between text-left">
            <div>
              <h4 className="font-bold text-primary text-sm">Order #{order.orderNumber?.split('_')[1] || order.id?.split('_')[1] || order.id}</h4>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </p>
              <p className="text-xs text-on-surface-variant line-clamp-1 mb-1">{itemsSummary}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">₱{(order.total || 0).toFixed(2)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-on-surface-variant" />
          </button>
        );
      })}
    </div>
  );
}
