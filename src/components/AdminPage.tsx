import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, signInWithPopup, googleProvider } from '../lib/firebase';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isInIframe, setIsInIframe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      setPassword(''); // Clear password on error
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to login with Google. Please try opening in a new tab.');
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm space-y-4">
        <h1 className="font-serif text-2xl font-bold text-primary mb-6">Admin Login</h1>
        
        {isInIframe && (
          <div className="bg-yellow-50 p-4 rounded-xl text-sm text-yellow-800 mb-4">
            <p className="mb-2">Login might be blocked in this view.</p>
            <button 
              type="button" 
              onClick={openInNewTab}
              className="w-full bg-yellow-100 text-yellow-900 py-2 rounded-lg font-bold hover:bg-yellow-200"
            >
              Open Login in New Tab
            </button>
          </div>
        )}

        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="w-full p-3 border rounded-xl"
          placeholder="Email"
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="w-full p-3 border rounded-xl"
          placeholder="Password"
        />
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-full font-bold">Login</button>
        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          className="w-full bg-white border border-gray-300 text-gray-700 py-4 rounded-full font-bold hover:bg-gray-50"
        >
          Continue with Google
        </button>
        <Link to="/" className="block text-center text-primary font-medium hover:underline">Back to App</Link>
      </form>
    </div>
  );
}
