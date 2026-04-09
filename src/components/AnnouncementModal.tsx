import { X } from 'lucide-react';
import { motion } from 'motion/react';

export default function AnnouncementModal({ announcement, onClose }: { announcement: any, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-primary">{announcement.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-lowest rounded-full"><X size={20} /></button>
        </div>
        <div className="text-sm text-on-surface-variant whitespace-pre-line space-y-2">
          {announcement.fullContent}
        </div>
      </motion.div>
    </motion.div>
  );
}
