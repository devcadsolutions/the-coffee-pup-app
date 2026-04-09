import React from 'react';
import { LayoutDashboard, ShoppingBag, Coffee, Settings, BarChart, Menu as MenuIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu', path: '/admin/menu', icon: Coffee },
    { name: 'Add-ons', path: '/admin/addons', icon: Coffee },
    { name: 'Reports', path: '/admin/reports', icon: BarChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-surface-container-low p-6 flex-col">
        <h1 className="font-serif text-2xl font-bold text-primary mb-8">Admin Panel</h1>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-xl font-bold ${location.pathname === item.path ? 'bg-primary text-white' : 'text-primary hover:bg-surface'}`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-container-low p-2 flex justify-around z-50">
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${location.pathname === item.path ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
