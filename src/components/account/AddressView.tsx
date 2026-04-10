import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Loader2, X, Phone } from 'lucide-react';
import { auth, db, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from '../../lib/firebase';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
  uid: string;
}

export default function AddressView() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [label, setLabel] = useState('');
  const [cluster, setCluster] = useState('');
  const [building, setBuilding] = useState('');
  const [unit, setUnit] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Sync Phone Number
    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setPhone(docSnap.data().phoneNumber || '');
      }
    });

    // Sync Addresses
    const addressesRef = collection(db, 'users', user.uid, 'addresses');
    const unsubAddr = onSnapshot(addressesRef, (snapshot) => {
      const addressesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];
      setAddresses(addressesData);
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubAddr();
    };
  }, []);

  const handleUpdatePhone = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSavingPhone(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { phoneNumber: phone });
    } catch (err) {
      console.error('Error updating phone:', err);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleOpenModal = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setLabel(addr.label);
      const parts = addr.address.split(' ');
      setCluster(parts[0] || '');
      setBuilding(parts[1] || '');
      setUnit(parts[2] || '');
      setIsDefault(addr.isDefault);
    } else {
      setEditingAddress(null);
      setLabel('');
      setCluster('');
      setBuilding('');
      setUnit('');
      setIsDefault(addresses.length === 0);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Validate unit: 3 digits, 1-7 starting, 1-24 max
    if (!/^[1-7](0[1-9]|1[0-9]|2[0-4])$/.test(unit)) {
      alert('Unit number must be 3 digits: 1st digit 1-7, last 2 digits 01-24.');
      return;
    }

    setSaving(true);
    try {
      const addressesRef = collection(db, 'users', user.uid, 'addresses');
      
      // If this is set as default, unset others
      if (isDefault) {
        for (const addr of addresses) {
          if (addr.id !== editingAddress?.id && addr.isDefault) {
            await updateDoc(doc(addressesRef, addr.id), { isDefault: false });
          }
        }
      }

      const addressData = {
        uid: user.uid,
        label,
        address: `${cluster} ${building} ${unit}`,
        isDefault
      };

      if (editingAddress) {
        await updateDoc(doc(addressesRef, editingAddress.id), addressData);
      } else {
        const newDocRef = doc(addressesRef);
        await setDoc(newDocRef, addressData);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
    } catch (err) {
      console.error('Error deleting address:', err);
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
    <div className="space-y-8">
      {/* Phone Number Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-low">
        <label className="block text-xs font-bold text-secondary mb-3 uppercase tracking-wider">Contact Number</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface p-3 rounded-xl border border-surface-container-low focus-within:border-primary transition-all">
            <Phone className="text-primary" size={20} />
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full bg-transparent outline-none text-sm font-medium"
              placeholder="09XX XXX XXXX"
            />
          </div>
          <button 
            onClick={handleUpdatePhone}
            disabled={savingPhone}
            className="bg-primary text-white px-6 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {savingPhone ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Saved Addresses</label>
        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-surface-container-low">
            <MapPin size={48} className="text-stone-300 mx-auto mb-4" />
            <p className="text-sm text-on-surface-variant">No saved addresses yet.</p>
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low flex items-start justify-between">
              <div className="flex gap-3">
                <MapPin className="text-primary mt-1" size={20} />
                <div className="text-left">
                  <h4 className="font-bold text-primary text-sm">
                    {addr.label} 
                    {addr.isDefault && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full ml-2">Default</span>}
                  </h4>
                  <p className="text-xs text-on-surface-variant">{addr.address}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(addr)} className="text-primary p-2 hover:bg-surface rounded-full transition-all"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(addr.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
      <button 
        onClick={() => handleOpenModal()}
        className="w-full flex items-center justify-center gap-2 bg-surface text-primary py-4 rounded-full font-bold border border-primary active:scale-95 transition-all"
      >
        <Plus size={20} /> Add New Address
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-primary">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Label (e.g. Home, Work)</label>
                <input 
                  type="text" 
                  required 
                  value={label} 
                  onChange={e => setLabel(e.target.value)} 
                  className="w-full p-3 rounded-xl bg-surface border border-surface-container-low focus:border-primary outline-none transition-all"
                  placeholder="Home"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Cluster</label>
                  <input type="text" required value={cluster} onChange={e => setCluster(e.target.value)} className="w-full p-3 rounded-xl bg-surface border border-surface-container-low focus:border-primary outline-none transition-all" placeholder="Seine" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Bldg</label>
                  <input type="text" required value={building} onChange={e => setBuilding(e.target.value)} className="w-full p-3 rounded-xl bg-surface border border-surface-container-low focus:border-primary outline-none transition-all" placeholder="A" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Unit</label>
                  <input type="text" required value={unit} onChange={e => setUnit(e.target.value)} className="w-full p-3 rounded-xl bg-surface border border-surface-container-low focus:border-primary outline-none transition-all" placeholder="101" maxLength={3} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={isDefault} 
                  onChange={e => setIsDefault(e.target.checked)} 
                  className="w-5 h-5 rounded border-surface-container-low text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-sm font-bold text-primary">Set as default address</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-surface text-primary py-3 rounded-full font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-3 rounded-full font-bold shadow-md disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
