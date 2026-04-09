import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query } from '../../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, []);

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  const data = [
    { name: 'Completed', value: completedOrders },
    { name: 'Pending', value: totalOrders - completedOrders },
  ];
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-sm text-on-surface-variant uppercase">Total Sales</h3>
          <p className="text-3xl font-bold text-primary">₱{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-sm text-on-surface-variant uppercase">Total Orders</h3>
          <p className="text-3xl font-bold text-primary">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-sm text-on-surface-variant uppercase">Completed Orders</h3>
          <p className="text-3xl font-bold text-primary">{completedOrders}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm h-80">
        <h3 className="font-bold text-primary mb-4">Order Status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
