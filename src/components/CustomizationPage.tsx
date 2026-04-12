import { Product, CartItem, ModifierGroup, ModifierOption } from '../types';
import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomizationPage({ product, onAddToCart, onProceedToOrder, onCancel }: { product: Product, onAddToCart: (item: CartItem) => void, onProceedToOrder: (item: CartItem) => void, onCancel: () => void }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [selectedModifiers, setSelectedModifiers] = useState<{ groupId: string; option: ModifierOption }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAdd = (navigateToOrders: boolean = false) => {
    const item = {
      id: Math.random().toString(),
      productId: product.id,
      name: product.name,
      price: (variant.price || 0) + selectedModifiers.reduce((acc, m) => acc + m.option.price, 0),
      quantity,
      customizations: { variantName: variant.name, selectedModifiers, specialInstructions }
    };
    if (navigateToOrders) {
      onProceedToOrder(item);
    } else {
      onAddToCart(item);
    }
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

  const totalPrice = ((variant.price || 0) + selectedModifiers.reduce((acc, m) => acc + m.option.price, 0)) * quantity;

  const steps = [
    { title: 'Choose Size', id: 'size' },
    { title: 'Add-ons', id: 'addons' },
    { title: 'Instructions', id: 'notes' }
  ];

  return (
    <div className="min-h-screen bg-surface pb-40">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 h-20 border-b border-stone-100">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onCancel} 
          className="p-3 rounded-2xl bg-stone-50 text-primary"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="font-black text-primary uppercase tracking-widest text-[10px]">Customizing</span>
          <span className="font-serif font-black text-lg text-primary truncate max-w-[150px]">{product.name}</span>
        </div>
        <div className="w-12" />
      </nav>

      {/* Hero Image */}
      <section className="relative pt-20 h-[40vh] w-full overflow-hidden bg-white">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain p-8" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-surface to-transparent" />
      </section>

      {/* Content */}
      <div className="px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-stone-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="font-serif text-3xl font-black text-primary mb-2">{product.name}</h1>
              <p className="text-sm text-stone-500 leading-relaxed">{product.description}</p>
            </div>
            {product.isBestSeller && (
              <div className="bg-secondary/10 text-secondary p-2 rounded-xl">
                <Sparkles size={20} />
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-50">
            <span className="font-black text-primary uppercase tracking-widest text-xs">Quantity</span>
            <div className="flex items-center gap-6 bg-stone-50 p-2 rounded-2xl">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </motion.button>
              <span className="font-black text-lg text-primary w-4 text-center">{quantity}</span>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(quantity + 1)} 
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary"
              >
                <Plus size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Customization Steps */}
        <div className="mt-10 space-y-10">
          {/* Step 1: Size/Variant */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">1</div>
              <h2 className="font-black text-xl text-primary">Choose Size</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {product.variants.map(v => {
                const isSelected = variant.name === v.name;
                return (
                  <motion.button 
                    key={v.name} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setVariant(v)} 
                    className={`p-5 rounded-2xl flex items-center justify-between border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                        : 'border-stone-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-primary bg-primary' : 'border-stone-200'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`font-black ${isSelected ? 'text-primary' : 'text-stone-600'}`}>{v.name}</span>
                    </div>
                    <span className={`font-black ${isSelected ? 'text-primary' : 'text-stone-400'}`}>₱{v.price?.toFixed(2)}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Modifiers */}
          {product.modifierGroups?.map((group, idx) => (
            <section key={group.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">{idx + 2}</div>
                <h2 className="font-black text-xl text-primary">{group.name}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.options.map(option => {
                  const isSelected = selectedModifiers.some(m => m.groupId === group.id && m.option.id === option.id);
                  return (
                    <motion.button 
                      key={option.id} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleModifier(group.id, option)} 
                      className={`p-4 rounded-2xl flex flex-col gap-2 border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/5' 
                          : 'border-stone-100 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-secondary' : 'text-stone-600'}`}>
                          {option.name}
                        </span>
                        {isSelected && <Check size={14} className="text-secondary" />}
                      </div>
                      <span className={`text-sm font-black ${isSelected ? 'text-secondary' : 'text-stone-400'}`}>+₱{option.price}</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Step 3: Special Instructions */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">
                {(product.modifierGroups?.length || 0) + 2}
              </div>
              <h2 className="font-black text-xl text-primary">Special Instructions</h2>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
              <textarea 
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Less sugar, extra ice, or any specific requests..."
                className="w-full bg-stone-50 p-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 min-h-[120px] resize-none"
              />
            </div>
          </section>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl p-6 border-t border-stone-100 z-50">
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Total Price</span>
            <span className="text-2xl font-black text-primary">₱{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAdd(false)} 
              className="flex-1 bg-stone-100 text-primary py-5 rounded-[2rem] font-black text-sm transition-colors hover:bg-stone-200"
            >
              Add to Cart
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAdd(true)} 
              className="flex-[1.5] bg-primary text-white py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              Order Now
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}
