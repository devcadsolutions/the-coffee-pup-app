import React, { useState } from 'react';
import { products } from '../../data/mockData';
import { Trash2, Edit2 } from 'lucide-react';

export default function MenuManagement() {
  const [menuItems] = useState<any[]>(products);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Menu Management</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface text-on-surface-variant text-xs uppercase">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4 flex gap-2">
                  <button className="text-primary"><Edit2 size={18} /></button>
                  <button className="text-error"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
