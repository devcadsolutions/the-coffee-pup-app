import { Star, Megaphone, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { announcements } from '../constants';
import AnnouncementModal from './AnnouncementModal';

export default function CommunityPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const reviews = [
    { name: 'Sarah M.', text: 'Best coffee in Chateau Elysee! The staff is so friendly.', rating: 5 },
    { name: 'John D.', text: 'Love the new pastry selection. Always fresh.', rating: 5 },
    { name: 'Maria L.', text: 'My go-to spot for working from home.', rating: 4 },
  ];

  return (
    <div className="pb-32 px-6 space-y-12">
      <h2 className="font-serif text-3xl font-bold text-primary">Community</h2>

      <section>
        <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2"><Megaphone size={20} /> Announcements</h3>
        <div className="space-y-4">
          {announcements.map((ann) => (
            <button key={ann.id} onClick={() => setSelectedAnnouncement(ann)} className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low w-full text-left">
              <h4 className="font-bold text-primary">{ann.title}</h4>
              <p className="text-xs text-on-surface-variant">{ann.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2"><Star size={20} /> Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-primary">{review.name}</span>
                <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="text-sm text-on-surface-variant">{review.text}</p>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-3 rounded-full border border-primary text-primary font-bold text-sm">See More Reviews</button>
      </section>

      <section>
        <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2"><BookOpen size={20} /> References</h3>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-low">
          <p className="text-sm text-on-surface-variant mb-4">Check out our coffee sourcing and sustainability practices.</p>
          <a href="#" className="text-primary font-bold underline text-sm">Read our Sustainability Report</a>
        </div>
      </section>

      {selectedAnnouncement && (
        <AnnouncementModal announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />
      )}
    </div>
  );
}
