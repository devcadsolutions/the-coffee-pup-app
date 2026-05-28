import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, doc, setDoc, getDoc } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'motion/react';
import { Coffee, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function AuthPage({ onGuestContinue }: { onGuestContinue?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthError = (err: any) => {
    console.error('Auth Error:', err);
    setError(err.message || 'An error occurred. Please try again.');
  };

  const syncUserToFirestore = async (user: any, displayName?: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: displayName || user.displayName || 'Coffee Lover',
        email: user.email,
        photoURL: user.photoURL || '',
        favorites: [],
        cart: []
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSupabaseConfigured) {
        const { error: supabaseErr } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (supabaseErr) throw supabaseErr;
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        await syncUserToFirestore(result.user);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSupabaseConfigured) {
        if (isLogin) {
          const { error: supabaseErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (supabaseErr) throw supabaseErr;
        } else {
          const { error: supabaseErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: name || 'Coffee Lover',
              },
            },
          });
          if (supabaseErr) throw supabaseErr;
          setError('Signup successful! Please check your email for confirmation.');
        }
      } else {
        if (isLogin) {
          const result = await signInWithEmailAndPassword(auth, email, password);
          await syncUserToFirestore(result.user);
        } else {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          await syncUserToFirestore(result.user, name);
        }
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-surface-container-low"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-4 rounded-2xl mb-4 shadow-lg">
            <Coffee className="text-white" size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary">The Coffee Pup</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            {isLogin ? 'Welcome back, coffee lover!' : 'Join our coffee community'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm border border-red-100"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-primary font-medium"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-primary font-medium"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border border-transparent focus:border-primary focus:bg-white transition-all outline-none text-primary font-medium"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-container-low"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-on-surface-variant font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-surface-container-low text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
          Google
        </button>

        <p className="text-center mt-8 text-on-surface-variant text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {onGuestContinue && (
          <div className="mt-8 pt-8 border-t border-surface-container-low">
            <button 
              onClick={onGuestContinue}
              className="w-full bg-surface text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border border-primary/20 hover:bg-surface-container-lowest transition-all active:scale-95 shadow-sm"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
