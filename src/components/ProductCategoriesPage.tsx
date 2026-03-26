import { Search, Coffee, Sandwich, Cookie, Zap, MoreHorizontal, SlidersHorizontal, X, Award } from 'lucide-react';
import { Product } from '../types';
import { useState } from 'react';

export default function ProductCategoriesPage({ 
  products,
  selectedCategory,
  onSelectCategory, 
  onSelectProduct 
}: { 
  products: Product[],
  selectedCategory: string,
  onSelectCategory: (category: string) => void,
  onSelectProduct: (product: Product) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'All', icon: Award },
    { name: 'Coffee', icon: Coffee },
    { name: 'Non-Coffee', icon: Zap },
    { name: 'Toasts', icon: Sandwich },
    { name: 'Pastries', icon: Cookie },
    { name: 'Others', icon: MoreHorizontal },
  ];

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.status !== 'hidden') &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleReset = () => {
    setSearchQuery('');
    onSelectCategory('All');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="relative flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSelectCategory('All');
            }}
            placeholder="Search for drinks, pastries, etc" 
            className="w-full pl-10 pr-10 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <h2 className="font-bold text-xl text-primary">Browse by categories</h2>
      
      <div className="grid grid-cols-6 gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          const isSelected = category.name === selectedCategory;
          return (
            <button
              key={category.name}
              onClick={() => { onSelectCategory(category.name); setSearchQuery(''); }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`p-4 rounded-full transition-colors ${isSelected ? 'bg-primary text-white shadow-lg' : 'bg-surface-variant text-primary hover:bg-primary hover:text-white'}`}>
                <Icon size={24} />
              </div>
              <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => {
          const isUnavailable = product.status === 'unavailable';
          return (
            <button 
              key={product.id}
              onClick={() => !isUnavailable && onSelectProduct(product)}
              className={`bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left ${isUnavailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isUnavailable}
            >
              <div className="relative">
                <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover rounded-xl mb-3" referrerPolicy="no-referrer" />
                {product.isNew && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">NEW</div>}
                {product.isBestSeller && <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">BEST SELLER</div>}
              </div>
              <h3 className="font-bold text-primary text-center">{product.name}</h3>
              <p className="text-on-surface-variant text-[10px] text-center">{product.description} {isUnavailable && '(Not Available)'}</p>
              <p className="font-bold text-primary mt-2 text-center">₱{product.variants[0]?.price.toFixed(2)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
