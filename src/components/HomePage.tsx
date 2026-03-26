import { Coffee, Star, Leaf, Cake, Award, Clock, MapPin } from 'lucide-react';
import { Product } from '../types';

export default function HomePage({ products, onOrderNow, onCategorySelect }: { products: Product[], onOrderNow: () => void, onCategorySelect: (category: string) => void }) {
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 6);
  const newAdditions = products.filter(p => p.isNew).slice(0, 6);

  const categoryIcons: { [key: string]: any } = {
    'All': Award,
    'Coffee': Coffee,
    'Non-Coffee': Leaf,
    'Toasts': Cake,
    'Pastries': Cake,
    'Others': Star,
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative px-6 py-20 flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-4">Established 2024</p>
        <h1 className="serif-display text-5xl font-bold text-primary leading-tight mb-6">Your Morning Ritual, Handcrafted.</h1>
        <p className="text-on-surface-variant mb-8 max-w-md">Spreading love - one cup at a time. Experience artisanal coffee delivered to your doorstep.</p>
        <button onClick={onOrderNow} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold active:scale-95 duration-200">Order Now</button>
      </section>

      {/* Categories */}
      <section className="px-6 py-12">
        <h2 className="serif-display text-3xl font-bold text-primary mb-8">Discover</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map(cat => {
            const Icon = categoryIcons[cat] || Star;
            return (
              <button key={cat} onClick={() => onCategorySelect(cat)} className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col items-center shadow-sm hover:shadow-md transition-shadow gap-3">
                <Icon className="text-primary" size={32} />
                <span className="font-bold text-sm text-primary">{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="px-6 py-12 bg-surface-container-low">
          <h2 className="serif-display text-3xl font-bold text-primary mb-8">Best Sellers</h2>
          <div className="space-y-4">
            {bestSellers.map(item => (
              <div key={item.id} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 relative">
                <div className="relative">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">BEST</div>
                </div>
                <div>
                  <h3 className="font-bold text-primary">{item.name}</h3>
                  <p className="text-sm text-on-surface-variant">Customer favorite</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Additions */}
      {newAdditions.length > 0 && (
        <section className="px-6 py-12">
          <h2 className="serif-display text-3xl font-bold text-primary mb-8">New Additions</h2>
          <div className="space-y-4">
            {newAdditions.map(item => (
              <div key={item.id} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 relative">
                <div className="relative">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">NEW</div>
                </div>
                <div>
                  <h3 className="font-bold text-primary">{item.name}</h3>
                  <p className="text-sm text-on-surface-variant">Just arrived</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Us */}
      <section className="px-6 py-12">
        <h2 className="serif-display text-3xl font-bold text-primary mb-8">About Us</h2>
        <div className="bg-primary text-on-primary p-8 rounded-3xl">
          <p className="mb-6 leading-relaxed">The Coffee Pup is an online-based coffee shop located in Chateau Elysee, Moonwalk, Paranaque. We are dedicated to spreading love - one cup at a time.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Clock size={20} /> <span>Mon-Sat, 10:00 AM-9:00 PM</span></div>
            <div className="flex items-center gap-3"><MapPin size={20} /> <span>Chateau Elysee, Paranaque</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
