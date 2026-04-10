import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

export default function UserOrdersPage({ 
  cart, 
  onCheckout, 
  updateCartItemQuantity, 
  removeFromCart 
}: { 
  cart: CartItem[], 
  onCheckout: () => void,
  updateCartItemQuantity: (itemId: string, delta: number) => void,
  removeFromCart: (itemId: string) => void
}) {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'cart' | 'current' | 'past'>('cart');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Check for status changes to send notifications
      if (orders.length > 0) {
        ordersData.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            sendNotification(newOrder);
          }
        });
      }
      
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [orders.length]); // Use length to detect initial load vs updates

  const sendNotification = (order: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Status Update', {
        body: `Your order #${order.orderNumber.split('_')[1]} is now ${order.status}!`,
        icon: '/favicon.ico' // Or a specific coffee icon if available
      });
    }
  };

  const currentOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => {
      // Note: In a real app, we'd get the price from the product data
      // For now, we'll assume the price is stored in the item or we'd need to pass products
      // But since we are just moving logic, let's keep it simple or pass more props if needed.
      // Actually, let's just use the subtotal logic from CartPage if we can.
      return sum + (item.price || 0) * item.quantity;
    }, 0);
  };

  const renderContent = () => {
    if (activeTab === 'cart') {
      return (
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-bold text-primary">{item.name || 'Coffee Item'}</p>
                    <p className="text-xs text-on-surface-variant">{item.customizations.variantName}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button 
                        onClick={() => updateCartItemQuantity(item.id, -1)}
                        className="p-1 rounded-full bg-surface-container-low text-primary"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.id, 1)}
                        className="p-1 rounded-full bg-surface-container-low text-primary"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₱{((item.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-surface-container-low">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-primary">Total</span>
                  <span className="text-xl font-bold text-primary">₱{calculateCartTotal().toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20"
                >
                  Checkout Now
                </button>
              </div>
            </>
          )}
        </div>
      );
    }
    
    const ordersToShow = activeTab === 'current' ? currentOrders : pastOrders;
    return (
      <div className="space-y-4">
        {ordersToShow.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-primary">#{order.orderNumber.split('_')[1]}</p>
                <p className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-on-surface-variant mb-2">
              {order.items.map((item: any, i: number) => (
                <p key={i}>{item.quantity}x {item.name}</p>
              ))}
            </div>
            <p className="font-bold text-primary">Total: ₱{order.total.toFixed(2)}</p>
          </div>
        ))}
        {ordersToShow.length === 0 && (
          <div className="text-center py-10 text-on-surface-variant">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No {activeTab} orders found.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-20 pb-32 px-6">
      <h2 className="font-serif text-3xl font-bold text-primary mb-6">Orders</h2>
      
      <div className="flex bg-surface-container-low rounded-full p-1 mb-6">
        {['cart', 'current', 'past'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 rounded-full font-bold text-sm transition-all capitalize ${activeTab === tab ? 'bg-white shadow text-primary' : 'text-on-surface-variant'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
