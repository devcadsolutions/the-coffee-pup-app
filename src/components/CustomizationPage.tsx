import { Product, CartItem, ModifierGroup, ModifierOption } from '../types';
import { useState } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';

export default function CustomizationPage({ product, onAddToCart, onCancel }: { product: Product, onAddToCart: (item: CartItem) => void, onCancel: () => void }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [selectedModifiers, setSelectedModifiers] = useState<{ groupId: string; option: ModifierOption }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleAdd = () => {
    onAddToCart({
      id: Math.random().toString(),
      productId: product.id,
      quantity: 1,
      customizations: { variantName: variant.name, selectedModifiers, specialInstructions }
    });
  };

  const toggleModifier = (groupId: string, option: ModifierOption) => {
    setSelectedModifiers(prev => {
      const existing = prev.find(m => m.groupId === groupId && m.option.id === option.id);
      if (existing) {
        return prev.filter(m => !(m.groupId === groupId && m.option.id === option.id));
      }
      return [...prev, { groupId, option }];
    });
  };

  return (
    <div className="pb-32">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 h-16">
        <button onClick={onCancel} className="p-2 rounded-full bg-surface-container-lowest text-primary"><ArrowLeft /></button>
        <span className="font-serif font-bold text-xl text-primary">The Coffee Pup</span>
        <button className="p-2 rounded-full bg-surface-container-lowest text-primary"><Share2 /></button>
      </nav>

      <section className="relative h-[300px] w-full overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      </section>

      <section className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-primary">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mt-2">
            {variant.price ? `₱${variant.price.toFixed(2)}` : 'Price varies'}
          </p>
          <p className="text-on-surface-variant text-sm mt-4">{product.description}</p>
        </div>
      </section>

      <section className="px-6 mt-8 space-y-8">
        <div>
          <h2 className="font-bold text-lg text-primary mb-4">Variant</h2>
          <div className="flex flex-wrap gap-2">
            {product.variants.map(v => (
              <button key={v.name} onClick={() => setVariant(v)} className={`py-2 px-4 rounded-full font-bold text-xs ${variant.name === v.name ? 'bg-primary text-white' : 'bg-surface-container-low'}`}>{v.name}</button>
            ))}
          </div>
        </div>
        
        {product.modifierGroups?.map(group => (
          <div key={group.id}>
            <h2 className="font-bold text-lg text-primary mb-4">{group.name}</h2>
            <div className="grid grid-cols-2 gap-2">
              {group.options.map(option => {
                const isSelected = selectedModifiers.some(m => m.groupId === group.id && m.option.id === option.id);
                return (
                  <button key={option.id} onClick={() => toggleModifier(group.id, option)} className={`p-3 rounded-lg text-xs font-medium flex justify-between items-center w-full h-14 ${isSelected ? 'bg-primary text-white' : 'bg-white border border-surface-container-high'}`}>
                    <span className="line-clamp-2 text-left mr-2">{option.name}</span>
                    <span className="flex-shrink-0">+₱{option.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <h2 className="font-bold text-lg text-primary mb-4">Special Instructions</h2>
          <textarea 
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g., Less sugar, extra ice..."
            className="w-full p-4 rounded-lg border border-surface-container-high bg-white text-sm"
            rows={3}
          />
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md p-6 border-t">
        <button 
          onClick={handleAdd} 
          className="w-full bg-primary text-white py-4 px-8 rounded-full font-bold flex justify-between items-center"
        >
          <span>Add to Cart</span>
          <span>₱{((variant.price || 0) + selectedModifiers.reduce((acc, m) => acc + m.option.price, 0)).toFixed(2)}</span>
        </button>
      </footer>
    </div>
  );
}
