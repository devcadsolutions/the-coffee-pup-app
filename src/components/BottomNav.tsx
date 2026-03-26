import { motion } from 'motion/react';
import { Home, ReceiptText, Settings, Coffee } from 'lucide-react';

export default function BottomNav({ activePage, setPage }: { activePage: string, setPage: (page: string) => void }) {
  const navItems = [
    { name: 'Home', icon: Home, id: 'home', animation: { rotate: [0, 20, -20, 0] } },
    { name: 'Menu', icon: Coffee, id: 'menu', animation: { y: [0, -5, 0] } },
    { name: 'Orders', icon: ReceiptText, id: 'orders', animation: { scale: [1, 1.1, 1] } },
    { name: 'Settings', icon: Settings, id: 'settings', animation: { rotate: 360 } },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl z-50 rounded-t-[2rem] shadow-[0_-20px_40px_rgba(26,28,28,0.06)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              isActive 
                ? 'text-primary bg-surface-container-low rounded-full px-4 py-1' 
                : 'text-stone-400 hover:text-secondary'
            }`}
          >
            <motion.div
              animate={isActive ? item.animation : {}}
              transition={{ duration: 0.5 }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[10px] uppercase tracking-widest font-bold mt-0.5">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
