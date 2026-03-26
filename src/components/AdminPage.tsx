import { Product } from '../types';
import { useState } from 'react';

export default function AdminPage({ products, setProducts, onBack }: { products: Product[], setProducts: (p: Product[]) => void, onBack: () => void }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleUpdate = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  return (
    <div className="pb-24 space-y-8">
      <h2 className="font-serif text-3xl font-bold text-primary">Admin Panel</h2>
      <button onClick={onBack} className="w-full py-4 rounded-full border border-primary text-primary font-bold text-sm uppercase tracking-widest">Back to Settings</button>
      
      {categories.filter(c => c !== 'All').map(category => (
        <div key={category} className="space-y-4">
          <h3 className="font-bold text-lg text-primary">{category}</h3>
          <div className="grid grid-cols-2 gap-4">
            {products.filter(p => p.category === category).map(product => (
              <button key={product.id} onClick={() => setEditingProduct(product)} className="bg-white p-4 rounded-2xl shadow-sm text-left">
                <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover rounded-xl mb-2" referrerPolicy="no-referrer" />
                <p className="font-bold text-sm">{product.name}</p>
                <p className="text-xs text-stone-500">₱{product.variants[0]?.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-primary">Others (Add-ons)</h3>
        {/* Placeholder for add-ons as they are currently not in products list */}
        <p className="text-sm text-stone-500">Add-ons management coming soon.</p>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 p-6 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg">Edit {editingProduct.name}</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-bold">Name</label>
              <input 
                type="text" 
                value={editingProduct.name} 
                onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-bold">Description</label>
              <textarea 
                value={editingProduct.description} 
                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-bold">Variants</label>
              {editingProduct.variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={v.name} onChange={e => {
                    const newVariants = [...editingProduct.variants];
                    newVariants[i].name = e.target.value;
                    setEditingProduct({...editingProduct, variants: newVariants});
                  }} className="w-1/2 p-2 border rounded" />
                  <input type="number" value={v.price || 0} onChange={e => {
                    const newVariants = [...editingProduct.variants];
                    newVariants[i].price = parseFloat(e.target.value);
                    setEditingProduct({...editingProduct, variants: newVariants});
                  }} className="w-1/2 p-2 border rounded" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingProduct.isBestSeller || false} onChange={e => setEditingProduct({...editingProduct, isBestSeller: e.target.checked})} />
                <span className="text-xs font-bold">Best Seller</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingProduct.isNew || false} onChange={e => setEditingProduct({...editingProduct, isNew: e.target.checked})} />
                <span className="text-xs font-bold">New</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-bold">Image URL</label>
              <input 
                type="text" 
                value={editingProduct.imageUrl} 
                onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} 
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-bold">Status</label>
              <select 
                value={editingProduct.status || 'active'}
                onChange={e => setEditingProduct({...editingProduct, status: e.target.value as any})}
                className="w-full p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="unavailable">Not Available</option>
                <option value="hidden">Hide from Menu</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-2 rounded border">Cancel</button>
              <button onClick={() => handleUpdate(editingProduct)} className="flex-1 py-2 rounded bg-primary text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
