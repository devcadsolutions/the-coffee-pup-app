import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from '../../lib/firebase';
import { Plus, Trash2, CheckCircle, XCircle, Tag, Sparkles } from 'lucide-react';

interface Promo {
  id: string;
  code: string;
  discountValue: number;
  type: 'percentage' | 'fixed';
  isActive: boolean;
}

export default function PromoManagement() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('fixed');

  useEffect(() => {
    const q = collection(db, 'promos');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Promo[];
      setPromos(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    const formattedCode = code.toUpperCase().trim();
    const promoId = formattedCode; // Code itself as the ID to avoid duplicates

    try {
      await setDoc(doc(db, 'promos', promoId), {
        code: formattedCode,
        discountValue: Number(discountValue),
        type,
        isActive: true
      });
      setCode('');
      setDiscountValue('');
    } catch (err) {
      console.error('Error adding promo code:', err);
    }
  };

  const handleToggleActive = async (promoId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'promos', promoId), {
        isActive: !currentActive
      });
    } catch (err) {
      console.error('Error toggling active state:', err);
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (window.confirm(`Delete promo code ${promoId}?`)) {
      try {
        await deleteDoc(doc(db, 'promos', promoId));
      } catch (err) {
        console.error('Error deleting promo code:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-sm font-bold text-stone-400">Loading discount codes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Discount Promo Codes</h2>
        <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          {promos.length} Active Codes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Create Promo Form */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4 h-fit">
          <h3 className="font-serif text-lg font-black text-primary flex items-center gap-2">
            <Sparkles size={16} className="text-secondary" />
            Add Promo Code
          </h3>
          <form onSubmit={handleAddPromo} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Promo Code</label>
              <input 
                type="text" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                placeholder="E.g. WELCOME20" 
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs font-bold uppercase transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Discount Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'fixed', label: 'Fixed (₱)' },
                  { id: 'percentage', label: 'Percentage (%)' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as any)}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      type === t.id 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-stone-50 text-stone-600 border-stone-100 hover:border-primary/20'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Discount Value</label>
              <input 
                type="number" 
                value={discountValue} 
                onChange={e => setDiscountValue(e.target.value)} 
                placeholder={type === 'fixed' ? '₱ Value (e.g. 20)' : '% Value (e.g. 10)'} 
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs font-bold transition-all"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-secondary active:scale-95 transition-all mt-2"
            >
              Create Code
            </button>
          </form>
        </div>

        {/* Right Side: List Promo Codes */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface text-on-surface-variant text-xs uppercase border-b border-stone-100">
                <tr>
                  <th className="p-4 font-bold">Code</th>
                  <th className="p-4 font-bold">Discount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {promos.map(p => (
                  <tr key={p.id} className="hover:bg-surface/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-secondary" />
                        <span className="font-mono font-bold text-sm text-primary">{p.code}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-xs">
                      {p.type === 'fixed' ? `₱${p.discountValue.toFixed(2)}` : `${p.discountValue}% OFF`}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(p.id, p.isActive)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                          p.isActive 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {p.isActive ? (
                          <>
                            <CheckCircle size={10} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={10} /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeletePromo(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-stone-100 hover:border-red-200 transition-all bg-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {promos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-stone-400 text-xs">
                      No discount codes created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
