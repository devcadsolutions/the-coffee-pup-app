import { Coffee, Star, Leaf, Cake, Award, Clock, MapPin, ChevronLeft, ChevronRight, Truck, Package, Info, Quote, Plus, Sparkles, Navigation, Send } from 'lucide-react';
import { Product } from '../types';
import { useRef, useState, useEffect } from 'react';
import { announcements } from '../constants';
import AnnouncementModal from './AnnouncementModal';
import { motion, AnimatePresence } from 'motion/react';

const BestsellerCard = ({ product, onSelectProduct }: { product: Product, onSelectProduct: (product: Product) => void }) => {
  const startingPrice = Math.min(...product.variants.filter(v => v.price !== null).map(v => v.price as number));
  
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="bg-white rounded-[2rem] shadow-md hover:shadow-xl border border-stone-100 overflow-hidden flex flex-col h-full group transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-stone-50">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-primary text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles size={9} className="text-secondary" />
          POPULAR
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-black text-primary text-base mb-1 line-clamp-1 group-hover:text-secondary transition-colors">{product.name}</h3>
          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
          <div>
            <span className="text-[9px] text-stone-400 block uppercase tracking-widest font-black">Starts at</span>
            <span className="text-primary font-black text-base">₱{startingPrice.toFixed(2)}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectProduct(product)}
            className="bg-primary text-white p-2.5 rounded-full shadow-md shadow-primary/20 hover:bg-secondary transition-colors"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage({ products, onOrderNow, onCategorySelect, onSelectProduct }: { products: Product[], onOrderNow: () => void, onCategorySelect: (category: string) => void, onSelectProduct: (product: Product) => void }) {
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 6);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

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

  const promos = [
    { title: "First Order Discount", desc: "Enjoy ₱20 OFF on your first purchase!", code: "WELCOME20" },
    { title: "Chateau Elysee Free Delivery", desc: "Free delivery right to your cluster doorstep.", code: "CHATEAUFREE" },
    { title: "Brewed Fresh Daily", desc: "Premium beans sourced locally & handcrafted with passion.", code: "FRESHBREW" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    { name: "Maria S.", text: "The Spanish Latte is a game changer! Best coffee in Chateau Elysee.", rating: 5 },
    { name: "James R.", text: "Super fast delivery and the packaging is so cute. My daily morning ritual.", rating: 5 },
    { name: "Liza K.", text: "The Egg & Cheese toast is perfect for breakfast. Highly recommended!", rating: 4 },
  ];

  return (
    <div className="pb-32 bg-surface">
      {/* 1. Header Order Type Selection Toggle (Cotti App Signature Style) */}
      <section className="pt-4 px-4 max-w-lg mx-auto">
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100/80">
          <div className="flex bg-stone-50 p-1 rounded-2xl mb-4">
            <button
              onClick={() => setOrderType('pickup')}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                orderType === 'pickup' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-stone-400 hover:text-primary'
              }`}
            >
              <Package size={14} />
              Store Pickup
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                orderType === 'delivery' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-stone-400 hover:text-primary'
              }`}
            >
              <Truck size={14} />
              Delivery
            </button>
          </div>

          <div className="flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin size={14} className="text-secondary" />
              <div>
                <p className="font-black text-primary text-sm">The Coffee Pup HQ</p>
                <p className="text-[10px] text-stone-400">Chateau Elysee, Parañaque City</p>
              </div>
            </div>
            <button 
              onClick={onOrderNow}
              className="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors"
            >
              {orderType === 'pickup' ? 'Order' : 'Set Address'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Visual Promotional Carousel Banner */}
      <section className="px-4 mt-6 max-w-lg mx-auto">
        <div className="relative overflow-hidden bg-primary text-white rounded-[2rem] p-6 shadow-lg shadow-primary/5 min-h-[140px] flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPromoIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="z-10"
            >
              <span className="bg-secondary text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase mb-2 inline-block">
                Exclusive Deal
              </span>
              <h3 className="font-serif text-xl font-black mb-1">{promos[currentPromoIndex].title}</h3>
              <p className="text-xs text-stone-300">{promos[currentPromoIndex].desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center z-10 pt-4 mt-2 border-t border-white/10">
            <span className="text-[9px] font-mono tracking-widest text-stone-300">CODE: {promos[currentPromoIndex].code}</span>
            <div className="flex gap-1">
              {promos.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentPromoIndex ? 'bg-secondary w-3' : 'bg-white/30'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Grid - Compact & Friendly Icons */}
      <section className="px-4 mt-10 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-sm text-stone-400 uppercase tracking-widest">Categories</h2>
          <button onClick={() => onCategorySelect('All')} className="text-xs font-black text-secondary hover:underline flex items-center gap-0.5">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-[2rem] border border-stone-100/80 shadow-sm">
          {homeCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <motion.button 
                key={cat.id} 
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategorySelect(cat.id)} 
                className="flex flex-col items-center gap-2 group p-2 rounded-2xl hover:bg-stone-50 transition-colors"
              >
                <div className="bg-stone-50 group-hover:bg-primary/5 p-3 rounded-full text-primary transition-colors">
                  <Icon size={20} />
                </div>
                <span className="font-bold text-[10px] text-stone-600 line-clamp-1">{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers Section */}
      <section className="px-4 mt-10 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-sm text-stone-400 uppercase tracking-widest">🔥 Best Sellers</h2>
          <button onClick={() => onCategorySelect('All')} className="text-xs font-black text-secondary hover:underline flex items-center gap-0.5">
            Full Menu <ChevronRight size={14} />
          </button>
        </div>
        <div 
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {bestSellers.map(product => (
            <div key={product.id} className="min-w-[180px] w-[180px] snap-start">
              <BestsellerCard product={product} onSelectProduct={onSelectProduct} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. What's New / Announcements */}
      <section className="px-4 mt-10 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-sm text-stone-400 uppercase tracking-widest">What's New</h2>
          <div className="flex gap-1.5">
            <button onClick={() => annScrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })} className="p-1.5 rounded-full bg-white border border-stone-100 text-primary shadow-sm"><ChevronLeft size={12} /></button>
            <button onClick={() => annScrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })} className="p-1.5 rounded-full bg-white border border-stone-100 text-primary shadow-sm"><ChevronRight size={12} /></button>
          </div>
        </div>
        <div 
          ref={annScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {announcements.map((ann) => (
            <motion.button 
              key={ann.id} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAnnouncement(ann)} 
              className="min-w-[260px] w-[260px] snap-start bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 text-left group hover:border-secondary/30 transition-all duration-300"
            >
              <div className="bg-secondary/15 text-secondary w-8 h-8 rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:text-white transition-all">
                <Info size={16} />
              </div>
              <h3 className="font-black text-primary text-sm mb-1 line-clamp-1 group-hover:text-secondary transition-colors">{ann.title}</h3>
              <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{ann.description}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 6. Cohesive Reviews Carousel */}
      <section className="px-4 mt-10 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="font-black text-sm text-stone-400 uppercase tracking-widest mb-1">What People Say</h2>
          <p className="text-xs text-stone-500">Reviews from our coffee loving neighbors</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {testimonials.slice(0, 2).map((t, i) => (
            <div 
              key={i} 
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden"
            >
              <Quote className="absolute -right-2 -bottom-2 text-stone-50 pointer-events-none" size={60} />
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, starI) => (
                  <Star key={starI} size={12} className={starI < t.rating ? "fill-yellow-400 text-yellow-400" : "text-stone-200"} />
                ))}
              </div>
              <p className="text-xs text-stone-600 font-medium italic mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center font-black text-primary text-[9px]">
                  {t.name.charAt(0)}
                </div>
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{t.name}</p>
              </div>
            </div>
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
