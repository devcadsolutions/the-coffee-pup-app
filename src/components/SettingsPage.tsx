import { User, Shield, Bell, ChevronRight, LogOut, CreditCard, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <div className="pb-24 space-y-8">
      <section className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-surface-container-high" />
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-secondary mb-1">Elite Member</p>
          <h2 className="text-xl font-bold text-primary">Julian Vance</h2>
          <p className="text-on-surface-variant text-sm">julian.v@coffee-pup.com</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant px-2">App Preferences</h3>
        <div className="bg-white rounded-lg p-2">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4"><Bell className="text-secondary" /> <div><p className="font-bold text-sm">Notifications</p><p className="text-xs text-on-surface-variant">Brew status & rewards</p></div></div>
            <div className="w-10 h-5 bg-secondary rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
          </div>
        </div>
      </section>

      <Link to="/admin" className="w-full py-4 rounded-full border border-primary text-primary font-bold text-sm uppercase tracking-widest text-center block">Admin Panel</Link>

      <button className="w-full py-4 rounded-full border border-error/20 text-error font-bold text-sm uppercase tracking-widest">Sign Out</button>
    </div>
  );
}
