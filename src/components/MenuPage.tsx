import { Product } from '../types';
import { products } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';
import { resolveProductImage } from '../utils/productImages';

export default function MenuPage({ 
  selectedCategory, 
  onSelectProduct, 
  onBack 
}: { 
  selectedCategory: string, 
  onSelectProduct: (product: Product) => void,
  onBack: () => void
}) {
  const filteredProducts = products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6 pb-10">
      <button onClick={onBack} className="flex items-center text-primary font-bold uppercase text-xs tracking-widest">
        <ArrowLeft size={16} className="mr-2" /> Back to Categories
      </button>
      <h2 className="font-serif text-4xl text-primary leading-tight mb-4">{selectedCategory}</h2>
      
      <div className="space-y-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group flex gap-4 items-start">
            <div className="relative bg-white rounded-lg overflow-hidden aspect-square w-24 h-24 flex items-center justify-center shrink-0">
              <img src={resolveProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-serif text-2xl text-primary">{product.name}</h3>
                  <p className="text-on-surface-variant text-sm mt-1">{product.description}</p>
                </div>
                <span className="font-bold text-lg text-primary">
                  {product.variants[0]?.price ? `PHP ${product.variants[0].price.toFixed(2)}` : 'Price varies'}
                </span>
              </div>
              <button 
                onClick={() => onSelectProduct(product)}
                className="mt-2 w-full bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] py-2 rounded-full hover:opacity-90 transition-all"
              >
                Customize
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
