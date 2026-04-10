import { motion } from 'motion/react';
import { Home, Coffee, Users, User, Receipt } from 'lucide-react';

export default function BottomNav({ activePage, setPage }: { activePage: string, setPage: (page: string) => void }) {
  const navItems = [
    { name: 'Home', icon: Home, id: 'home' },
    { name: 'Orders', icon: Receipt, id: 'orders' },
    { name: 'Menu', icon: Coffee, id: 'menu', isCenter: true },
    { name: 'Community', icon: Users, id: 'community' },
    { name: 'Account', icon: User, id: 'account' },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="relative bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between px-2 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          if (item.isCenter) {
            return (
              <div key={item.id} className="relative flex-1 flex items-center justify-center">
                <motion.button
                  onClick={() => setPage(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-6 bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 border-4 border-white"
                >
                  <Icon size={24} />
                </motion.button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-stone-400 hover:text-secondary'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className="text-[9px] font-bold mt-1">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
