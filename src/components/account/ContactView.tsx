import { useState, useEffect } from 'react';
import { Phone, Loader2 } from 'lucide-react';
import { auth, db, doc, onSnapshot, updateDoc } from '../../lib/firebase';

export default function ContactView() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhone(data.phoneNumber || '');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { phoneNumber: phone });
    } catch (err) {
      console.error('Error updating phone number:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-low">
        <label className="block text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Phone Number</label>
        <div className="flex items-center gap-2">
          <Phone className="text-primary" size={20} />
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className="w-full p-3 rounded-xl bg-surface border border-surface-container-low focus:border-primary outline-none transition-all"
            placeholder="09XX XXX XXXX"
          />
        </div>
        <p className="text-[10px] text-on-surface-variant mt-2">Format: 09XX XXX XXXX</p>
      </div>
      <button 
        onClick={handleUpdate}
        disabled={saving}
        className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? 'Updating...' : 'Update Phone Number'}
      </button>
    </div>
  );
}
