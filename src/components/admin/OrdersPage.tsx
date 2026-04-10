import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from '../../lib/firebase';
import { Search, Filter, Eye, Trash2, Printer, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
    return unsubscribe;
  }, []);

  const filteredOrders = orders.filter(order => 
    (filterStatus === 'All' || order.status === filterStatus) &&
    (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || order.orderNumber.includes(searchTerm))
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
          <title>Receipt ${order.orderNumber}</title>
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
            <p>Order: ${order.orderNumber}</p>
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
    <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
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
              className="pl-10 pr-4 py-2 rounded-lg border border-surface-container-high w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="px-4 py-2 rounded-lg border border-surface-container-high bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All Status</option>
            {['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col border border-surface-container-low">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-on-surface-variant text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold">Order #</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-4 font-bold text-primary">
                    <button onClick={() => setSelectedOrder(order)} className="hover:underline">
                      #{order.orderNumber.split('_')[1]}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 font-bold">₱{order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <select 
                      value={order.status} 
                      onChange={e => updateStatus(order.id, e.target.value)} 
                      className={`p-1.5 rounded-lg border text-xs font-bold uppercase transition-colors ${
                        order.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                    >
                      {['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => printReceipt(order)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors" title="Print Receipt">
                        <Printer size={18} />
                      </button>
                      <button onClick={() => deleteOrder(order.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-stone-400">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p>No orders found matching your criteria.</p>
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
                <p className="text-stone-400 font-mono text-sm">#{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <Trash2 className="rotate-45" size={24} />
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
