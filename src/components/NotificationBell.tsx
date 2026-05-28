import { useState, useEffect } from 'react';
import { Bell, X, Coffee, Package, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, orderBy, limit } from '../lib/firebase';
import { auth } from '../lib/firebase';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    // In a real app, we'd have a separate 'notifications' collection
    // For this minimal patch, we'll derive notifications from recent order status changes
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recentOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const newNotifications = recentOrders.map((order: any) => ({
        id: order.id,
        title: `Order #${(order.orderNumber || order.id || '').split('_')[1] || order.id || 'N/A'}`,
        body: `Your order is now ${order.status}`,
        status: order.status,
        time: order.updatedAt,
        orderId: order.id
      }));

      setNotifications(newNotifications);
      // Simple logic: if updated in the last 5 minutes, mark as unread
      const recentCount = newNotifications.filter((n: any) => 
        (Date.now() - new Date(n.time).getTime()) < 5 * 60 * 1000
      ).length;
      setUnreadCount(recentCount);
    });

    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'Preparing': return <Coffee size={16} className="text-orange-500" />;
      case 'On the way': return <Package size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-stone-400" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-primary relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[70]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 z-[80] overflow-hidden"
            >
              <div className="p-4 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Notifications</span>
                <button onClick={() => setIsOpen(false)} className="text-stone-300 hover:text-stone-500">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="mt-1">{getStatusIcon(n.status)}</div>
                        <div>
                          <p className="text-xs font-black text-primary">{n.title}</p>
                          <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{n.body}</p>
                          <p className="text-[8px] text-stone-300 font-black uppercase tracking-widest mt-2">
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell size={24} className="text-stone-100 mx-auto mb-2" />
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">No notifications</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
