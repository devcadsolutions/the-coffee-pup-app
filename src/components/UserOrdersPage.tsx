import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, Trash2, Plus, Minus, Clock, CheckCircle2, XCircle, Coffee, Bell } from 'lucide-react';
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
    let unsubscribeUser: () => void = () => {};
    let unsubscribeLocal: () => void = () => {};
    
    const localOrderIds: string[] = (() => {
      try {
        const stored = localStorage.getItem('coffee_pup_placed_orders');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    })();

    const handleOrdersUpdate = (userId: string | null) => {
      unsubscribeUser();
      unsubscribeLocal();

      const userOrdersMap = new Map<string, any>();

      const updateMergedOrders = () => {
        const mergedList = Array.from(userOrdersMap.values());
        mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(mergedList);
      };

      // 1. Subscribe to logged-in user orders
      if (userId) {
        const qUser = query(collection(db, 'orders'), where('userId', '==', userId));
        unsubscribeUser = onSnapshot(qUser, (snapshot) => {
          snapshot.docs.forEach(doc => {
            userOrdersMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
          updateMergedOrders();
        });
      }

      // 2. Subscribe to guest orders placed on this device
      if (localOrderIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < localOrderIds.length; i += 10) {
          chunks.push(localOrderIds.slice(i, i + 10));
        }

        const unsubscribes = chunks.map(chunk => {
          const qLocal = query(collection(db, 'orders'), where('orderId', 'in', chunk));
          return onSnapshot(qLocal, (snapshot) => {
            snapshot.docs.forEach(doc => {
              userOrdersMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
            updateMergedOrders();
          });
        });

        unsubscribeLocal = () => {
          unsubscribes.forEach(unsub => unsub());
        };
      }
    };

    const unsubAuth = auth.onAuthStateChanged((user) => {
      handleOrdersUpdate(user ? user.uid : null);
    });

    return () => {
      unsubAuth();
      unsubscribeUser();
      unsubscribeLocal();
    };
  }, []);

  const currentOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed': return { color: 'text-green-600 bg-green-50/70', icon: CheckCircle2, label: 'Completed' };
      case 'Cancelled': return { color: 'text-red-600 bg-red-50/70', icon: XCircle, label: 'Cancelled' };
      case 'Preparing': return { color: 'text-orange-600 bg-orange-50/70', icon: Coffee, label: 'Preparing' };
      case 'Out for Delivery': return { color: 'text-blue-600 bg-blue-50/70', icon: Package, label: 'Out for Delivery' };
      default: return { color: 'text-stone-600 bg-stone-50/70', icon: Clock, label: 'Pending' };
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const renderContent = () => {
    if (activeTab === 'cart') {
      return (
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
              <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                <ShoppingCart size={24} />
              </div>
              <h3 className="font-black text-primary text-base mb-1">Your cart is empty</h3>
              <p className="text-xs text-stone-400 mb-6">Looks like you haven't added anything yet.</p>
              <button 
                onClick={() => {
                  const menuBtn = document.querySelector('button[onClick*="menu"]') as HTMLButtonElement;
                  if (menuBtn) menuBtn.click();
                }} 
                className="bg-primary text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider"
              >
                Go to Menu
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map(item => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-white p-4 rounded-[2rem] shadow-sm border border-stone-100/80 flex gap-4 items-center justify-between group transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-stone-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Coffee size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-black text-primary text-sm truncate pr-2">{item.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-stone-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2.5">
                        {item.customizations.variantName}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-stone-50 p-0.5 rounded-lg">
                          <button onClick={() => updateCartItemQuantity(item.id, -1)} className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center text-primary"><Minus size={12} /></button>
                          <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartItemQuantity(item.id, 1)} className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center text-primary"><Plus size={12} /></button>
                        </div>
                        <span className="font-black text-primary text-sm">
                          ₱{((item.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-primary text-white p-6 rounded-[2rem] shadow-lg shadow-primary/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-300 font-black uppercase tracking-widest text-[9px]">Total Amount</span>
                  <span className="text-xl font-black">₱{calculateCartTotal().toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-white text-primary py-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
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
      <div className="space-y-3">
        {ordersToShow.map(order => {
          const status = getStatusConfig(order.status);
          const StatusIcon = status.icon;
          return (
            <motion.div 
              layout
              key={order.id} 
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 group hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.color}`}>
                    <StatusIcon size={16} />
                  </div>
                  <div>
                    <h4 className="font-black text-primary text-xs">Order #{order.orderNumber.split('_')[1]}</h4>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-stone-600 font-medium">{item.quantity}x {item.name}</span>
                    <span className="text-stone-400 text-xs">₱{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-stone-50">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total Paid</span>
                <span className="font-black text-primary text-sm">₱{order.total.toFixed(2)}</span>
              </div>
            </motion.div>
          );
        })}
        {ordersToShow.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
              <Package size={24} />
            </div>
            <h3 className="font-black text-primary text-base mb-1">No {activeTab} orders</h3>
            <p className="text-xs text-stone-400">Your order history will appear here.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-4 pb-32 px-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="serif-display text-2xl font-black text-primary">Your Orders</h2>
        <div className="flex items-center gap-2">
          {Notification.permission !== 'granted' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => auth.currentUser && requestNotificationPermission(auth.currentUser.uid)}
              className="p-2 rounded-xl bg-secondary/10 text-secondary"
              title="Enable Notifications"
            >
              <Bell size={16} />
            </motion.button>
          )}
          <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
            {orders.length} Orders
          </div>
        </div>
      </div>
      
      <div className="flex bg-stone-100 rounded-2xl p-1 mb-6">
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${
                isActive ? 'bg-white shadow-sm text-primary' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon size={12} />
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
