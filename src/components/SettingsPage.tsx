import { User, Shield, Bell, ChevronRight, LogOut, CreditCard, Lock, Settings, Coffee, MapPin, Sparkles, Smartphone, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { requestNotificationPermission } from '../lib/notifications';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export default function SettingsPage() {
  const user = auth.currentUser;
  const { handleInstall, canInstall } = useInstallPrompt();

  const handleNotificationToggle = async () => {
    if (user) {
      await requestNotificationPermission(user.uid);
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', value: user?.displayName || 'Julian Vance' },
        { icon: MapPin, label: 'Delivery Address', value: 'Chateau Elysee' },
        { icon: CreditCard, label: 'Payment Methods', value: 'Cash on Delivery' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          toggle: true, 
          description: 'Brew status & rewards',
          active: Notification.permission === 'granted',
          onClick: handleNotificationToggle
        },
        { icon: Coffee, label: 'Coffee Preferences', value: 'Medium Roast' },
      ]
    },
    {
      title: 'Quick Access',
      items: [
        { 
          icon: Smartphone, 
          label: 'Save to Home Screen', 
          description: canInstall ? 'Install app for quick access' : 'App is already installed or not supported',
          onClick: handleInstall,
          disabled: !canInstall
        },
      ]
    },
    {
      title: 'Support & Legal',
      items: [
        { icon: Shield, label: 'Privacy Policy' },
        { icon: Settings, label: 'App Settings' },
      ]
    }
  ];

  return (
    <div className="pt-24 pb-32 px-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="serif-display text-4xl font-black text-primary">Settings</h2>
        <div className="bg-secondary/10 text-secondary p-2 rounded-xl">
          <Sparkles size={20} />
        </div>
      </div>

      {/* User Hero Card */}
      <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-stone-200/20 flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Elite Member</p>
            <h3 className="font-black text-2xl">{user?.displayName || 'Julian Vance'}</h3>
            <p className="text-stone-300 text-xs font-medium opacity-80">{user?.email || 'julian.v@coffee-pup.com'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 px-2">{section.title}</h3>
            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <motion.button 
                    key={itemIdx}
                    whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between p-6 transition-colors ${
                      itemIdx !== section.items.length - 1 ? 'border-b border-stone-50' : ''
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-primary">
                        <Icon size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-primary text-sm">{item.label}</p>
                        {item.value && <p className="text-xs text-stone-400 font-medium">{item.value}</p>}
                        {item.description && <p className="text-[10px] text-stone-400 font-medium">{item.description}</p>}
                      </div>
                    </div>
                    {item.toggle ? (
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${item.active ? 'bg-primary' : 'bg-stone-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                      </div>
                    ) : (
                      <ChevronRight size={16} className="text-stone-300" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-4">
        <Link to="/admin" className="w-full py-5 rounded-2xl border-2 border-primary/10 text-primary font-black text-xs uppercase tracking-widest text-center block hover:bg-primary/5 transition-colors">
          Admin Panel
        </Link>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => auth.signOut()}
          className="w-full bg-red-50 text-red-600 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">The Coffee Pup v2.0.0 beta</p>
      </div>
    </div>
  );
}
