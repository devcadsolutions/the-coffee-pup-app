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
    <nav className="fixed bottom-3 left-4 right-4 z-50 max-w-4xl mx-auto rounded-[2rem] bg-white/85 backdrop-blur-lg border border-stone-100 px-3 pb-safe shadow-2xl shadow-primary/10 sm:left-6 sm:right-6">
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
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
