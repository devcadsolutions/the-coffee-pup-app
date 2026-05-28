import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, doc, updateDoc } from '../../lib/firebase';
import { Edit2, X, Plus, Trash2, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { resolveProductImage } from '../../utils/productImages';
import { products as initialProducts } from '../../data/mockData';

export default function MenuManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states for editing
  const [editStatus, setEditStatus] = useState<'active' | 'unavailable' | 'hidden'>('active');
  const [editVariants, setEditVariants] = useState<{ name: string; price: number }[]>([]);

  useEffect(() => {
    const q = collection(db, 'products');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProducts(initialProducts);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
        setProducts(items);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Error fetching products on admin, using local fallback:', err);
      setProducts(initialProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditStatus((p.status as any) || 'active');
    setEditVariants(p.variants.map(v => ({ name: v.name, price: v.price || 0 })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, {
        status: editStatus,
        variants: editVariants.map(v => ({ name: v.name, price: Number(v.price) }))
      });
      setEditingProduct(null);
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleVariantPriceChange = (index: number, newPrice: string) => {
    setEditVariants(prev => prev.map((v, i) => i === index ? { ...v, price: Number(newPrice) } : v));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-sm font-bold text-stone-400">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Menu Management</h2>
        <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          {products.length} Products
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {/* Table for menu items list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-on-surface-variant text-xs uppercase border-b border-stone-100">
              <tr>
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price Range</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map(item => {
                const prices = item.variants.map(v => v.price).filter(p => p !== null) as number[];
                const priceRange = prices.length > 0 
                  ? prices.length === 1 
                    ? `₱${prices[0].toFixed(2)}`
                    : `₱${Math.min(...prices).toFixed(2)} - ₱${Math.max(...prices).toFixed(2)}`
                  : 'N/A';

                return (
                  <tr key={item.id} className="hover:bg-surface/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={resolveProductImage(item)} alt={item.name} className="w-10 h-10 rounded-xl object-contain bg-stone-50 border border-stone-100 p-0.5" />
                        <div>
                          <h4 className="font-bold text-primary text-sm">{item.name}</h4>
                          <p className="text-[10px] text-stone-400 line-clamp-1 max-w-xs">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{item.category}</td>
                    <td className="p-4 font-bold text-xs text-primary">{priceRange}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        item.status === 'unavailable' ? 'bg-red-50 text-red-600' :
                        item.status === 'hidden' ? 'bg-stone-100 text-stone-400' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {item.status === 'unavailable' ? 'Sold Out' :
                         item.status === 'hidden' ? 'Hidden' :
                         'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-primary hover:bg-primary/5 rounded-xl border border-stone-100 hover:border-primary/20 transition-all bg-white"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-stone-50 pb-3">
              <div>
                <h3 className="font-serif text-xl font-black text-primary">Edit Product</h3>
                <p className="text-xs text-stone-400">{editingProduct.name}</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="p-2 hover:bg-stone-50 rounded-full text-stone-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Status Select Toggle */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Availability Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active', label: 'Active', color: 'border-green-200 text-green-600' },
                    { id: 'unavailable', label: 'Sold Out', color: 'border-red-200 text-red-600' },
                    { id: 'hidden', label: 'Hidden', color: 'border-stone-200 text-stone-400' }
                  ].map(s => {
                    const isSel = editStatus === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setEditStatus(s.id as any)}
                        className={`py-3.5 rounded-xl font-bold text-xs transition-all border ${
                          isSel 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-white text-stone-600 border-stone-100 hover:border-primary/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variant Prices Inputs */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Variant Prices</label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {editVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-stone-50 p-2 rounded-2xl border border-stone-100">
                      <span className="text-xs font-black text-primary flex-1 pl-2">{v.name}</span>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-stone-100 w-32 focus-within:border-primary transition-all">
                        <span className="text-xs font-bold text-stone-400">₱</span>
                        <input 
                          type="number" 
                          value={v.price} 
                          onChange={e => handleVariantPriceChange(idx, e.target.value)} 
                          className="w-full bg-transparent outline-none text-xs font-bold text-primary" 
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  className="flex-1 bg-stone-50 hover:bg-stone-100 text-primary py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors border border-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 transition-all hover:bg-secondary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
