import { Search, Coffee, Sandwich, Cookie, Zap, MoreHorizontal, X, Award, Heart, Leaf, Package, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
    if (selectedCategory === 'Bottles') return p.variants.some(v => v.name.toLowerCase().includes('bottle'));
    
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedCategory !== 'All') onSelectCategory('All');
            }}
            placeholder="Search for your favorites..." 
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-stone-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-primary">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-xl text-primary">Categories</h2>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{filteredProducts.length} Items</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = category.name === selectedCategory;
            return (
              <button
                key={category.name}
                onClick={() => { onSelectCategory(category.name); setSearchQuery(''); }}
                className="flex flex-col items-center gap-3 group"
              >
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isSelected 
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' 
                      : 'bg-white text-stone-400 border border-stone-100 group-hover:border-primary/30 group-hover:text-primary'
                  }`}
                >
                  <Icon size={24} />
                </motion.div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-primary' : 'text-stone-400'}`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const isUnavailable = product.status === 'unavailable';
            const startingPrice = Math.min(...product.variants.filter(v => v.price !== null).map(v => v.price as number));

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product.id}
                className={`group bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-primary/5 ${isUnavailable ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                  />
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isBestSeller && !isUnavailable && (
                      <div className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles size={10} className="text-secondary" />
                        BEST SELLER
                      </div>
                    )}
                    {product.isNew && !product.isBestSeller && !isUnavailable && (
                      <div className="bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                        NEW ARRIVAL
                      </div>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Heart size={16} className={product.isFavorite ? 'fill-red-500 text-red-500' : ''} />
                  </motion.button>

                  {isUnavailable && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-white text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-black text-primary text-lg mb-1 group-hover:text-secondary transition-colors">{product.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-0.5">Price</span>
                      <span className="font-black text-primary text-lg">₱{startingPrice.toFixed(2)}</span>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      disabled={isUnavailable}
                      onClick={() => onSelectProduct(product)}
                      className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-primary/10 hover:bg-secondary transition-colors disabled:bg-stone-200 disabled:shadow-none"
                    >
                      {isUnavailable ? 'Unavailable' : 'Add to Order'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
