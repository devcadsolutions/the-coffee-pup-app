import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc } from '../../lib/firebase';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: 0, category: 'Coffee', description: '', available: true });

  useEffect(() => {
    const q = query(collection(db, 'menu_items'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newItem.name.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, 'menu_items', id), { ...newItem, updatedAt: new Date().toISOString() });
    setNewItem({ name: '', price: 0, category: 'Coffee', description: '', available: true });
  };

  const deleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'menu_items', id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Menu Management</h2>
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <input type="text" placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full p-2 border rounded" required />
        <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-2 border rounded">
          {['Coffee', 'Signature Drinks', 'Matcha', 'Non-Coffee', 'Milk Tea', 'Soda Pop', 'Toast', 'Pastries', 'Cakes'].map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg flex items-center justify-center gap-2"><Plus size={18} /> Add Item</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface text-on-surface-variant text-xs uppercase">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4">₱{item.price.toFixed(2)}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => deleteItem(item.id)} className="text-error"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
