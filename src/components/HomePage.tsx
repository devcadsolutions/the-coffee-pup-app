import { Coffee, Star, Leaf, Cake, Award, Clock, MapPin, ChevronLeft, ChevronRight, Truck, Package, Info, Quote, Plus, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useRef, useState, useEffect } from 'react';
import { announcements } from '../constants';
import AnnouncementModal from './AnnouncementModal';
import { motion, AnimatePresence } from 'motion/react';

const BestsellerCard = ({ product, onSelectProduct }: { product: Product, onSelectProduct: (product: Product) => void }) => {
  const startingPrice = Math.min(...product.variants.filter(v => v.price !== null).map(v => v.price as number));
  
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full group"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles size={10} className="text-secondary" />
          BESTSELLER
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-primary text-xl mb-1 group-hover:text-secondary transition-colors">{product.name}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-6 flex-1 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-stone-400 block uppercase tracking-widest font-black mb-0.5">Starting at</span>
            <span className="text-primary font-black text-lg">₱{startingPrice.toFixed(2)}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectProduct(product)}
            className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:bg-secondary transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage({ products, onOrderNow, onCategorySelect, onSelectProduct }: { products: Product[], onOrderNow: () => void, onCategorySelect: (category: string) => void, onSelectProduct: (product: Product) => void }) {
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 6);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const homeCategories = [
    { id: 'Coffee', name: 'Coffee', icon: Coffee },
    { id: 'Signature', name: 'Signature', icon: Award },
    { id: 'Matcha', name: 'Matcha', icon: Leaf },
    { id: 'Non-Coffee', name: 'Non-Coffee', icon: Leaf },
    { id: 'Bottles', name: 'Bottles', icon: Package },
    { id: 'Toasts', name: 'Toasts', icon: Cake },
    { id: 'Pastries', name: 'Pastries', icon: Cake },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const annScrollRef = useRef<HTMLDivElement>(null);
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
  }, [bestSellers]);

  const testimonials = [
    { name: "Maria S.", text: "The Spanish Latte is a game changer! Best coffee in Chateau Elysee.", rating: 5 },
    { name: "James R.", text: "Super fast delivery and the packaging is so cute. My daily morning ritual.", rating: 5 },
    { name: "Liza K.", text: "The Egg & Cheese toast is perfect for breakfast. Highly recommended!", rating: 4 },
  ];

  return (
    <div className="pb-32 bg-surface">
      {/* Sticky CTA for Mobile */}
      <div className="fixed top-20 left-0 right-0 z-40 px-6 pointer-events-none md:hidden">
        <motion.button
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={onOrderNow}
          className="w-full bg-primary/90 backdrop-blur-md text-white py-4 rounded-2xl font-black shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 pointer-events-auto border border-white/10"
        >
          <Coffee size={20} />
          Build Your Drink
        </motion.button>
      </div>

      {/* 1. Hero Section */}
      <section className="relative px-6 pt-24 pb-16 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-secondary/20"
        >
          Est. 2024 • Handcrafted with Love
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="serif-display text-5xl md:text-7xl font-black text-primary leading-[1.1] mb-8"
        >
          Your Morning Ritual,<br />
          <span className="text-secondary">Handcrafted.</span>
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex gap-4 w-full max-w-md"
        >
          <button 
            onClick={onOrderNow} 
            className="flex-1 bg-primary text-white px-8 py-5 rounded-[2rem] font-black shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Coffee size={20} />
            Build Your Drink
          </button>
          <button 
            onClick={() => onCategorySelect('All')} 
            className="flex-1 bg-white text-primary border-2 border-stone-100 px-8 py-5 rounded-[2rem] font-black active:scale-95 transition-all"
          >
            View Menu
          </button>
        </motion.div>
      </section>

      {/* 2. Announcements Carousel */}
      <section className="px-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="serif-display text-2xl font-black text-primary">What's New</h2>
          <div className="flex gap-2">
            <button onClick={() => annScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })} className="p-2 rounded-full bg-white border border-stone-100 text-primary"><ChevronLeft size={16} /></button>
            <button onClick={() => annScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })} className="p-2 rounded-full bg-white border border-stone-100 text-primary"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div 
          ref={annScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 snap-x snap-mandatory"
        >
          {announcements.map((ann) => (
            <motion.button 
              key={ann.id} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAnnouncement(ann)} 
              className="min-w-[280px] w-[280px] snap-start bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 text-left group transition-all hover:border-secondary/30"
            >
              <div className="bg-secondary/10 text-secondary w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-all">
                <Info size={20} />
              </div>
              <h3 className="font-black text-primary text-lg mb-2 group-hover:text-secondary transition-colors">{ann.title}</h3>
              <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{ann.description}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers */}
      <section className="relative px-6 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="serif-display text-3xl font-black text-primary">🔥 Best Sellers</h2>
          </div>
          <button onClick={() => onCategorySelect('All')} className="text-sm font-black text-secondary flex items-center gap-1 hover:underline">
            Full Menu <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="relative group">
          <div 
            ref={scrollRef} 
            onScroll={checkScroll} 
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 snap-x snap-mandatory"
          >
            {bestSellers.map(product => (
              <div key={product.id} className="min-w-[300px] w-[300px] snap-start">
                <BestsellerCard product={product} onSelectProduct={onSelectProduct} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Menu Categories */}
      <section className="px-6 mb-16">
        <h2 className="serif-display text-3xl font-black text-primary mb-8">Explore Menu</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {homeCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <motion.button 
                key={cat.id} 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategorySelect(cat.id)} 
                className="bg-white p-6 rounded-[2rem] flex flex-col items-center shadow-sm border border-stone-100 gap-4 transition-all hover:border-secondary/30"
              >
                <div className="bg-stone-50 p-4 rounded-2xl text-primary">
                  <Icon size={32} />
                </div>
                <span className="font-black text-sm text-primary">{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 5. Trust / Info Section */}
      <section className="px-6 mb-16">
        <div className="bg-primary text-white rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Truck size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-black">Fast Delivery</h3>
              <p className="text-stone-300 text-sm leading-relaxed">Available via Lalamove & FoodPanda. Free delivery for Chateau Elysee residents!</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Package size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-black">Easy Pickup</h3>
              <p className="text-stone-300 text-sm leading-relaxed">Order ahead and skip the line. Your drink will be ready when you arrive.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Clock size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-black">Operating Hours</h3>
              <p className="text-stone-300 text-sm leading-relaxed">We're open Monday to Saturday, from 10:00 AM to 9:00 PM.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Reviews */}
      <section className="px-6 mb-12">
        <div className="text-center mb-12">
          <h2 className="serif-display text-4xl font-black text-primary mb-4">What People Say</h2>
          <p className="text-stone-500">Join our community of coffee lovers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100 relative group"
            >
              <Quote className="absolute top-8 right-8 text-stone-100 group-hover:text-secondary/10 transition-colors" size={64} />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, starI) => (
                  <Star key={starI} size={16} className={starI < t.rating ? "fill-yellow-400 text-yellow-400" : "text-stone-200"} />
                ))}
              </div>
              <p className="text-lg text-primary font-medium italic mb-8 leading-relaxed relative z-10">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-black text-primary text-xs">
                  {t.name.charAt(0)}
                </div>
                <p className="text-xs font-black text-secondary uppercase tracking-widest">{t.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedAnnouncement && (
          <AnnouncementModal announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
