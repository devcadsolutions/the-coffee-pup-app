
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
import { QrCode, Download, ShoppingCart, Settings, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import AnnouncementModal from './components/AnnouncementModal';
import { auth, onAuthStateChanged, db, doc, onSnapshot, updateDoc, setDoc } from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<CheckoutDetails & { total: number } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [menuProducts, setMenuProducts] = useState<Product[]>(initialProducts);
  const [showQr, setShowQr] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Cart and Favorites from Firestore
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

  // Sync Cart to Firestore
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
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setIsCheckingOut(true);
    }
  };

  const handleConfirmOrder = async (details: CheckoutDetails) => {
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
        productId: item.productId,
        quantity: item.quantity,
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

    setOrderConfirmed({ ...details, total, items: cart });
    
    // Save order to Firestore
    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, orderData);
    } catch (err) {
      console.error('Error saving order:', err);
    }

    setCart([]);
    setIsCheckingOut(false);
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
    if (activePage === 'orders') {
      return (
        <CartPage 
          cart={cart} 
          onCheckout={handleCheckout} 
          updateCartItemQuantity={updateCartItemQuantity} 
          removeFromCart={removeFromCart} 
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

  if (orderConfirmed) {
    return (
      <div className="min-h-screen flex flex-col p-6 bg-surface">
        <h2 className="font-serif text-3xl font-bold text-primary mb-6">Order Confirmed!</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <p className="text-on-surface-variant">Total: <span className="font-bold text-primary">₱{orderConfirmed.total.toFixed(2)}</span></p>
          <p className="text-on-surface-variant">Payment Method: <span className="font-bold text-primary uppercase">{orderConfirmed.paymentMethod}</span></p>
          <div className="border-t pt-4">
            <h4 className="font-bold text-primary mb-2">Items Ordered</h4>
            <ul className="text-sm text-on-surface-variant space-y-1">
              {orderConfirmed.items.map((item: any, i: number) => (
                <li key={i}>{item.quantity}x {menuProducts.find(p => p.id === item.productId)?.name} ({item.customizations.variantName})</li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-bold text-primary mb-2">Payment QR Code</h4>
            <div className="bg-gray-100 p-4 rounded-xl flex justify-center cursor-pointer" onClick={() => setShowQr(true)}>
              <QrCode size={128} className="text-primary" />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">Please scan or download the QR code then send the payment and take a screenshot.</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <button onClick={() => { setOrderConfirmed(null); setActivePage('home'); }} className="w-full bg-primary text-white py-4 rounded-full font-bold">Return to Menu</button>
          <button className="w-full bg-surface text-primary py-4 rounded-full font-bold border border-primary">Send to Messenger</button>
        </div>
        {showQr && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowQr(false)}>
            <div className="bg-white p-8 rounded-2xl text-center">
              <QrCode size={256} className="text-primary mx-auto" />
              <p className="mt-4 font-bold">Janeane Paredes</p>
              <div className="mt-6 flex gap-4">
                <button className="flex-1 bg-primary text-white py-3 rounded-full font-bold flex items-center justify-center gap-2"><Download size={18} /> Download</button>
                <button className="flex-1 bg-surface text-primary py-3 rounded-full font-bold" onClick={() => setShowQr(false)}>Back</button>
              </div>
            </div>
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
            <main className="pt-20 px-6">
              <CheckoutPage 
                total={calculateTotal()}
                onConfirm={handleConfirmOrder}
                onCancel={() => setIsCheckingOut(false)}
                user={user}
              />
            </main>
          ) : (
            <>
              <header className="fixed top-0 w-full z-50 bg-primary text-white flex items-center justify-between px-6 h-16 shadow-md">
                <div className="w-8" />
                <h1 className="font-serif font-bold text-xl cursor-pointer" onClick={() => setActivePage('home')}>The Coffee Pup</h1>
                <div className="flex gap-4">
                  <button onClick={() => setActivePage('orders')} className="relative">
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <ShoppingCart size={20} />
                    </motion.div>
                    {cart.length > 0 && (
                      <motion.span 
                        key={cart.reduce((sum, item) => sum + item.quantity, 0)}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </motion.span>
                    )}
                  </button>
                  <button onClick={() => setActivePage('settings')}>
                    <motion.div whileTap={{ rotate: 360 }}>
                      <Settings size={20} />
                    </motion.div>
                  </button>
                </div>
              </header>

              <main className="pt-20 px-6">
                {renderActivePage()}
              </main>

              <BottomNav activePage={activePage} setPage={(page) => { setActivePage(page); setSelectedCategory(null); }} />
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
