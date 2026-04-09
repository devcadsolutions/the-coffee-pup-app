import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Total Orders</h2>
          <p className="text-3xl font-bold text-primary">123</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Pending Orders</h2>
          <p className="text-3xl font-bold text-primary">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold">Total Revenue</h2>
          <p className="text-3xl font-bold text-primary">₱12,345</p>
        </div>
      </div>
    </div>
  );
}
