import { User, Shield, Bell, ChevronRight, LogOut, CreditCard, Lock } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage({ onNavigateToAdmin }: { onNavigateToAdmin: () => void }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === "admin123") {
      setShowPasswordModal(false);
      setPassword('');
      setError('');
      onNavigateToAdmin();
    } else {
      setError("Incorrect password");
      setPassword('');
    }
  };

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

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant px-2">Account Settings</h3>
        <div className="bg-white rounded-lg p-2">
          {[ { icon: User, label: 'Personal Info', onClick: () => {} }, { icon: Shield, label: 'Security & Privacy', onClick: () => {} }, { icon: Lock, label: 'Admin', onClick: handleAdminClick } ].map(item => (
            <button key={item.label} onClick={item.onClick} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low rounded-md">
              <div className="flex items-center gap-4"><item.icon className="text-primary" /> <p className="font-bold text-sm">{item.label}</p></div>
              <ChevronRight className="text-outline-variant" />
            </button>
          ))}
        </div>
      </section>

      <button className="w-full py-4 rounded-full border border-error/20 text-error font-bold text-sm uppercase tracking-widest">Sign Out</button>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 p-6 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg">Enter Admin Password</h3>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 border rounded"
              placeholder="Password"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-4">
              <button onClick={() => { setShowPasswordModal(false); setError(''); }} className="flex-1 py-2 rounded border">Cancel</button>
              <button onClick={handlePasswordSubmit} className="flex-1 py-2 rounded bg-primary text-white">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
