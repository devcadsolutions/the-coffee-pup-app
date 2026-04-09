import { Coffee, Star, Leaf, Cake, Award, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useRef, useState, useEffect } from 'react';
import { announcements } from '../constants';
import AnnouncementModal from './AnnouncementModal';

const ScrollableSection = ({ title, items, tag, tagColor, onSelectProduct }: { title: string, items: Product[], tag: string, tagColor: string, onSelectProduct: (product: Product) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  return (
    <section className="relative px-6 py-12">
      <h2 className="serif-display text-3xl font-bold text-primary mb-8">{title}</h2>
      <div className="relative group">
        {canScrollLeft && (
          <button onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg text-primary">
            <ChevronLeft size={20} />
          </button>
        )}
        <div ref={scrollRef} onScroll={checkScroll} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map(item => (
            <button key={item.id} onClick={() => onSelectProduct(item)} className="bg-surface-container-lowest p-4 rounded-2xl flex-shrink-0 w-48 shadow-sm text-left">
              <div className="relative mb-2">
                <img src={item.imageUrl} alt={item.name} className="w-full h-32 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className={`absolute top-2 right-2 ${tagColor} text-white text-[8px] font-bold px-1 py-0.5 rounded-full`}>{tag}</div>
              </div>
              <h3 className="font-bold text-primary text-sm">{item.name}</h3>
            </button>
          ))}
        </div>
        {canScrollRight && (
          <button onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg text-primary">
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
};

export default function HomePage({ products, onOrderNow, onCategorySelect, onSelectProduct }: { products: Product[], onOrderNow: () => void, onCategorySelect: (category: string) => void, onSelectProduct: (product: Product) => void }) {
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 6);
  const newAdditions = products.filter(p => p.isNew).slice(0, 6);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

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
        <p className="text-on-surface-variant mb-2 max-w-md">Spreading love - one cup at a time. Experience artisanal coffee delivered to your doorstep.</p>
        <p className="text-secondary font-bold text-sm mb-8">Free delivery for Chateau Elysee residents!</p>
        <button onClick={onOrderNow} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold active:scale-95 duration-200">Order Now</button>
      </section>

      {/* Announcements */}
      <section className="px-6 py-12">
        <h2 className="serif-display text-3xl font-bold text-primary mb-8">Announcements</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {announcements.map((ann) => (
            <button key={ann.id} onClick={() => setSelectedAnnouncement(ann)} className="bg-white p-6 rounded-2xl flex-shrink-0 w-72 shadow-sm border border-surface-container-low text-left">
              {ann.label && <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{ann.label}</span>}
              <h3 className="font-bold text-primary mb-2">{ann.title}</h3>
              <p className="text-xs text-on-surface-variant">{ann.description}</p>
            </button>
          ))}
          <div className="bg-surface-container-lowest p-6 rounded-2xl flex-shrink-0 w-32 flex items-center justify-center border border-dashed border-stone-300">
            <p className="text-xs text-stone-400 font-bold">More</p>
          </div>
        </div>
        {selectedAnnouncement && (
          <AnnouncementModal announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />
        )}
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
        <ScrollableSection title="Best Sellers" items={bestSellers} tag="BEST" tagColor="bg-yellow-500" onSelectProduct={onSelectProduct} />
      )}

      {/* New Additions */}
      {newAdditions.length > 0 && (
        <ScrollableSection title="New Additions" items={newAdditions} tag="NEW" tagColor="bg-red-500" onSelectProduct={onSelectProduct} />
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
