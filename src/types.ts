export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  options: ModifierOption[];
  minSelect?: number;
  maxSelect?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Coffee' | 'Non-Coffee' | 'Toasts' | 'Pastries' | 'Others';
  imageUrl: string;
  variants: { name: string; price: number | null }[];
  modifierGroups?: ModifierGroup[];
  isNew?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  status?: 'active' | 'unavailable' | 'hidden';
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customizations: {
    variantName: string;
    selectedModifiers: { groupId: string; option: ModifierOption }[];
    specialInstructions?: string;
  };
}

export interface CheckoutDetails {
  type: 'pickup' | 'outside';
  deliveryMethod?: 'Lalamove' | 'Grab' | 'MoveIt' | 'Any';
  pickupLocation?: 'Uncle John\'s' | 'Eiffel Cluster Lobby' | 'Clubhouse';
  name: string;
  contactNumber: string;
  notes?: string;
  paymentMethod: 'gcash' | 'maya';
}
