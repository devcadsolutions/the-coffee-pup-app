import { useState } from 'react';
import BottomNav from './components/BottomNav';
import CustomizationPage from './components/CustomizationPage';
import CartPage from './components/CartPage';
import HomePage from './components/HomePage';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import ProductCategoriesPage from './components/ProductCategoriesPage';
import CheckoutPage from './components/CheckoutPage';
import { Product, CartItem, CheckoutDetails } from './types';
import { products as initialProducts } from './data/mockData';
import { QrCode, Download, Share2 } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<CheckoutDetails & { total: number } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [menuProducts, setMenuProducts] = useState<Product[]>(initialProducts);
  const [showQr, setShowQr] = useState(false);

  const handleAddToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setSelectedProduct(null);
    setActivePage('orders');
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
    setIsCheckingOut(true);
  };

  const handleConfirmOrder = (details: CheckoutDetails) => {
    setOrderConfirmed({ ...details, total: calculateTotal() });
    setCart([]);
    setIsCheckingOut(false);
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen flex flex-col p-6 bg-surface">
        <h2 className="font-serif text-3xl font-bold text-primary mb-6">Order Confirmed!</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <p className="text-on-surface-variant">Total: <span className="font-bold text-primary">₱{orderConfirmed.total.toFixed(2)}</span></p>
          <p className="text-on-surface-variant">Payment Method: <span className="font-bold text-primary uppercase">{orderConfirmed.paymentMethod}</span></p>
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
    <div className="min-h-screen bg-surface pb-32">
      {selectedProduct ? (
        <CustomizationPage 
          product={selectedProduct} 
          onAddToCart={handleAddToCart} 
          onCancel={() => setSelectedProduct(null)} 
        />
      ) : isCheckingOut ? (
        <main className="pt-20 px-6">
          <CheckoutPage 
            total={calculateTotal()}
            onConfirm={handleConfirmOrder}
            onCancel={() => setIsCheckingOut(false)}
          />
        </main>
      ) : (
        <>
          <header className="fixed top-0 w-full z-50 bg-primary text-white flex items-center justify-center px-6 h-16 shadow-md">
            <h1 className="font-serif font-bold text-xl">The Coffee Pup</h1>
          </header>

          <main className="pt-20 px-6">
            {activePage === 'home' && <HomePage products={menuProducts} onOrderNow={() => { setActivePage('menu'); setSelectedCategory('All'); }} onCategorySelect={(cat) => { setActivePage('menu'); setSelectedCategory(cat); }} />}
            {activePage === 'menu' && (
              <ProductCategoriesPage 
                products={menuProducts}
                selectedCategory={selectedCategory || 'Coffee'}
                onSelectCategory={setSelectedCategory} 
                onSelectProduct={setSelectedProduct}
              />
            )}
            {activePage === 'orders' && <CartPage cart={cart} onCheckout={handleCheckout} />}
            {activePage === 'settings' && <SettingsPage onNavigateToAdmin={() => setActivePage('admin')} />}
            {activePage === 'admin' && <AdminPage products={menuProducts} setProducts={setMenuProducts} onBack={() => setActivePage('settings')} />}
          </main>

          <BottomNav activePage={activePage} setPage={(page) => { setActivePage(page); setSelectedCategory(null); }} />
        </>
      )}
    </div>
  );
}
