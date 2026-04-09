import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc } from '../../lib/firebase';
import { Plus, Trash2 } from 'lucide-react';

export default function AddonManagement() {
  const [addons, setAddons] = useState<any[]>([]);
  const [newAddon, setNewAddon] = useState({ name: '', price: 0, category: 'Milk' });

  useEffect(() => {
    const q = query(collection(db, 'addons'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAddons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newAddon.name.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, 'addons', id), { ...newAddon, updatedAt: new Date().toISOString() });
    setNewAddon({ name: '', price: 0, category: 'Milk' });
  };

  const deleteAddon = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this add-on?')) {
      await deleteDoc(doc(db, 'addons', id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Add-on Management</h2>
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <input type="text" placeholder="Name" value={newAddon.name} onChange={e => setNewAddon({...newAddon, name: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="number" placeholder="Price" value={newAddon.price} onChange={e => setNewAddon({...newAddon, price: parseFloat(e.target.value)})} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Category" value={newAddon.category} onChange={e => setNewAddon({...newAddon, category: e.target.value})} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg flex items-center justify-center gap-2"><Plus size={18} /> Add Add-on</button>
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
            {addons.map(addon => (
              <tr key={addon.id} className="border-t">
                <td className="p-4">{addon.name}</td>
                <td className="p-4">{addon.category}</td>
                <td className="p-4">₱{addon.price.toFixed(2)}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => deleteAddon(addon.id)} className="text-error"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
