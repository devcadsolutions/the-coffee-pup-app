import { Search, Coffee, Sandwich, Cookie, Zap, MoreHorizontal, X, Award, Heart, Leaf, Package, Sparkles, Plus } from 'lucide-react';
import { Product } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveProductImage } from '../utils/productImages';

export default function ProductCategoriesPage({ 
  products,
  selectedCategory,
  onSelectCategory, 
  onSelectProduct,
  toggleFavorite
}: { 
  products: Product[],
  selectedCategory: string,
  onSelectCategory: (category: string) => void,
  onSelectProduct: (product: Product) => void,
  toggleFavorite: (productId: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'All', icon: Award },
    { name: 'Coffee', icon: Coffee },
    { name: 'Signature', icon: Award },
    { name: 'Matcha', icon: Leaf },
    { name: 'Non-Coffee', icon: Zap },
    { name: 'Bottles', icon: Package },
    { name: 'Toasts', icon: Sandwich },
    { name: 'Pastries', icon: Cookie },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch || p.status === 'hidden') return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Signature') return p.isSignature;
    if (selectedCategory === 'Matcha') return p.name.toLowerCase().includes('matcha');
    if (selectedCategory === 'Bottles') return (p.variants || []).some(v => v.name.toLowerCase().includes('bottle'));
    
    return p.category === selectedCategory;
  });

  return (
    <div className="pt-4 px-2 sm:px-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* 1. Integrated Search Bar at the Top */}
      <div className="relative p-2 pb-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedCategory !== 'All') onSelectCategory('All');
            }}
            placeholder="Search our delicious brews & bakes..." 
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border border-stone-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-primary">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Menu Split Layout Area */}
      <div className="flex-1 flex overflow-hidden bg-white rounded-[2rem] border border-stone-100 shadow-sm">
        {/* Left Category Sidebar */}
        <aside className="w-20 sm:w-24 bg-stone-50/60 border-r border-stone-100 overflow-y-auto flex flex-col items-center py-4 gap-2 scrollbar-hide">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = category.name === selectedCategory;
            
            return (
              <button
                key={category.name}
                onClick={() => { onSelectCategory(category.name); setSearchQuery(''); }}
                className="w-full py-3.5 flex flex-col items-center justify-center gap-1.5 relative group"
              >
                {/* Active Left Indicator Bar */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-primary rounded-r-full"
                  />
                )}
                
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary/10 text-primary scale-105' 
                    : 'text-stone-400 group-hover:text-stone-600'
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider text-center transition-colors px-1 ${
                  isSelected ? 'text-primary' : 'text-stone-400 group-hover:text-stone-600'
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Right Product Scrollable List */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-hide">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-50">
            <h3 className="font-black text-xs text-stone-400 uppercase tracking-widest">
              {selectedCategory}
            </h3>
            <span className="text-[10px] font-bold text-stone-400">
              {filteredProducts.length} Items
            </span>
          </div>

          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isUnavailable = product.status === 'unavailable';
                const variants = product.variants || [];
                const prices = variants.filter(v => v.price !== null).map(v => v.price as number);
                const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={product.id}
                    onClick={() => { if (!isUnavailable) onSelectProduct(product); }}
                    className={`bg-stone-50/50 hover:bg-stone-50/80 rounded-2xl p-3 border border-stone-100/50 flex gap-3.5 items-center justify-between group cursor-pointer transition-all duration-200 ${
                      isUnavailable ? 'opacity-65 grayscale cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Left side: Image & Badges */}
                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <img 
                        src={resolveProductImage(product)} 
                        alt={product.name} 
                        className="w-full h-full object-contain bg-stone-50/40 p-1.5 transition-transform duration-500 group-hover:scale-105" 
                        referrerPolicy="no-referrer" 
                      />
                      
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-white text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h4 className="font-black text-primary text-sm line-clamp-1 group-hover:text-secondary transition-colors">
                            {product.name}
                          </h4>
                          
                          {/* Tag badges */}
                          {product.isBestSeller && !isUnavailable && (
                            <span className="bg-secondary/10 text-secondary text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Sparkles size={8} />
                              HOT
                            </span>
                          )}
                          {product.isNew && !product.isBestSeller && !isUnavailable && (
                            <span className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 line-clamp-1 leading-relaxed mb-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-black text-primary text-sm">
                          ₱{startingPrice.toFixed(2)}
                        </span>
                        
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          disabled={isUnavailable}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (!isUnavailable) onSelectProduct(product); 
                          }}
                          className="bg-primary text-white p-2 rounded-full shadow-md shadow-primary/10 group-hover:bg-secondary transition-colors disabled:bg-stone-200 disabled:shadow-none"
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-stone-400">
                <p className="text-xs">No items found matching search or category.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
