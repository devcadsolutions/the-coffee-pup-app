import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, X, Download } from 'lucide-react';

interface InstallPromptProps {
  show: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export default function InstallPrompt({ show, onInstall, onDismiss }: InstallPromptProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-6 right-6 z-[60]"
        >
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-primary text-sm">Save to Home Screen</h4>
              <p className="text-[10px] text-stone-500">Access The Coffee Pup faster!</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onInstall}
                className="bg-primary text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Install
              </button>
              <button 
                onClick={onDismiss}
                className="p-2 text-stone-300 hover:text-stone-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
