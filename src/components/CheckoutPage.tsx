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
    <div className="space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 rounded-full bg-white text-primary shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-serif text-3xl font-bold text-primary">Checkout</h2>
        {loading && <Loader2 className="text-primary animate-spin ml-auto" size={20} />}
      </div>

      {!deliveryType ? (
        <div className="space-y-4">
          <p className="text-on-surface-variant">How would you like to receive your order?</p>
          <div className="grid gap-4">
            <button 
              onClick={() => setDeliveryType('pickup')}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left border-2 border-transparent hover:border-primary"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary">Pick-up</h3>
                <p className="text-xs text-on-surface-variant">Collect your order at a designated spot</p>
              </div>
            </button>

            <button 
              onClick={() => setDeliveryType('chateau')}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left border-2 border-transparent hover:border-primary"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary">Chateau Elysee Delivery</h3>
                <p className="text-xs text-on-surface-variant">Free delivery for residents!</p>
              </div>
            </button>

            <button 
              onClick={() => setDeliveryType('outside')}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left border-2 border-transparent hover:border-primary"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary">Outside Delivery</h3>
                <p className="text-xs text-on-surface-variant">Delivery via courier</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-primary">Order Details</h3>
              <button 
                type="button"
                onClick={() => setDeliveryType(null)}
                className="text-xs text-primary font-medium underline"
              >
                Change Type
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter your name" className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Contact Number</label>
                <input required type="tel" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="09XX XXX XXXX" className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {deliveryType === 'outside' ? (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Lalamove', 'Grab', 'MoveIt', 'Any'].map(m => (
                      <button key={m} type="button" onClick={() => setFormData({...formData, deliveryMethod: m as any})} className={`py-2 rounded-lg font-bold text-xs ${formData.deliveryMethod === m ? 'bg-primary text-white' : 'bg-surface'}`}>{m}</button>
                    ))}
                  </div>
                </div>
              ) : deliveryType === 'chateau' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Cluster</label>
                    <div className="grid grid-cols-3 gap-2">
                      {clusters.map(c => (
                        <button key={c} type="button" onClick={() => setFormData({...formData, chateauCluster: c})} className={`py-2 rounded-lg font-bold text-[10px] ${formData.chateauCluster === c ? 'bg-primary text-white' : 'bg-surface'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Building</label>
                    <div className="grid grid-cols-4 gap-2">
                      {buildings.map(b => (
                        <button key={b} type="button" onClick={() => setFormData({...formData, chateauBuilding: b as any})} className={`py-2 rounded-lg font-bold text-[10px] ${formData.chateauBuilding === b ? 'bg-primary text-white' : 'bg-surface'}`}>{b}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Unit Number</label>
                    <input required type="text" value={formData.chateauUnit} onChange={e => setFormData({...formData, chateauUnit: e.target.value})} placeholder="e.g. 101" className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Pick-up Location</label>
                  <div className="grid gap-2">
                    {['Uncle John\'s', 'Eiffel Cluster Lobby', 'Clubhouse'].map(l => (
                      <button key={l} type="button" onClick={() => setFormData({...formData, pickupLocation: l as any})} className={`py-2 px-4 rounded-lg font-bold text-xs text-left ${formData.pickupLocation === l ? 'bg-primary text-white' : 'bg-surface'}`}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any special instructions?" rows={2} className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {['gcash', 'maya'].map(method => (
                    <button key={method} type="button" onClick={() => setFormData({...formData, paymentMethod: method as 'gcash' | 'maya'})} className={`py-3 rounded-xl font-bold uppercase ${formData.paymentMethod === method ? 'bg-primary text-white' : 'bg-surface'}`}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md p-6 border-t z-50">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-on-surface-variant font-medium">Total Amount</span>
              <span className="text-xl font-bold text-primary">₱{total.toFixed(2)}</span>
            </div>
            <button 
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-4 rounded-full font-bold transition-all ${isFormValid() ? 'bg-primary text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Confirm Order
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
