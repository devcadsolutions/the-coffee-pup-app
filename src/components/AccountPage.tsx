import { useState } from 'react';
import { User, MapPin, Phone, ShoppingBag, CreditCard, HelpCircle, LogOut, ChevronRight, X, Facebook, Instagram } from 'lucide-react';
import ProfileView from './account/ProfileView';
import AddressView from './account/AddressView';
import OrderHistoryView from './account/OrderHistoryView';
import PaymentHelpView from './account/PaymentHelpView';
import SupportView from './account/SupportView';
import { auth, signOut } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LogoutModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
        <h3 className="font-bold text-lg text-primary mb-2">Logout</h3>
        <p className="text-sm text-on-surface-variant mb-6">Are you sure you want to logout of your account?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-surface text-primary py-3 rounded-full font-bold">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile Information' },
    { id: 'addresses', icon: MapPin, label: 'Delivery Details' },
    { id: 'orders', icon: ShoppingBag, label: 'Order History' },
    { id: 'payment', icon: CreditCard, label: 'Payment Instructions / Help' },
    { id: 'support', icon: HelpCircle, label: 'Support / FAQ' },
    { id: 'logout', icon: LogOut, label: 'Logout', color: 'text-red-500' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileView />;
      case 'addresses': return <AddressView />;
      case 'orders': return <OrderHistoryView />;
      case 'payment': return <PaymentHelpView />;
      case 'support': return <SupportView />;
      default: return null;
    }
  };

  const getSectionTitle = () => {
    return menuItems.find(item => item.id === activeSection)?.label || 'Account';
  };

  return (
    <div className="pb-24">
      {activeSection ? (
        <div className="p-6">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary font-bold mb-6">
            <X size={20} /> Back
          </button>
          <h2 className="font-serif text-3xl font-bold text-primary mb-6">{getSectionTitle()}</h2>
          {renderSection()}
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-surface border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {auth.currentUser?.photoURL ? (
                <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={40} className="text-stone-300" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-primary">{auth.currentUser?.displayName || 'Hello!'}</h2>
              <p className="text-sm text-on-surface-variant">{auth.currentUser?.email}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 mb-6">
            {menuItems.map((item, i) => (
              <button 
                key={i} 
                onClick={() => item.id === 'logout' ? setShowLogoutModal(true) : setActiveSection(item.id)}
                className={`flex items-center justify-between gap-4 w-full p-3 rounded-xl hover:bg-surface-container-lowest ${item.color || 'text-primary'}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} />
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                {item.id !== 'logout' && <ChevronRight size={20} className="text-on-surface-variant" />}
              </button>
            ))}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-primary mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-surface-container-lowest rounded-full text-primary"><Facebook size={20} /></a>
              <a href="#" className="p-3 bg-surface-container-lowest rounded-full text-primary"><Instagram size={20} /></a>
              <a href="#" className="p-3 bg-surface-container-lowest rounded-full text-primary"><span className="font-bold text-xs">TikTok</span></a>
            </div>
          </div>
        </div>
      )}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
    </div>
  );
}
