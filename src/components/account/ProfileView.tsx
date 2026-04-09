import { useState, useEffect } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { auth, db, doc, onSnapshot, updateDoc } from '../../lib/firebase';

export default function ProfileView() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setNickname(data.nickname || '');
        setEmail(data.email || '');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        nickname,
        email
      });
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-surface-container-lowest rounded-full flex items-center justify-center overflow-hidden">
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={48} className="text-primary" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md">
            <Camera size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-secondary mb-1">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container-lowest border border-surface-container-low focus:border-primary outline-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-secondary mb-1">Nickname</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container-lowest border border-surface-container-low focus:border-primary outline-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-secondary mb-1">Email Address</label>
          <input type="email" value={email} disabled className="w-full p-3 rounded-xl bg-surface-container-lowest border border-surface-container-low opacity-60 cursor-not-allowed" />
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
