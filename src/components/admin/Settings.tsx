import React, { useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc } from '../../lib/firebase';

export default function Settings() {
  const [settings, setSettings] = useState({ storeName: '', businessHours: '', open: true });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'business');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setSettings(docSnap.data() as any);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, 'settings', 'business'), settings);
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Settings</h2>
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <input type="text" placeholder="Store Name" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} className="w-full p-2 border rounded" />
        <input type="text" placeholder="Business Hours" value={settings.businessHours} onChange={e => setSettings({...settings, businessHours: e.target.value})} className="w-full p-2 border rounded" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={settings.open} onChange={e => setSettings({...settings, open: e.target.checked})} />
          Store is Open
        </label>
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg">Save Settings</button>
      </form>
    </div>
  );
}
