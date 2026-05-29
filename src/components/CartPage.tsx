import { CartItem, Product } from '../types';
import { products } from '../data/mockData';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage({ cart, onCheckout, updateCartItemQuantity, removeFromCart }: { cart: CartItem[], onCheckout: () => void, updateCartItemQuantity: (itemId: string, delta: number) => void, removeFromCart: (itemId: string) => void }) {
  const getProduct = (id: string) => products.find(p => p.id === id);
  const getVariantPrice = (product: Product, variantName: string) => (product.variants || []).find(v => v.name === variantName)?.price || 0;
  
  // Group identical items
  const groupedCart = cart.reduce((acc, item) => {
    const key = `${item.productId}-${item.customizations.variantName}-${JSON.stringify(item.customizations.selectedModifiers)}`;
    if (acc[key]) {
      acc[key].quantity += item.quantity;
    } else {
      acc[key] = { ...item };
    }
    return acc;
  }, {} as Record<string, CartItem>);

  const groupedItems = Object.values(groupedCart);

  const subtotal = groupedItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    if (!product) return sum;
    const variantPrice = getVariantPrice(product, item.customizations.variantName);
    const modifiersPrice = item.customizations.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
    return sum + (variantPrice + modifiersPrice) * item.quantity;
  }, 0);

  if (groupedItems.length === 0) {
    return (
      <div className="pb-24 space-y-8 text-center py-20">
        <h2 className="font-serif text-3xl font-bold text-primary">Your Cart</h2>
        <p className="text-on-surface-variant">Your cart is empty. Time to add some delicious treats!</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-8">
      <h2 className="font-serif text-3xl font-bold text-primary">Your Cart</h2>
      <div className="space-y-4">
        {groupedItems.map(item => {
          const product = getProduct(item.productId);
          const variantPrice = product ? getVariantPrice(product, item.customizations.variantName) : 0;
          const modifiersPrice = item.customizations.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
          const itemTotal = (variantPrice + modifiersPrice) * item.quantity;
          
          return (
            <div key={item.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
              <div className="flex-1">
                <p className="font-bold">{product?.name}</p>
                <p className="text-xs text-stone-500">{item.customizations.variantName}</p>
                {item.customizations.selectedModifiers.map(m => (
                  <p key={`${m.groupId}-${m.option.id}`} className="text-xs text-primary">+ {m.option.name}</p>
                ))}
                {item.customizations.selectedModifiers.length > 3 && (
                  <p className="text-red-500 text-[10px] italic mt-1">Whoa there! Too many add-ons might make your drink a bit... crowded! ☕️</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateCartItemQuantity(item.id, -1)} className="p-1 rounded-full bg-surface-container-low"><Minus size={14} /></button>
                  <span className="font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateCartItemQuantity(item.id, 1)} className="p-1 rounded-full bg-surface-container-low"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="font-bold">₱{(itemTotal).toFixed(2)}</p>
            </div>
          );
        })}
      </div>
      <div className="border-t pt-4">
        <p className="font-bold text-xl">Total: ₱{subtotal.toFixed(2)}</p>
        <button 
          onClick={onCheckout} 
          className="w-full mt-4 bg-primary text-white py-4 rounded-full font-bold"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
