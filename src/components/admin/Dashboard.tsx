import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot } from '../../lib/firebase';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Total Orders</h2>
          <p className="text-3xl font-bold text-primary">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Pending Orders</h2>
          <p className="text-3xl font-bold text-primary">{pendingOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Total Revenue</h2>
          <p className="text-3xl font-bold text-primary">₱{totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
