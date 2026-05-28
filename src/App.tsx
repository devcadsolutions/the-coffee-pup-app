import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import CustomizationPage from './components/CustomizationPage';
import CartPage from './components/CartPage';
import HomePage from './components/HomePage';
import SettingsPage from './components/SettingsPage';
import AccountPage from './components/AccountPage';
import CommunityPage from './components/CommunityPage';
import ProductCategoriesPage from './components/ProductCategoriesPage';
import CheckoutPage from './components/CheckoutPage';
import AuthPage from './components/AuthPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import AdminPage from './components/AdminPage';
import OrdersPage from './components/admin/OrdersPage';
import MenuManagement from './components/admin/MenuManagement';
import AddonManagement from './components/admin/AddonManagement';
import Reports from './components/admin/Reports';
import Settings from './components/admin/Settings';
import Dashboard from './components/admin/Dashboard';
import { Product, CartItem, CheckoutDetails } from './types';
import { products as initialProducts } from './data/mockData';
import { QrCode, Download, ShoppingCart, Settings as SettingsIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import AnnouncementModal from './components/AnnouncementModal';
import UserOrdersPage from './components/UserOrdersPage';
import { auth, onAuthStateChanged, db, doc, onSnapshot, updateDoc, setDoc } from './lib/firebase';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import NotificationBell from './components/NotificationBell';
import InstallPrompt from './components/InstallPrompt';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { requestNotificationPermission, sendLocalNotification } from './lib/notifications';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<CheckoutDetails & { total: number, items: CartItem[], orderId: string, createdAt: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [menuProducts, setMenuProducts] = useState<Product[]>(initialProducts);
  const [showQr, setShowQr] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { showPrompt, handleInstall, handleDismiss } = useInstallPrompt();

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
        .then(reg => console.log('SW registered', reg))
        .catch(err => console.error('SW registration failed', err));
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser({
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || 'Coffee Lover',
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser({
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || 'Coffee Lover',
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  // Disable Sync Cart and Favorites from Firestore for local-only mode
  /*
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.cart) setCart(data.cart);
        if (data.favorites) {
          setMenuProducts(prev => prev.map(p => ({
            ...p,
            isFavorite: data.favorites.includes(p.id)
          })));
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Cart to Firestore disabled for local-only mode
  useEffect(() => {
    if (!user || authLoading) return;
    
    const syncCart = async () => {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { cart });
      } catch (err) {
        console.error('Error syncing cart:', err);
      }
    };

    const timeoutId = setTimeout(syncCart, 1000);
    return () => clearTimeout(timeoutId);
  }, [cart, user, authLoading]);
  */

  const handleAddToCart = (item: CartItem, navigateToOrders: boolean = false) => {
    setCart(prev => {
      const existingItem = prev.find(i => 
        i.productId === item.productId &&
        i.customizations.variantName === item.customizations.variantName &&
        JSON.stringify(i.customizations.selectedModifiers) === JSON.stringify(item.customizations.selectedModifiers) &&
        i.customizations.specialInstructions === item.customizations.specialInstructions
      );

      if (existingItem) {
        return prev.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      } else {
        return [...prev, item];
      }
    });
    setSelectedProduct(null);
    if (navigateToOrders) {
      setActivePage('orders');
    } else {
      setActivePage('menu');
    }
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleFavorite = async (productId: string) => {
    // Keep internal state only for local mode
    setMenuProducts(prev => prev.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p));
    /*
    if (!user) return;

    const product = menuProducts.find(p => p.id === productId);
    if (!product) return;

    const isFav = !product.isFavorite;
    
    // Optimistic UI update
    setMenuProducts(prev => prev.map(p => p.id === productId ? { ...p, isFavorite: isFav } : p));

    const userRef = doc(db, 'users', user.uid);
    try {
      const currentFavorites = menuProducts.filter(p => p.isFavorite).map(p => p.id);
      let newFavorites;
      if (isFav) {
        newFavorites = [...new Set([...currentFavorites, productId])];
      } else {
        newFavorites = currentFavorites.filter(id => id !== productId);
      }
      await updateDoc(userRef, { favorites: newFavorites });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert on error
      setMenuProducts(prev => prev.map(p => p.id === productId ? { ...p, isFavorite: !isFav } : p));
    }
    */
  };

  const calculateTotal = () => {
    const getProduct = (id: string) => menuProducts.find(p => p.id === id);
    const getVariantPrice = (product: Product, variantName: string) => product.variants.find(v => v.name === variantName)?.price || 0;
    
    return cart.reduce((sum, item) => {
      const product = getProduct(item.productId);
      if (!product) return sum;
      const variantPrice = getVariantPrice(product, item.customizations.variantName);
      const modifiersPrice = item.customizations.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
      return sum + (variantPrice + modifiersPrice) * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    // Enable checkout without auth prompt for local mode
    setIsCheckingOut(true);
  };

  const handleConfirmOrder = async (details: CheckoutDetails) => {
    setIsConfirming(true);
    const total = calculateTotal() + details.deliveryFee;
    const subtotal = calculateTotal();
    const orderId = `order_${Date.now()}`;
    const now = new Date().toISOString();

    const orderData = {
      uid: user?.uid || 'guest',
      orderNumber: orderId,
      customerName: details.name,
      phoneNumber: details.contactNumber,
      address: details.type === 'chateau' 
        ? `${details.chateauCluster} ${details.chateauBuilding} ${details.chateauUnit}`
        : details.pickupLocation || 'N/A',
      type: details.type,
      items: cart.map(item => ({
        name: menuProducts.find(p => p.id === item.productId)?.name || 'Unknown',
        productId: item.productId,
        quantity: item.quantity,
        price: (menuProducts.find(p => p.id === item.productId)?.variants.find(v => v.name === item.customizations.variantName)?.price || 0) + item.customizations.selectedModifiers.reduce((s, m) => s + m.option.price, 0),
        customizations: item.customizations
      })),
      subtotal,
      deliveryFee: details.deliveryFee,
      total,
      paymentMethod: details.paymentMethod,
      paymentStatus: 'pending',
      status: 'Pending',
      notes: details.notes || '',
      createdAt: now,
      updatedAt: now
    };

    // Save order to Firestore disabled for local-only mode
    /*
    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, orderData);
    } catch (err) {
      console.error('Error saving order:', err);
    }
    */

    // Simulate transition
    setTimeout(() => {
      setOrderConfirmed({ ...details, total, items: cart, orderId, createdAt: now });
      setCart([]);
      setIsCheckingOut(false);
      setIsConfirming(false);
      
      // Local notification only
      if (user) {
        setTimeout(() => {
          sendLocalNotification('Order Placed!', `Your order #${orderId.split('_')[1]} is being prepared.`);
        }, 1000);
      }
    }, 1500); // Faster simulation for counter machine feel
  };

  useEffect(() => {
    if (user && showAuthPrompt) {
      setShowAuthPrompt(false);
      setIsCheckingOut(true);
    }
  }, [user, showAuthPrompt]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-primary font-bold font-serif text-xl">Brewing your experience...</p>
      </div>
    );
  }

  const renderActivePage = () => {
    if (activePage === 'home') {
      return (
        <HomePage 
          products={menuProducts} 
          onOrderNow={() => { setActivePage('menu'); setSelectedCategory('All'); }} 
          onCategorySelect={(cat) => { setActivePage('menu'); setSelectedCategory(cat); }} 
          onSelectProduct={setSelectedProduct} 
        />
      );
    }
    if (activePage === 'orders') {
      return (
        <UserOrdersPage 
          cart={cart} 
          onCheckout={handleCheckout}
          updateCartItemQuantity={updateCartItemQuantity}
          removeFromCart={removeFromCart}
        />
      );
    }
    if (activePage === 'cart') {
      return (
        <CartPage 
          cart={cart} 
          onCheckout={handleCheckout} 
          updateCartItemQuantity={updateCartItemQuantity} 
          removeFromCart={removeFromCart} 
        />
      );
    }
    if (activePage === 'menu') {
      return (
        <ProductCategoriesPage 
          products={menuProducts}
          selectedCategory={selectedCategory || 'Coffee'}
          onSelectCategory={setSelectedCategory} 
          onSelectProduct={setSelectedProduct}
          toggleFavorite={toggleFavorite}
        />
      );
    }
    if (activePage === 'account') {
      return user ? <AccountPage /> : <AuthPage onGuestContinue={() => setActivePage('home')} />;
    }
    if (activePage === 'community') {
      return <CommunityPage />;
    }
    if (activePage === 'settings') {
      return <SettingsPage onNavigateToAdmin={() => setActivePage('admin')} />;
    }
    return null;
  };

  if (showAuthPrompt) {
    return (
      <AuthPage 
        onGuestContinue={() => {
          setShowAuthPrompt(false);
          setIsCheckingOut(true);
        }} 
      />
    );
  }

  if (isConfirming) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <h2 className="font-serif text-3xl font-bold text-primary">Confirming your order...</h2>
      </div>
    );
  }

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-surface flex flex-col pt-24 pb-12 px-6 max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-600/5">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="serif-display text-4xl font-black text-primary mb-2">Order Placed!</h2>
          <p className="text-stone-500 text-sm">Your brew is being prepared with love.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 border border-stone-100 overflow-hidden mb-8">
          <div className="p-8 border-b border-stone-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Order Details</span>
              <span className="font-black text-primary text-sm">#{orderConfirmed.orderId.split('_')[1]}</span>
            </div>
            <div className="space-y-4">
              {orderConfirmed.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-[10px] font-black text-primary">{item.quantity}x</span>
                    <span className="text-sm font-medium text-stone-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-primary">₱{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-stone-50/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-stone-500">Payment Method</span>
              <span className="text-xs font-black text-primary uppercase tracking-widest">{orderConfirmed.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-primary">Total Amount</span>
              <span className="text-2xl font-black text-primary">₱{orderConfirmed.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-8 border-t border-stone-50 text-center">
            <h4 className="font-black text-primary text-sm mb-4 uppercase tracking-widest">Scan to Pay</h4>
            <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-stone-100 flex justify-center cursor-pointer group" onClick={() => setShowQr(true)}>
              <QrCode size={160} className="text-primary group-hover:scale-105 transition-transform" />
            </div>
            <p className="text-[10px] text-stone-400 mt-4 leading-relaxed">
              Please scan the QR code to complete your payment. <br/>Take a screenshot and send it to our Messenger.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => { setOrderConfirmed(null); setActivePage('home'); }} 
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20"
          >
            Return to Home
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white text-primary py-5 rounded-2xl font-black text-sm border-2 border-stone-100"
          >
            Send to Messenger
          </motion.button>
        </div>

        {showQr && (
          <div className="fixed inset-0 bg-primary/90 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setShowQr(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] text-center max-w-xs w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-6">
                <QrCode size={200} className="text-primary mx-auto" />
              </div>
              <h3 className="font-serif text-2xl font-black text-primary mb-1">Janeane Paredes</h3>
              <p className="text-stone-400 text-xs font-black uppercase tracking-widest mb-8">GCash / Maya</p>
              <div className="flex flex-col gap-3">
                <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                  <Download size={18} /> Save QR Code
                </button>
                <button className="w-full text-stone-400 font-black text-xs uppercase tracking-widest py-2" onClick={() => setShowQr(false)}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="addons" element={<AddonManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/*" element={
        <div className="min-h-screen bg-surface pb-32">
          {selectedProduct ? (
            <CustomizationPage 
              product={selectedProduct} 
              onAddToCart={(item) => handleAddToCart(item, false)} 
              onProceedToOrder={(item) => handleAddToCart(item, true)}
              onCancel={() => setSelectedProduct(null)} 
            />
          ) : isCheckingOut ? (
            <main className="pt-20 px-4 sm:px-6">
              <CheckoutPage 
                total={calculateTotal()}
                onConfirm={handleConfirmOrder}
                onCancel={() => setIsCheckingOut(false)}
                user={user}
              />
            </main>
          ) : (
            <>
              <header className="fixed top-3 left-4 right-4 z-50 h-20 max-w-4xl mx-auto rounded-[2rem] bg-white/85 backdrop-blur-xl flex items-center justify-between px-5 sm:left-6 sm:right-6 sm:px-6 border border-stone-100 shadow-lg shadow-primary/5">
                <div className="w-10" />
                <h1 className="font-serif font-black text-2xl text-primary cursor-pointer tracking-tight" onClick={() => setActivePage('home')}>
                  The Coffee Pup
                </h1>
                <div className="flex gap-3">
                  <NotificationBell />
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActivePage('orders')} 
                    className="relative w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-primary"
                  >
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                      <motion.span 
                        key={cart.reduce((sum, item) => sum + item.quantity, 0)}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white"
                      >
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </motion.span>
                    )}
                  </motion.button>
                  <motion.button 
                    whileTap={{ rotate: 90 }}
                    onClick={() => setActivePage('settings')}
                    className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-primary"
                  >
                    <SettingsIcon size={20} />
                  </motion.button>
                </div>
              </header>

              <main className="min-h-screen">
                {renderActivePage()}
              </main>

              <BottomNav activePage={activePage} setPage={(page) => { setActivePage(page); setSelectedCategory(null); }} />
              <InstallPrompt show={showPrompt} onInstall={handleInstall} onDismiss={handleDismiss} />
              {selectedAnnouncement && (
                <AnnouncementModal announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />
              )}
            </>
          )}
        </div>
      } />
    </Routes>
  );
}
