import { Star, Megaphone, BookOpen, ChevronRight, Quote, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { announcements } from '../constants';
import AnnouncementModal from './AnnouncementModal';
import { motion, AnimatePresence } from 'motion/react';

export default function CommunityPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const reviews = [
    { name: 'Sarah M.', text: 'Best coffee in Chateau Elysee! The staff is so friendly.', rating: 5 },
    { name: 'John D.', text: 'Love the new pastry selection. Always fresh.', rating: 5 },
    { name: 'Maria L.', text: 'My go-to spot for working from home.', rating: 4 },
    { name: 'Kevin P.', text: 'The Biscoff Latte is to die for. Highly recommended!', rating: 5 },
  ];

  return (
    <div className="pt-24 pb-32 px-4 max-w-lg mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="serif-display text-3xl font-black text-primary">Community Hub</h2>
          <p className="text-xs text-stone-400">Stay updated & connect with neighborhood coffee lovers</p>
        </div>
        <div className="bg-secondary/15 text-secondary p-2.5 rounded-2xl flex items-center justify-center">
          <Sparkles size={18} />
        </div>
      </div>

      {/* 1. Announcements (Cotti Promo Panel Style) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Megaphone size={14} className="text-secondary" />
          <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-widest">Announcements</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3.5">
          {announcements.map((ann) => (
            <motion.button 
              key={ann.id} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAnnouncement(ann)} 
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100/80 w-full text-left group hover:border-primary/20 transition-all duration-300 flex justify-between items-center"
            >
              <div className="flex-1 pr-4">
                <span className="bg-primary/5 text-primary text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase mb-2 inline-block">
                  {ann.label || 'Notice'}
                </span>
                <h4 className="font-black text-primary text-sm mb-1 group-hover:text-secondary transition-colors">
                  {ann.title}
                </h4>
                <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-1">
                  {ann.description}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                <ChevronRight size={16} />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 2. Customer Reviews (Cohesive grid) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Star size={14} className="text-secondary" />
          <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-widest">Customer Feedback</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3.5">
          {reviews.map((review, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100/85 relative overflow-hidden"
            >
              <Quote className="absolute -right-1 -bottom-1 text-stone-50/70 pointer-events-none" size={48} />
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center font-black text-primary text-[10px]">
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-black text-primary text-xs">{review.name}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} size={10} className={starI < review.rating ? "fill-yellow-400 text-yellow-400" : "text-stone-200"} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic relative z-10">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Our Story (Promo Card Style) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <BookOpen size={14} className="text-secondary" />
          <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-widest">Our Story</h3>
        </div>
        
        <div className="bg-primary text-white p-6 rounded-[2rem] shadow-lg shadow-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-secondary/15 rounded-full -mr-12 -mt-12 blur-xl pointer-events-none" />
          <p className="text-xs text-stone-300 mb-4 leading-relaxed relative z-10">
            We believe in ethical sourcing and sustainable practices. Every bean is carefully selected to ensure the highest quality for your cup.
          </p>
          <a href="#" className="inline-flex items-center gap-1 text-secondary font-black text-[10px] uppercase tracking-wider hover:underline relative z-10">
            Read Sustainability Report <ChevronRight size={12} />
          </a>
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

