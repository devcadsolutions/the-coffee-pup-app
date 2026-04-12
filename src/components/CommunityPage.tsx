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
    <div className="pt-24 pb-32 px-6 max-w-lg mx-auto space-y-16">
      <div className="flex items-center justify-between">
        <h2 className="serif-display text-4xl font-black text-primary">Community</h2>
        <div className="bg-secondary/10 text-secondary p-2 rounded-xl">
          <Sparkles size={20} />
        </div>
      </div>

      {/* Announcements Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary text-white p-2 rounded-xl">
            <Megaphone size={20} />
          </div>
          <h3 className="font-black text-xl text-primary uppercase tracking-widest text-xs">Announcements</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((ann) => (
            <motion.button 
              key={ann.id} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAnnouncement(ann)} 
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 w-full text-left group hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-primary text-lg group-hover:text-secondary transition-colors">{ann.title}</h4>
                <ChevronRight size={18} className="text-stone-300 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{ann.description}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary text-white p-2 rounded-xl">
            <Star size={20} />
          </div>
          <h3 className="font-black text-xl text-primary uppercase tracking-widest text-xs">Customer Reviews</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {reviews.slice(0, 3).map((review, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 relative"
            >
              <Quote className="absolute top-6 right-6 text-stone-50" size={48} />
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-black text-primary text-[10px]">
                    {review.name.charAt(0)}
                  </div>
                  <span className="font-black text-primary text-sm">{review.name}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} size={12} className={starI < review.rating ? "fill-yellow-400 text-yellow-400" : "text-stone-200"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed italic">"{review.text}"</p>
            </motion.div>
          ))}
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="mt-8 w-full py-5 rounded-2xl border-2 border-stone-100 text-primary font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors"
        >
          See More Reviews
        </motion.button>
      </section>

      {/* Sourcing/Sustainability Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary text-white p-2 rounded-xl">
            <BookOpen size={20} />
          </div>
          <h3 className="font-black text-xl text-primary uppercase tracking-widest text-xs">Our Story</h3>
        </div>
        
        <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-xl shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
          <p className="text-sm text-stone-300 mb-6 leading-relaxed relative z-10">
            We believe in ethical sourcing and sustainable practices. Every bean is carefully selected to ensure the highest quality for your cup.
          </p>
          <a href="#" className="inline-flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest hover:underline relative z-10">
            Read Sustainability Report <ChevronRight size={14} />
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
