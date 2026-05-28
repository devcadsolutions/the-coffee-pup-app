import React, { useState, useEffect, useRef } from 'react';
import { db, collection, onSnapshot, query, doc, updateDoc, deleteDoc } from '../../lib/firebase';
import { Search, Eye, Trash2, Printer, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendLocalNotification, requestNotificationPermission } from '../../lib/notifications';
import { auth } from '../../lib/firebase';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const isInitialLoad = useRef(true);

  const statuses = ['Pending', 'Preparing', 'Out for Delivery', 'Completed', 'Cancelled'];

  useEffect(() => {
    if (auth.currentUser) {
      requestNotificationPermission(auth.currentUser.uid);
    }

    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side sort by date to avoid composite index limits
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Notify admin of new orders
      if (!isInitialLoad.current && snapshot.docChanges().some(change => change.type === 'added')) {
        const newOrder = snapshot.docChanges().find(change => change.type === 'added')?.doc.data() as any;
        if (newOrder) {
          sendLocalNotification(
            'New Order Received!', 
            `${newOrder.customerName} placed an order for ₱${newOrder.total.toFixed(2)}`,
            '/admin/orders'
          );
        }
      }
      
      // Notify admin of payment updates
      if (!isInitialLoad.current) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'modified') {
            const updatedOrder = change.doc.data() as any;
            const oldOrder = orders.find(o => o.id === change.doc.id);
            if (oldOrder && oldOrder.paymentStatus !== updatedOrder.paymentStatus && updatedOrder.paymentStatus === 'paid') {
              sendLocalNotification(
                'Payment Verified', 
                `Order #${updatedOrder.orderId.split('_')[1]} has been marked as paid.`,
                '/admin/orders'
              );
            }
          }
        });
      }

      setOrders(ordersData);
      isInitialLoad.current = false;
    });
    return unsubscribe;
  }, [orders.length]);

  const filteredOrders = orders.filter(order => 
    (filterStatus === 'All Status' || order.status === filterStatus) &&
    (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || order.orderId.includes(searchTerm))
  );

  const updateStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteDoc(doc(db, 'orders', orderId));
      setSelectedOrder(null);
    }
  };

  const printReceipt = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const itemsHtml = order.items.map((item: any) => `
      <div style="display: flex; justify-between; margin-bottom: 5px;">
        <span>${item.quantity}x ${item.name} (${item.customizations.variantName})</span>
        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
      </div>
      ${item.customizations.selectedModifiers.length > 0 ? `
        <div style="font-size: 10px; color: #666; margin-left: 20px; margin-bottom: 5px;">
          ${item.customizations.selectedModifiers.map((m: any) => `+ ${m.option.name}`).join(', ')}
        </div>
      ` : ''}
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${order.orderId}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 12px; }
            .item { font-size: 12px; }
            .total { font-weight: bold; font-size: 14px; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>The Coffee Pup</h2>
            <p>Order: ${order.orderId.split('_')[1]}</p>
            <p>${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="item">
            ${itemsHtml}
          </div>
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span>₱${order.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Delivery:</span>
              <span>₱${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; margin-top: 5px;">
              <span>TOTAL:</span>
              <span>₱${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Customer: ${order.customerName}</p>
            <p>Contact: ${order.phoneNumber}</p>
            <p>Address: ${order.address}</p>
            <p>Thank you for ordering!</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">Orders Management</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4 py-2.5 rounded-xl border border-surface-container-high w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-xs" 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="px-4 py-2.5 rounded-xl border border-surface-container-high bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
          >
            <option>All Status</option>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col border border-surface-container-low">
        {/* Mobile View: Stacked Order Cards */}
        <div className="md:hidden divide-y divide-stone-50 overflow-y-auto max-h-[60vh] p-2 space-y-3">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 flex flex-col gap-3">
              {/* Top & Most Evident: Status and Price */}
              <div className="flex justify-between items-center">
                <select 
                  value={order.status} 
                  onChange={e => updateStatus(order.id, e.target.value)} 
                  className={`p-2 rounded-xl border text-[10px] font-black uppercase transition-colors bg-white ${
                    order.status === 'Completed' ? 'border-green-200 text-green-700' :
                    order.status === 'Cancelled' ? 'border-red-200 text-red-700' :
                    order.status === 'Out for Delivery' ? 'border-blue-200 text-blue-700' :
                    order.status === 'Preparing' ? 'border-orange-200 text-orange-700' :
                    'border-stone-200 text-stone-700'
                  }`}
                >
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
                <span className="font-black text-primary text-sm">₱{order.total.toFixed(2)}</span>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-black text-primary text-xs">{order.customerName}</h4>
                <p className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Bottom & Last: Order ID & Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-stone-100/50">
                <span className="text-[9px] font-mono text-stone-400">Order: #{order.orderId.split('_')[1]}</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 text-primary bg-white hover:bg-stone-100 rounded-lg border border-stone-100" title="View Details">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => printReceipt(order)} className="p-2 text-stone-600 bg-white hover:bg-stone-100 rounded-lg border border-stone-100" title="Print Receipt">
                    <Printer size={14} />
                  </button>
                  <button onClick={() => deleteOrder(order.id)} className="p-2 text-red-500 bg-white hover:bg-red-50 rounded-lg border border-stone-100" title="Delete Order">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Responsive Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-on-surface-variant text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold text-center">Actions</th>
                <th className="p-4 font-bold text-right">Order #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-4">
                    <select 
                      value={order.status} 
                      onChange={e => updateStatus(order.id, e.target.value)} 
                      className={`p-1.5 rounded-lg border text-xs font-bold uppercase transition-colors bg-white ${
                        order.status === 'Completed' ? 'border-green-200 text-green-700' :
                        order.status === 'Cancelled' ? 'border-red-200 text-red-700' :
                        order.status === 'Out for Delivery' ? 'border-blue-200 text-blue-700' :
                        order.status === 'Preparing' ? 'border-orange-200 text-orange-700' :
                        'border-stone-200 text-stone-700'
                      }`}
                    >
                      {statuses.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-sm">{order.customerName}</div>
                    <div className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 font-bold text-sm">₱{order.total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => printReceipt(order)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors" title="Print Receipt">
                        <Printer size={16} />
                      </button>
                      <button onClick={() => deleteOrder(order.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-xs font-bold text-primary">
                    #{order.orderId.split('_')[1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-stone-400">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-primary">Order Details</h3>
                <p className="text-stone-400 font-mono text-sm">#{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-400">
                <ChevronRight className="rotate-95" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Customer Information</h4>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{selectedOrder.customerName}</p>
                    <p className="text-primary font-medium">{selectedOrder.phoneNumber}</p>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Delivery/Pickup Address</h4>
                  <p className="text-sm leading-relaxed bg-surface p-3 rounded-xl border border-surface-container-low">
                    {selectedOrder.address}
                    <span className="block mt-1 text-[10px] font-bold uppercase text-primary">Type: {selectedOrder.type}</span>
                  </p>
                </section>

                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Payment Details</h4>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold uppercase text-xs">
                      {selectedOrder.paymentMethod}
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-bold uppercase text-xs ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {selectedOrder.paymentStatus}
                    </div>
                  </div>
                </section>
                
                {selectedOrder.notes && (
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Notes</h4>
                    <p className="text-sm italic text-stone-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                      "{selectedOrder.notes}"
                    </p>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start gap-4 pb-3 border-b border-surface-container-low last:border-0">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.quantity}x {item.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase">{item.customizations.variantName}</p>
                          {item.customizations.selectedModifiers.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.customizations.selectedModifiers.map((m: any) => (
                                <span key={m.option.id} className="text-[9px] bg-surface px-1.5 py-0.5 rounded border border-surface-container-high text-stone-500">
                                  + {m.option.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-sm">₱{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-primary text-white p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs opacity-80">
                    <span>Subtotal</span>
                    <span>₱{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-xs opacity-80 text-secondary">
                      <span>Discount ({selectedOrder.discountCode})</span>
                      <span>-₱{selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs opacity-80">
                    <span>Delivery Fee</span>
                    <span>₱{selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/20">
                    <span>Total</span>
                    <span>₱{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => printReceipt(selectedOrder)} 
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold transition-colors"
              >
                <Printer size={20} /> Print Receipt
              </button>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
