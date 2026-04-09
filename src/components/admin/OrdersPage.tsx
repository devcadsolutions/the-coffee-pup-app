import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from '../../lib/firebase';
import { Search, Filter, Eye, Trash2, Printer } from 'lucide-react';

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
    printWindow?.document.write(`
      <html>
        <head><title>Receipt ${order.orderNumber}</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>Receipt: ${order.orderNumber}</h1>
          <p>Customer: ${order.customerName}</p>
          <p>Total: ₱${order.total.toFixed(2)}</p>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Orders</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 rounded-lg border" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-lg border">
            <option>All</option>
            {['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface text-on-surface-variant text-xs uppercase">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="p-4 font-bold cursor-pointer text-primary" onClick={() => setSelectedOrder(order)}>{order.orderNumber}</td>
                <td className="p-4">{order.customerName}</td>
                <td className="p-4">₱{order.total.toFixed(2)}</td>
                <td className="p-4">
                  <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="p-1 rounded border">
                    {['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4"><button onClick={() => setSelectedOrder(order)} className="text-primary"><Eye /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg space-y-4">
            <h3 className="text-xl font-bold">Order Details: {selectedOrder.orderNumber}</h3>
            <p>Customer: {selectedOrder.customerName}</p>
            <p>Total: ₱{selectedOrder.total.toFixed(2)}</p>
            <div className="flex gap-2">
              <button onClick={() => printReceipt(selectedOrder)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 rounded-lg"><Printer size={18} /> Print</button>
              <button onClick={() => deleteOrder(selectedOrder.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-error text-white rounded-lg"><Trash2 size={18} /> Delete</button>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="w-full py-2 bg-primary text-white rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
