import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, Loader2 } from 'lucide-react';
import { CheckoutDetails } from '../types';
import { db, doc, getDoc, collection, getDocs } from '../lib/firebase';

const setCookie = (name: string, value: string, days: number = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
};

export default function CheckoutPage({ 
  onConfirm, 
  onCancel,
  total,
  user
}: { 
  onConfirm: (details: CheckoutDetails) => void, 
  onCancel: () => void,
  total: number,
  user?: any
}) {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'outside' | 'chateau' | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: getCookie('cp_name') || user?.displayName || '',
    deliveryMethod: 'Any' as 'Lalamove' | 'Grab' | 'MoveIt' | 'Any',
    pickupLocation: 'Uncle John\'s' as 'Uncle John\'s' | 'Eiffel Cluster Lobby' | 'Clubhouse',
    chateauCluster: 'Seine' as string,
    chateauBuilding: '' as 'A' | 'B' | 'C' | 'D',
    chateauUnit: '',
    contactNumber: getCookie('cp_contact') || '',
    notes: '',
    paymentMethod: 'gcash' as 'gcash' | 'maya',
    deliveryFee: 0
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      deliveryFee: deliveryType === 'outside' ? 50 : 0
    }));
  }, [deliveryType]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData(prev => ({
            ...prev,
            name: getCookie('cp_name') || userData.name || prev.name,
            contactNumber: getCookie('cp_contact') || userData.phoneNumber || prev.contactNumber
          }));
        }
      } catch (err) {
        console.error('Error fetching user data for checkout:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Load Saved Addresses
  useEffect(() => {
    const loadSavedAddresses = async () => {
      const list: any[] = [];

      // 1. Get from localStorage
      try {
        const localSaved = localStorage.getItem('coffee_pup_saved_addresses');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            list.push(...parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }

      // 2. Get from Firestore
      if (user?.uid) {
        try {
          const addressesRef = collection(db, 'users', user.uid, 'addresses');
          const snap = await getDocs(addressesRef);
          snap.forEach(doc => {
            const data = doc.data();
            const parts = (data.address || '').split(' ');
            list.push({
              id: 'fs_' + doc.id,
              label: data.label || 'Saved Chateau Address',
              type: 'chateau',
              chateauCluster: parts[0] || 'Seine',
              chateauBuilding: parts[1] || 'A',
              chateauUnit: parts[2] || '',
              isDefault: data.isDefault || false,
              name: user.displayName || '',
              contactNumber: formData.contactNumber || ''
            });
          });
        } catch (err) {
          console.error('Error fetching addresses from Firestore:', err);
        }
      }

      // De-duplicate
      const uniqueList: any[] = [];
      const seen = new Set();
      for (const item of list) {
        let key = '';
        if (item.type === 'chateau') {
          key = `chateau_${item.chateauCluster}_${item.chateauBuilding}_${item.chateauUnit}`;
        } else if (item.type === 'pickup') {
          key = `pickup_${item.pickupLocation}`;
        } else {
          key = `outside_${item.deliveryMethod}`;
        }
        if (!seen.has(key)) {
          seen.add(key);
          uniqueList.push(item);
        }
      }
      setSavedAddresses(uniqueList);
    };

    loadSavedAddresses();
  }, [user, formData.contactNumber]);

  const applyAddress = (addr: any) => {
    setDeliveryType(addr.type);
    setFormData(prev => ({
      ...prev,
      name: addr.name || prev.name || user?.displayName || '',
      contactNumber: addr.contactNumber || prev.contactNumber || '',
      deliveryMethod: addr.deliveryMethod || prev.deliveryMethod || 'Any',
      pickupLocation: addr.pickupLocation || prev.pickupLocation || 'Uncle John\'s',
      chateauCluster: addr.chateauCluster || prev.chateauCluster || 'Seine',
      chateauBuilding: addr.chateauBuilding || prev.chateauBuilding || 'A',
      chateauUnit: addr.chateauUnit || prev.chateauUnit || '',
      notes: addr.notes || prev.notes || ''
    }));
  };

  const clusters = ['Concorde', 'La Fayette', 'Eiffel', 'Seine', 'Vendome', 'Ritz'];
  const buildings = ['A', 'B', 'C', 'D'];

  const isFormValid = () => {
    if (!deliveryType) return false;
    if (!formData.name || !formData.contactNumber) return false;
    if (deliveryType === 'outside' && !formData.deliveryMethod) return false;
    if (deliveryType === 'pickup' && !formData.pickupLocation) return false;
    if (deliveryType === 'chateau' && (!formData.chateauCluster || !formData.chateauBuilding || !formData.chateauUnit)) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid() && deliveryType) {
      // Save details to cookies
      setCookie('cp_name', formData.name);
      setCookie('cp_contact', formData.contactNumber);

      // Save checkout address to localStorage
      try {
        const localSaved = localStorage.getItem('coffee_pup_saved_addresses');
        let list: any[] = [];
        if (localSaved) {
          list = JSON.parse(localSaved);
          if (!Array.isArray(list)) list = [];
        }

        const newAddr = {
          id: 'local_' + Date.now(),
          label: deliveryType === 'chateau' 
            ? `${formData.chateauCluster} ${formData.chateauBuilding} ${formData.chateauUnit}`
            : deliveryType === 'pickup' 
            ? `Pickup - ${formData.pickupLocation}`
            : `Outside - ${formData.deliveryMethod}`,
          type: deliveryType,
          ...formData
        };

        const getKey = (item: any) => {
          if (item.type === 'chateau') {
            return `chateau_${item.chateauCluster}_${item.chateauBuilding}_${item.chateauUnit}`;
          } else if (item.type === 'pickup') {
            return `pickup_${item.pickupLocation}`;
          } else {
            return `outside_${item.deliveryMethod}`;
          }
        };

        const currentKey = getKey(newAddr);
        list = list.filter(item => getKey(item) !== currentKey);
        list.unshift(newAddr);
        list = list.slice(0, 5);

        localStorage.setItem('coffee_pup_saved_addresses', JSON.stringify(list));
      } catch (err) {
        console.error('Error saving address:', err);
      }

      onConfirm({
        type: deliveryType,
        ...formData
      });
    }
  };

  return (
    <div className="space-y-6 pb-32 pt-4 max-w-lg mx-auto">
      {/* Header Bar */}
      <div className="flex items-center gap-4 px-2">
        <button onClick={onCancel} className="p-3 rounded-2xl bg-white text-primary shadow-sm hover:bg-stone-50 transition-colors border border-stone-100/50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="serif-display text-2xl font-black text-primary">Checkout</h2>
        {loading && <Loader2 className="text-primary animate-spin ml-auto" size={18} />}
      </div>

      {!deliveryType ? (
        <div className="space-y-6 px-2">
          {savedAddresses.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Use Saved Address</p>
              <div className="grid gap-2.5">
                {savedAddresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => applyAddress(addr)}
                    type="button"
                    className="bg-white p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all flex items-center justify-between text-left border border-stone-100 hover:border-primary/20 w-full"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h4 className="font-black text-primary text-xs flex items-center gap-1.5">
                          {addr.label}
                          {addr.isDefault && <span className="text-[8px] bg-secondary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Default</span>}
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          {addr.type === 'chateau' 
                            ? `Chateau Elysee - ${addr.chateauCluster} Bldg ${addr.chateauBuilding} Unit ${addr.chateauUnit}` 
                            : addr.type === 'pickup' 
                            ? `Pickup - ${addr.pickupLocation}` 
                            : `Outside - ${addr.deliveryMethod}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-secondary font-black uppercase tracking-widest bg-secondary/5 px-2.5 py-1.5 rounded-xl">Use This</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {savedAddresses.length > 0 ? 'Or Select Delivery/Pickup Option' : 'How would you like to receive your order?'}
            </p>
            <div className="grid gap-3">
              <button 
                onClick={() => setDeliveryType('pickup')}
                className="bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left border border-stone-100 hover:border-primary/20"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-primary text-sm">Pick-up</h3>
                  <p className="text-[11px] text-stone-400">Collect your order at our designated spot</p>
                </div>
              </button>

              <button 
                onClick={() => setDeliveryType('chateau')}
                className="bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left border border-stone-100 hover:border-primary/20"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-primary text-sm">Chateau Elysee Delivery</h3>
                  <p className="text-[11px] text-stone-400">Free delivery directly to your cluster lobby!</p>
                </div>
              </button>

              <button 
                onClick={() => setDeliveryType('outside')}
                className="bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left border border-stone-100 hover:border-primary/20"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-primary text-sm">Outside Delivery</h3>
                  <p className="text-[11px] text-stone-400">Delivery via Lalamove or Grab courier</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 px-2">
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-50">
              <h3 className="font-black text-primary text-sm">Order Details</h3>
              <button 
                type="button"
                onClick={() => setDeliveryType(null)}
                className="text-[10px] text-secondary font-black uppercase tracking-wider hover:underline"
              >
                Change Type
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter your name" className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs transition-all" />
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Contact Number</label>
                <input required type="tel" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="09XX XXX XXXX" className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs transition-all" />
              </div>

              {deliveryType === 'outside' ? (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Delivery Method</label>
                  <div className="flex flex-wrap gap-2">
                    {['Lalamove', 'Grab', 'MoveIt', 'Any'].map(m => (
                      <button 
                        key={m} 
                        type="button" 
                        onClick={() => setFormData({...formData, deliveryMethod: m as any})} 
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                          formData.deliveryMethod === m 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'bg-stone-50 text-stone-600 border border-stone-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ) : deliveryType === 'chateau' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Cluster</label>
                    <div className="flex flex-wrap gap-2">
                      {clusters.map(c => (
                        <button 
                          key={c} 
                          type="button" 
                          onClick={() => setFormData({...formData, chateauCluster: c})} 
                          className={`px-3 py-2 rounded-xl font-bold text-[10px] transition-all ${
                            formData.chateauCluster === c 
                              ? 'bg-primary text-white shadow-sm' 
                              : 'bg-stone-50 text-stone-600 border border-stone-100'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Building</label>
                    <div className="flex flex-wrap gap-2">
                      {buildings.map(b => (
                        <button 
                          key={b} 
                          type="button" 
                          onClick={() => setFormData({...formData, chateauBuilding: b as any})} 
                          className={`px-4 py-2 rounded-xl font-bold text-[10px] transition-all ${
                            formData.chateauBuilding === b 
                              ? 'bg-primary text-white shadow-sm' 
                              : 'bg-stone-50 text-stone-600 border border-stone-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Unit Number</label>
                    <input required type="text" value={formData.chateauUnit} onChange={e => setFormData({...formData, chateauUnit: e.target.value})} placeholder="e.g. 101" className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs transition-all" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Pick-up Location</label>
                  <div className="grid gap-2">
                    {['Uncle John\'s', 'Eiffel Cluster Lobby', 'Clubhouse'].map(l => (
                      <button 
                        key={l} 
                        type="button" 
                        onClick={() => setFormData({...formData, pickupLocation: l as any})} 
                        className={`p-3 rounded-xl font-bold text-xs text-left transition-all ${
                          formData.pickupLocation === l 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'bg-stone-50 text-stone-600 border border-stone-100'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any special instructions?" rows={2} className="w-full px-4 py-3 rounded-xl bg-stone-50/50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs transition-all resize-none" />
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-50">
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['gcash', 'maya'].map(method => (
                    <button 
                      key={method} 
                      type="button" 
                      onClick={() => setFormData({...formData, paymentMethod: method as 'gcash' | 'maya'})} 
                      className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                        formData.paymentMethod === method 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-stone-50 text-stone-600 border border-stone-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-3 left-4 right-4 max-w-lg mx-auto rounded-[2rem] bg-white/90 backdrop-blur-xl p-4 border border-stone-100 shadow-2xl z-50">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-primary">₱{total.toFixed(2)}</span>
              </div>
              <button 
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  isFormValid() 
                    ? 'bg-primary text-white shadow-md shadow-primary/20 active:scale-95' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
