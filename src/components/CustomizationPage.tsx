import { Product, CartItem, ModifierOption } from '../types';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Check, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveProductImage } from '../utils/productImages';

export default function CustomizationPage({ product, onAddToCart, onProceedToOrder, onCancel }: { product: Product, onAddToCart: (item: CartItem) => void, onProceedToOrder: (item: CartItem) => void, onCancel: () => void }) {
  const [variant, setVariant] = useState((product.variants || [])[0] || { name: 'Regular', price: 0 });
  const [selectedModifiers, setSelectedModifiers] = useState<{ groupId: string; option: ModifierOption }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

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

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const totalPrice = ((variant.price || 0) + selectedModifiers.reduce((acc, m) => acc + m.option.price, 0)) * quantity;
  const commonRequests = ['50% sugar', 'less ice', 'no ice', 'no straw'];

  return (
    <motion.div 
      initial={{ y: "100%", opacity: 0.9 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="min-h-screen bg-surface pb-40"
    >
      {/* Header Bar */}
      <nav className="fixed top-3 left-4 right-4 z-50 h-20 max-w-4xl mx-auto rounded-[2rem] bg-white/85 backdrop-blur-xl flex items-center justify-between px-5 sm:left-6 sm:right-6 sm:px-6 border border-stone-100 shadow-md shadow-primary/5">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onCancel} 
          className="p-3 rounded-2xl bg-stone-50 text-primary hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="font-black text-primary uppercase tracking-widest text-[9px]">Customize Drink</span>
          <span className="font-serif font-black text-base text-primary truncate max-w-[150px]">{product.name}</span>
        </div>
        <div className="w-10" />
      </nav>

      {/* Top Banner Image - Shows full image via object-contain and clean padding */}
      <section className="relative pt-24 h-[35vh] w-full overflow-hidden bg-stone-50/50 flex items-center justify-center">
        <motion.img 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={resolveProductImage(product)} 
          alt={product.name} 
          className="w-full h-full object-contain p-6" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent" />
      </section>

      {/* Customization Details Panel */}
      <div className="px-4 sm:px-6 -mt-8 relative z-10 max-w-lg mx-auto space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="font-serif text-2xl font-black text-primary mb-1">{product.name}</h1>
              <p className="text-xs text-stone-400 leading-relaxed">{product.description}</p>
            </div>
            {product.isBestSeller && (
              <span className="bg-secondary/15 text-secondary p-2 rounded-xl flex items-center justify-center">
                <Sparkles size={16} />
              </span>
            )}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-50">
            <span className="font-black text-primary uppercase tracking-widest text-[10px]">Select Quantity</span>
            <div className="flex items-center gap-4 bg-stone-50 p-1 rounded-xl">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </motion.button>
              <span className="font-black text-sm text-primary w-4 text-center">{quantity}</span>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(quantity + 1)} 
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary"
              >
                <Plus size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Options Groups */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 space-y-6">
          {/* Variant Selection */}
          <div className="space-y-3">
            <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-wider">Choose Option</h3>
            <div className="flex flex-wrap gap-2">
              {(product.variants || []).map(v => {
                const isSelected = variant.name === v.name;
                return (
                  <button 
                    key={v.name} 
                    onClick={() => setVariant(v)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/10' 
                        : 'bg-white text-stone-600 border-stone-100 hover:border-primary/20'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    {v.name} {v.price ? `(₱${v.price})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-on Modifier Groups (Collapsible) */}
          {product.modifierGroups?.map((group) => {
            const isCollapsed = collapsedGroups.includes(group.id);
            return (
              <div key={group.id} className="pt-2 border-t border-stone-50 space-y-3">
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="w-full flex items-center justify-between py-1 focus:outline-none"
                >
                  <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-wider">{group.name}</h3>
                  <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="text-stone-400"
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex flex-wrap gap-2 overflow-hidden"
                    >
                      {group.options.map(option => {
                        const isSelected = selectedModifiers.some(m => m.groupId === group.id && m.option.id === option.id);
                        return (
                          <button 
                            key={option.id} 
                            onClick={() => toggleModifier(group.id, option)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-secondary text-white border-secondary shadow-sm' 
                                : 'bg-white text-stone-600 border-stone-100 hover:border-secondary/20'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                            {option.name} <span className={isSelected ? 'text-white/80' : 'text-stone-400 font-normal'}>+₱{option.price}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Special Instructions Notes */}
          <div className="space-y-3 pt-2 border-t border-stone-50">
            <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-wider">Special Requests</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonRequests.map(req => (
                <button
                  key={req}
                  onClick={() => setSpecialInstructions(prev => prev ? `${prev}, ${req}` : req)}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-lg text-[10px] font-bold transition-colors"
                >
                  {req}
                </button>
              ))}
            </div>
            <textarea 
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., Less sugar, extra ice, no chocolate powder..."
              className="w-full bg-stone-50/50 border border-stone-100 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white min-h-[80px] resize-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <footer className="fixed bottom-3 left-4 right-4 max-w-lg mx-auto rounded-[2rem] bg-white/90 backdrop-blur-xl p-4 border border-stone-100 shadow-2xl z-50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total Price</span>
            <span className="text-xl font-black text-primary">₱{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={() => handleAdd(false)} 
              className="flex-1 bg-stone-50 hover:bg-stone-100 text-primary py-4 rounded-xl font-black text-xs transition-colors border border-stone-100"
            >
              Add to Cart
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={() => handleAdd(true)} 
              className="flex-[1.4] bg-primary text-white py-4 rounded-xl font-black text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              Order Now
            </motion.button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
