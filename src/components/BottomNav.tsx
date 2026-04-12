import { motion } from 'motion/react';
import { Home, Coffee, Users, User, Receipt } from 'lucide-react';

export default function BottomNav({ activePage, setPage }: { activePage: string, setPage: (page: string) => void }) {
  const navItems = [
    { name: 'Home', icon: Home, id: 'home' },
    { name: 'Orders', icon: Receipt, id: 'orders' },
    { name: 'Menu', icon: Coffee, id: 'menu' },
    { name: 'Community', icon: Users, id: 'community' },
    { name: 'Account', icon: User, id: 'account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-stone-100 px-4 pb-safe">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-2xl transition-colors duration-200 ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-stone-400 group-hover:text-stone-600'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-bold transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-stone-400 group-hover:text-stone-600'
              }`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
