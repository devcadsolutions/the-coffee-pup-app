import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, Loader2 } from 'lucide-react';
import { CheckoutDetails } from '../types';
import { db, doc, getDoc, collection, getDocs, query, where } from '../lib/firebase';

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
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    deliveryMethod: 'Any' as 'Lalamove' | 'Grab' | 'MoveIt' | 'Any',
    pickupLocation: 'Uncle John\'s' as 'Uncle John\'s' | 'Eiffel Cluster Lobby' | 'Clubhouse',
    chateauCluster: 'Seine' as string,
    chateauBuilding: '' as 'A' | 'B' | 'C' | 'D',
    chateauUnit: '',
    contactNumber: '',
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
            name: userData.name || prev.name,
            contactNumber: userData.phoneNumber || prev.contactNumber
          }));
        }

        // Fetch default address
        const addressesRef = collection(db, 'users', user.uid, 'addresses');
        const q = query(addressesRef, where('isDefault', '==', true));
        const addressSnap = await getDocs(q);
        if (!addressSnap.empty) {
          const defaultAddr = addressSnap.docs[0].data();
          if (defaultAddr.label.toLowerCase().includes('chateau')) {
            setDeliveryType('chateau');
            setFormData(prev => ({ ...prev, notes: `Default Address: ${defaultAddr.address}` }));
          }
        }
      } catch (err) {
        console.error('Error fetching user data for checkout:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

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
      onConfirm({
        type: deliveryType,
        ...formData
      });
    }
  };

  return (
    <div className="space-y-6 pb-32 pt-20 max-w-lg mx-auto">
      {/* Header Bar */}
      <div className="flex items-center gap-4 px-2">
        <button onClick={onCancel} className="p-3 rounded-2xl bg-white text-primary shadow-sm hover:bg-stone-50 transition-colors border border-stone-100/50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="serif-display text-2xl font-black text-primary">Checkout</h2>
        {loading && <Loader2 className="text-primary animate-spin ml-auto" size={18} />}
      </div>

      {!deliveryType ? (
        <div className="space-y-4 px-2">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">How would you like to receive your order?</p>
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
