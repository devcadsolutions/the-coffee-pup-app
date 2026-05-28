import { Coffee, Star, Leaf, Cake, Award, Clock, MapPin, Truck, Package, Plus, Sparkles, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useRef, useState, useEffect } from 'react';
import { announcements } from '../constants';
import AnnouncementModal from './AnnouncementModal';
import { motion, AnimatePresence } from 'motion/react';
import { resolveProductImage } from '../utils/productImages';

const BestsellerCard = ({ product, onSelectProduct }: { product: Product, onSelectProduct: (product: Product) => void }) => {
  const startingPrice = Math.min(...product.variants.filter(v => v.price !== null).map(v => v.price as number));
  
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="bg-white rounded-[2rem] shadow-md hover:shadow-xl border border-stone-100 overflow-hidden flex flex-col h-full group transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-stone-50">
        <img 
          src={resolveProductImage(product)} 
          alt={product.name} 
          className="w-full h-full object-contain bg-stone-50/40 p-2 transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-primary text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles size={9} className="text-secondary" />
          POPULAR
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-black text-primary text-base mb-1 line-clamp-1 group-hover:text-secondary transition-colors">{product.name}</h3>
          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
          <div>
            <span className="text-[9px] text-stone-400 block uppercase tracking-widest font-black">Starts at</span>
            <span className="text-primary font-black text-base">₱{startingPrice.toFixed(2)}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectProduct(product)}
            className="bg-primary text-white p-2.5 rounded-full shadow-md shadow-primary/20 hover:bg-secondary transition-colors"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage({ 
  products, 
  onOrderNow, 
  onCategorySelect, 
  onSelectProduct,
  orders = []
}: { 
  products: Product[], 
  onOrderNow: () => void, 
  onCategorySelect: (category: string) => void, 
  onSelectProduct: (product: Product) => void,
  orders?: any[]
}) {
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 6);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address Modal temporary states
  const [tempPickupLocation, setTempPickupLocation] = useState<'Uncle John\'s' | 'Eiffel Cluster Lobby' | 'Clubhouse'>('Uncle John\'s');
  const [tempCluster, setTempCluster] = useState('Seine');
  const [tempBuilding, setTempBuilding] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [tempUnit, setTempUnit] = useState('');

  const homeCategories = [
    { id: 'Coffee', name: 'Coffee', icon: Coffee },
    { id: 'Signature', name: 'Signature', icon: Award },
    { id: 'Matcha', name: 'Matcha', icon: Leaf },
    { id: 'Non-Coffee', name: 'Non-Coffee', icon: Leaf },
    { id: 'Bottles', name: 'Bottles', icon: Package },
    { id: 'Toasts', name: 'Toasts', icon: Cake },
    { id: 'Pastries', name: 'Pastries', icon: Cake },
  ];

  const promos = [
    { title: "First Order Discount", desc: "Enjoy ₱20 OFF on your first purchase!", code: "WELCOME20" },
    { title: "Chateau Elysee Free Delivery", desc: "Free delivery right to your cluster doorstep.", code: "CHATEAUFREE" },
    { title: "Brewed Fresh Daily", desc: "Premium beans sourced locally & handcrafted with passion.", code: "FRESHBREW" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Initialize address values
  useEffect(() => {
    const saved = localStorage.getItem('coffee_pup_current_address');
    if (saved) {
      setSelectedAddress(saved);
      // Parse details
      if (saved.startsWith('Pickup - ')) {
        setOrderType('pickup');
        setTempPickupLocation(saved.replace('Pickup - ', '') as any);
      } else {
        setOrderType('delivery');
        const parts = saved.split(' ');
        if (parts.length >= 3) {
          setTempCluster(parts[0]);
          setTempBuilding(parts[1] as any);
          setTempUnit(parts[2]);
        }
      }
    } else {
      setSelectedAddress(orderType === 'pickup' ? "Pickup - Uncle John's" : "Seine A 101");
    }
  }, [orderType]);

  const handleSaveAddress = () => {
    let finalAddress = '';
    if (orderType === 'pickup') {
      finalAddress = `Pickup - ${tempPickupLocation}`;
    } else {
      if (!tempUnit) {
        alert('Please enter your unit number.');
        return;
      }
      finalAddress = `${tempCluster} ${tempBuilding} ${tempUnit}`;
    }
    localStorage.setItem('coffee_pup_current_address', finalAddress);
    setSelectedAddress(finalAddress);
    setShowAddressModal(false);
  };

  // Find active orders
  const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Out for Delivery'].includes(o.status));
  const latestActiveOrder = activeOrders[0];

  const getStatusStep = (status: string) => {
    if (status === 'Preparing') return 2;
    if (status === 'Out for Delivery') return 3;
    return 1; // Pending
  };

  return (
    <div className="pb-32 bg-surface">
      {/* Active Order Status Tracker Widget (Pulsing Apple-Style Card) */}
      <AnimatePresence>
        {latestActiveOrder && (
          <motion.section 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-4 max-w-lg mx-auto"
          >
            <div className="bg-primary text-white rounded-[2rem] p-5 shadow-lg border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live Order Tracker
                </span>
                <span className="text-[10px] font-mono opacity-80">#{latestActiveOrder.orderId.split('_')[1]}</span>
              </div>

              <h4 className="font-serif text-lg font-black mb-1">
                {latestActiveOrder.status === 'Pending' ? 'Order Placed' : 
                 latestActiveOrder.status === 'Preparing' ? 'Brewing Coffee' : 
                 'Out for Delivery'}
              </h4>
              <p className="text-[11px] opacity-80 mb-4 leading-relaxed">
                {latestActiveOrder.status === 'Pending' ? 'Waiting for confirmation from the shop...' : 
                 latestActiveOrder.status === 'Preparing' ? 'Your coffee is being crafted with love.' : 
                 'Our rider is delivering it straight to your lobby!'}
              </p>

              {/* Steps Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] uppercase font-black tracking-wider opacity-60">
                  <span>Placed</span>
                  <span>Brewing</span>
                  <span>Dispatched</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(step => {
                    const currentStep = getStatusStep(latestActiveOrder.status);
                    const isCompleted = currentStep >= step;
                    const isActive = currentStep === step;
                    return (
                      <div 
                        key={step} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-secondary' : 'bg-white/20'
                        } ${isActive ? 'animate-pulse shadow-sm shadow-secondary/50' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 1. Header Order Type & Address Picker */}
      <section className="pt-4 px-4 max-w-lg mx-auto">
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100/80">
          <div className="flex bg-stone-50 p-1 rounded-2xl mb-4">
            <button
              onClick={() => { setOrderType('pickup'); }}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                orderType === 'pickup' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-stone-400 hover:text-primary'
              }`}
            >
              <Package size={14} />
              Store Pickup
            </button>
            <button
              onClick={() => { setOrderType('delivery'); }}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                orderType === 'delivery' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-stone-400 hover:text-primary'
              }`}
            >
              <Truck size={14} />
              Delivery
            </button>
          </div>

          <div className="flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin size={14} className="text-secondary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-black text-primary text-sm truncate max-w-[200px]">
                  {orderType === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                </p>
                <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                  {selectedAddress}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddressModal(true)}
              className="bg-secondary/15 hover:bg-secondary/25 text-secondary px-3.5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </section>

      {/* 2. Visual Promotional Carousel Banner */}
      <section className="px-4 mt-6 max-w-lg mx-auto">
        <div className="relative overflow-hidden bg-primary text-white rounded-[2rem] p-6 shadow-lg shadow-primary/5 min-h-[140px] flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPromoIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="z-10"
            >
              <span className="bg-secondary text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase mb-2 inline-block">
                Exclusive Deal
              </span>
              <h3 className="font-serif text-xl font-black mb-1">{promos[currentPromoIndex].title}</h3>
              <p className="text-[11px] opacity-80 leading-relaxed mb-4">{promos[currentPromoIndex].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Categories Grid Selection */}
      <section className="px-4 mt-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 px-2 mb-4">
          <Clock size={12} className="text-secondary" />
          <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-widest">Our Categories</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
          {homeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className="flex flex-col items-center gap-2 bg-white p-4.5 rounded-[1.8rem] shadow-sm border border-stone-100 hover:border-primary/20 transition-all min-w-[85px] flex-shrink-0 group"
            >
              <div className="p-3.5 rounded-2xl bg-stone-50 text-primary group-hover:bg-primary/5 group-hover:text-secondary transition-colors">
                <cat.icon size={18} />
              </div>
              <span className="text-[10px] font-black text-primary tracking-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="px-4 mt-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-secondary" />
            <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-widest">Signature Bestsellers</h3>
          </div>
          <button 
            onClick={onOrderNow}
            className="text-[10px] text-secondary font-black uppercase tracking-wider flex items-center gap-0.5 hover:underline"
          >
            Full Menu <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {bestSellers.map(product => (
            <BestsellerCard key={product.id} product={product} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* Address Picker Sheet Modal (Slide-up Apple-style) */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center p-0" onClick={() => setShowAddressModal(false)}>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-[2.5rem] p-6 w-full max-w-lg shadow-2xl space-y-6 pb-12"
            >
              <div className="flex justify-between items-center border-b border-stone-50 pb-4">
                <h3 className="font-serif text-xl font-black text-primary">
                  {orderType === 'pickup' ? 'Select Pickup Spot' : 'Set Delivery Location'}
                </h3>
                <button onClick={() => setShowAddressModal(false)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-400">
                  <X size={18} />
                </button>
              </div>

              {orderType === 'pickup' ? (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Available Spots</label>
                  <div className="grid gap-2.5">
                    {['Uncle John\'s', 'Eiffel Cluster Lobby', 'Clubhouse'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setTempPickupLocation(loc as any)}
                        className={`p-4 rounded-2xl font-black text-xs text-left transition-all flex justify-between items-center border ${
                          tempPickupLocation === loc 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-stone-50 text-stone-600 border-stone-100'
                        }`}
                      >
                        {loc}
                        {tempPickupLocation === loc && <Star size={12} className="text-secondary fill-secondary" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Cluster</label>
                    <div className="flex flex-wrap gap-2">
                      {['Concorde', 'La Fayette', 'Eiffel', 'Seine', 'Vendome', 'Ritz'].map(c => (
                        <button 
                          key={c} 
                          type="button" 
                          onClick={() => setTempCluster(c)} 
                          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                            tempCluster === c 
                              ? 'bg-primary text-white border-primary shadow-sm' 
                              : 'bg-stone-50 text-stone-600 border-stone-100'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Building</label>
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D'].map(b => (
                          <button 
                            key={b} 
                            type="button" 
                            onClick={() => setTempBuilding(b as any)} 
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                              tempBuilding === b 
                                ? 'bg-primary text-white border-primary shadow-sm' 
                                : 'bg-stone-50 text-stone-600 border-stone-100'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Unit Number</label>
                      <input 
                        required 
                        type="text" 
                        value={tempUnit} 
                        onChange={e => setTempUnit(e.target.value)} 
                        placeholder="e.g. 101" 
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs transition-all" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveAddress}
                className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4"
              >
                Confirm Spot
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement Modal Support */}
      {selectedAnnouncement && (
        <AnnouncementModal announcement={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />
      )}
    </div>
  );
}
