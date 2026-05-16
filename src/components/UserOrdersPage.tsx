import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, Trash2, Plus, Minus, Clock, CheckCircle2, XCircle, ChevronRight, Coffee, Bell } from 'lucide-react';
import { CartItem } from '../types';
import { requestNotificationPermission, sendLocalNotification } from '../lib/notifications';

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
    // Disable order history fetching for local-only mode
    /*
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Check for status changes to send notifications
      if (orders.length > 0) {
        ordersData.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            sendLocalNotification(
              'Order Status Update', 
              `Your order #${newOrder.orderNumber.split('_')[1]} is now ${newOrder.status}!`
            );
          }
        });
      }
      
      setOrders(ordersData);
    });

    return () => unsubscribe();
    */
  }, []);

  const currentOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed': return { color: 'text-green-600 bg-green-50', icon: CheckCircle2, label: 'Completed' };
      case 'Cancelled': return { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Cancelled' };
      case 'Preparing': return { color: 'text-orange-600 bg-orange-50', icon: Coffee, label: 'Preparing' };
      case 'On the way': return { color: 'text-blue-600 bg-blue-50', icon: Package, label: 'On the way' };
      default: return { color: 'text-stone-600 bg-stone-50', icon: Clock, label: 'Pending' };
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const renderContent = () => {
    if (activeTab === 'cart') {
      return (
        <div className="space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm">
              <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={32} className="text-stone-300" />
              </div>
              <h3 className="font-black text-primary text-xl mb-2">Your cart is empty</h3>
              <p className="text-sm text-stone-500 mb-8">Looks like you haven't added anything yet.</p>
              <button onClick={() => window.location.hash = '#menu'} className="bg-primary text-white px-8 py-4 rounded-full font-black text-sm">Start Ordering</button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map(item => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex gap-4 items-center"
                  >
                    <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center text-primary">
                      <Coffee size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-primary">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">{item.customizations.variantName}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-stone-50 p-1 rounded-xl">
                          <button onClick={() => updateCartItemQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary"><Minus size={14} /></button>
                          <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartItemQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary"><Plus size={14} /></button>
                        </div>
                        <span className="font-black text-primary">₱{((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-stone-300 font-black uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-3xl font-black">₱{calculateCartTotal().toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-white text-primary py-5 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
                >
                  Confirm & Checkout
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
        {ordersToShow.map(order => {
          const status = getStatusConfig(order.status);
          const StatusIcon = status.icon;
          return (
            <motion.div 
              layout
              key={order.id} 
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 group hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                    <StatusIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-primary text-sm">Order #{order.orderNumber.split('_')[1]}</h4>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-stone-600 font-medium">{item.quantity}x {item.name}</span>
                    <span className="text-stone-400 text-xs">₱{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Total Paid</span>
                <span className="font-black text-primary text-lg">₱{order.total.toFixed(2)}</span>
              </div>
            </motion.div>
          );
        })}
        {ordersToShow.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm">
            <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-stone-300" />
            </div>
            <h3 className="font-black text-primary text-xl mb-2">No {activeTab} orders</h3>
            <p className="text-sm text-stone-500">Your order history will appear here.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="serif-display text-4xl font-black text-primary">Orders</h2>
        <div className="flex items-center gap-2">
          {Notification.permission !== 'granted' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => auth.currentUser && requestNotificationPermission(auth.currentUser.uid)}
              className="p-2 rounded-xl bg-secondary/10 text-secondary"
              title="Enable Notifications"
            >
              <Bell size={18} />
            </motion.button>
          )}
          <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {orders.length} Total
          </div>
        </div>
      </div>
      
      <div className="flex bg-stone-100 rounded-2xl p-1.5 mb-8">
        {[
          { id: 'cart', label: 'Cart', icon: ShoppingCart },
          { id: 'current', label: 'Active', icon: Clock },
          { id: 'past', label: 'History', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${
                isActive ? 'bg-white shadow-sm text-primary' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
