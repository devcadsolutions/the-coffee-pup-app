import { Product, ModifierGroup } from '../types';

const getImage = (name: string) => new URL(`../assets/images/${name}`, import.meta.url).href;

export const COFFEE_ADDONS: ModifierGroup = {
  id: 'modgrp_coffee_addons',
  name: 'Coffee Add-ons',
  options: [
    { id: 'mod_oat_milk', name: 'Oat Milk', price: 30 },
    { id: 'mod_skimmed_milk', name: 'Skimmed Milk', price: 45 },
    { id: 'mod_espresso_shot', name: 'Espresso Shot', price: 30 },
    { id: 'mod_creamer', name: 'Creamer', price: 30 },
    { id: 'mod_coffee_jelly', name: 'Coffee Jelly', price: 30 },
    { id: 'mod_crushed_oreo', name: 'Crushed Oreo', price: 30 },
    { id: 'mod_seasalt_cream', name: 'Seasalt Cream', price: 45 },
    { id: 'mod_biscoff_crumbles', name: 'Biscoff Crumbles', price: 30 },
    { id: 'mod_biscoff_biscuit', name: 'Biscoff Biscuit', price: 40 },
    { id: 'mod_vanilla_ice_cream', name: 'Vanilla Ice Cream', price: 35 },
    { id: 'mod_strawberry', name: 'Strawberry', price: 40 },
    { id: 'mod_mango_cubes', name: 'Mango Cubes', price: 40 },
    { id: 'mod_ube_syrup', name: 'Ube Syrup', price: 40 },
    { id: 'mod_white_chocolate_syrup', name: 'White Chocolate Syrup', price: 35 },
    { id: 'mod_broas', name: 'Broas', price: 35 },
    { id: 'mod_caramel_sauce', name: 'Caramel Sauce', price: 25 },
    { id: 'mod_chocolate_sauce', name: 'Chocolate Sauce', price: 25 },
    { id: 'mod_whipped_cream_coffee', name: 'Whipped Cream', price: 40 },
  ]
};

export const COFFEE_SYRUP: ModifierGroup = {
  id: 'modgrp_coffee_syrup',
  name: 'Coffee Syrup',
  options: [
    { id: 'mod_lemon_syrup', name: 'Lemon Syrup', price: 30 },
    { id: 'mod_vanilla_syrup', name: 'Vanilla Syrup', price: 30 },
    { id: 'mod_caramel_syrup', name: 'Caramel Syrup', price: 30 },
    { id: 'mod_salted_caramel_syrup', name: 'Salted Caramel Syrup', price: 30 },
    { id: 'mod_hazelnut_syrup', name: 'Hazelnut Syrup', price: 30 },
    { id: 'mod_pumpkin_spice_syrup', name: 'Pumpkin Spice Syrup', price: 30 },
    { id: 'mod_white_chocolate_syrup_m', name: 'White Chocolate Syrup', price: 30 },
    { id: 'mod_dark_chocolate_syrup', name: 'Dark Chocolate Syrup', price: 30 },
    { id: 'mod_peppermint_syrup', name: 'Peppermint Syrup', price: 30 },
  ]
};

export const DRIZZLE: ModifierGroup = {
  id: 'modgrp_drizzle',
  name: 'Drizzle',
  options: [
    { id: 'mod_caramel_drizzle', name: 'Caramel Drizzle', price: 30 },
    { id: 'mod_salted_caramel_drizzle', name: 'Salted Caramel Drizzle', price: 30 },
    { id: 'mod_chocolate_fudge_drizzle', name: 'Chocolate Fudge Drizzle', price: 30 },
    { id: 'mod_strawberry_drizzle', name: 'Strawberry Drizzle', price: 30 },
    { id: 'mod_white_chocolate_drizzle', name: 'White Chocolate Drizzle', price: 30 },
  ]
};

export const TOAST_ADDONS: ModifierGroup = {
  id: 'modgrp_toast_addons',
  name: 'Toast Add-ons',
  options: [
    { id: 'mod_slice_cheese', name: 'Slice Cheese', price: 25 },
    { id: 'mod_japanese_mayo', name: 'Japanese Mayo', price: 30 },
    { id: 'mod_ham', name: 'Ham', price: 40 },
    { id: 'mod_extra_toast', name: 'Extra Toast', price: 35 },
  ]
};

export const FRENCH_TOAST_ADDONS: ModifierGroup = {
  id: 'modgrp_french_toast_addons',
  name: 'French Toast Add-ons',
  options: [
    { id: 'mod_maple_syrup', name: 'Maple Syrup', price: 25 },
    { id: 'mod_cinnamon_powder', name: 'Cinnamon Powder', price: 20 },
    { id: 'mod_butter', name: 'Butter', price: 15 },
    { id: 'mod_condensed_milk', name: 'Condensed Milk', price: 15 },
    { id: 'mod_powdered_sugar', name: 'Powdered Sugar', price: 15 },
    { id: 'mod_nutella', name: 'Nutella', price: 40 },
    { id: 'mod_strawberry_jam', name: 'Strawberry Jam', price: 35 },
    { id: 'mod_chocolate_syrup', name: 'Chocolate Syrup', price: 30 },
    { id: 'mod_caramel_syrup_ft', name: 'Caramel Syrup', price: 30 },
    { id: 'mod_vanilla_ice_cream_ft', name: 'Vanilla Ice Cream', price: 35 },
    { id: 'mod_whipped_cream', name: 'Whipped Cream', price: 45 },
  ]
};

export const products: Product[] = [
  {
    id: 'americano',
    name: 'Americano',
    description: 'Coffee - the classic way',
    category: 'Coffee',
    imageUrl: getImage('Americano.jpg'),
    isBestSeller: true,
    isNew: true,
    variants: [
      { name: 'Iced', price: 95 },
      { name: 'Hot', price: 90 },
      { name: 'Bottled 400 ml', price: 120 },
      { name: '1L Bottle', price: 250 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'cafe-latte',
    name: 'Cafe Latte',
    description: 'The classic, enticing fusion of espresso and rich milk',
    category: 'Coffee',
    imageUrl: getImage('Cafe Latte.jpg'),
    isBestSeller: true,
    isNew: true,
    variants: [
      { name: 'Iced', price: 100 },
      { name: 'Hot', price: 95 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 270 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'caramel-macchiato',
    name: 'Caramel Macchiato',
    description: 'Espresso and creamy milk drizzled with caramel sweetness',
    category: 'Coffee',
    imageUrl: getImage('Caramel Macchiato.jpg'),
    isBestSeller: true,
    isNew: true,
    variants: [
      { name: 'Iced', price: 105 },
      { name: 'Hot', price: 100 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 290 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'french-vanilla-latte',
    name: 'French Vanilla Latte',
    description: 'The perfect harmony of coffee and luxurious French vanilla',
    category: 'Coffee',
    imageUrl: getImage('French Vanilla.jpg'),
    isBestSeller: true,
    isNew: true,
    variants: [
      { name: 'Iced', price: 105 },
      { name: 'Hot', price: 100 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 290 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    description: 'A symphony of bold espresso and sumptuous condensed milk',
    category: 'Coffee',
    imageUrl: getImage('Spanish Latte.jpg'),
    isBestSeller: true,
    isNew: true,
    isSignature: true,
    variants: [
      { name: 'Iced', price: 110 },
      { name: 'Hot', price: 105 },
      { name: 'Bottled 400 ml', price: 145 },
      { name: '1L Bottle', price: 320 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'hazelnut-latte',
    name: 'Hazelnut Latte',
    description: 'Savor the irresistible blend of creamy sweetness and hazelnut',
    category: 'Coffee',
    imageUrl: getImage('Hazelnut Latte.jpg'),
    isBestSeller: true,
    isNew: true,
    variants: [
      { name: 'Iced', price: 105 },
      { name: 'Hot', price: 100 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 290 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'salted-caramel-macchiato',
    name: 'Salted Caramel Macchiato',
    description: 'Salted caramel-y goodness in every delicious sip',
    category: 'Coffee',
    imageUrl: getImage('Salted Caramel Macchiato.jpg'),
    variants: [
      { name: 'Iced', price: 110 },
      { name: 'Hot', price: 105 },
      { name: 'Bottled 400 ml', price: 145 },
      { name: '1L Bottle', price: 320 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'coffee-jelly-latte',
    name: 'Coffee Jelly Latte',
    description: 'Delight in caffeine elevated with coffee jelly cubes',
    category: 'Coffee',
    imageUrl: getImage('Coffee Jelly Latte.jpg'),
    variants: [
      { name: 'Iced', price: 115 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: 150 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'oreo-latte',
    name: 'Oreo Latte',
    description: 'A decadent allure of caffeine and Oreo\'s iconic flavor',
    category: 'Coffee',
    imageUrl: getImage('Oreo Latte.jpg'),
    variants: [
      { name: 'Iced', price: 115 },
      { name: 'Hot', price: 110 },
      { name: 'Bottled 400 ml', price: 150 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'pumpkin-spice-latte',
    name: 'Pumpkin Spice Latte',
    description: 'A touch of seasonal magic in every delicious sip',
    category: 'Coffee',
    imageUrl: getImage('Pumpkin Spice Latte.jpg'),
    variants: [
      { name: 'Iced', price: 115 },
      { name: 'Hot', price: 110 },
      { name: 'Bottled 400 ml', price: 150 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'white-mocha-latte',
    name: 'White Mocha Latte',
    description: 'A heavenly blend of coffee, milk, and white chocolate delight',
    category: 'Coffee',
    imageUrl: getImage('White Mocha Latte.jpg'),
    variants: [
      { name: 'Iced', price: 115 },
      { name: 'Hot', price: 110 },
      { name: 'Bottled 400 ml', price: 150 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'mocha-latte',
    name: 'Mocha Latte',
    description: 'Experience the deliciousness of chocolate-infused coffee perfection',
    category: 'Coffee',
    imageUrl: getImage('Mocha Latte.jpg'),
    variants: [
      { name: 'Iced', price: 115 },
      { name: 'Hot', price: 110 },
      { name: 'Bottled 400 ml', price: 150 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'ube-latte',
    name: 'Ube Latte',
    description: 'Rich velvety taste of ube plus the caffeine kick of espresso in one',
    category: 'Coffee',
    imageUrl: getImage('Ube Latte.jpg'),
    variants: [
      { name: 'Iced', price: 115 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: 155 },
      { name: '1L Bottle', price: 370 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'dirty-matcha',
    name: 'Dirty Matcha',
    description: 'A refreshing trio: matcha, milk, and a shot of invigorating espresso',
    category: 'Coffee',
    imageUrl: getImage('Dirty Matcha.jpg'),
    variants: [
      { name: 'Iced', price: 155 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: 200 },
      { name: '1L Bottle', price: 420 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'black-charcoal-latte',
    name: 'Black Charcoal Latte',
    description: 'A cleansing delight with a hint of caffeine',
    category: 'Coffee',
    imageUrl: getImage('Black Charcoal Latte.jpg'),
    variants: [
      { name: 'Iced', price: 130 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: 160 },
      { name: '1L Bottle', price: 380 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'seasalt-latte',
    name: 'Seasalt Latte',
    description: 'Experience the sweet and salty twist of coffee creaminess in a cup',
    category: 'Coffee',
    imageUrl: getImage('Seasalt Latte.jpg'),
    isSignature: true,
    variants: [
      { name: 'Iced', price: 130 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: 180 },
      { name: '1L Bottle', price: 420 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'tiramisu-latte',
    name: 'Tiramisu Latte',
    description: 'Coffee and dessert in one cup',
    category: 'Coffee',
    imageUrl: 'https://picsum.photos/seed/tiramisu-latte/400/400',
    variants: [
      { name: 'Iced', price: 160 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: 190 },
      { name: '1L Bottle', price: 440 }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'biscoff-latte',
    name: 'Biscoff Latte',
    description: 'Sip serenity: Espresso and Biscoff unite in harmony',
    category: 'Coffee',
    imageUrl: getImage('Biscoff Latte.jpg'),
    isSignature: true,
    variants: [
      { name: 'Iced', price: 185 },
      { name: 'Hot', price: null },
      { name: 'Bottled 400 ml', price: null },
      { name: '1L Bottle', price: null }
    ],
    modifierGroups: [COFFEE_ADDONS, COFFEE_SYRUP, DRIZZLE]
  },
  {
    id: 'iced-matcha',
    name: 'Iced Matcha',
    description: 'Zen-inspired elixir: a harmonious blend of matcha and velvety milk.',
    category: 'Non-Coffee',
    imageUrl: getImage('Iced Matcha.jpg'),
    variants: [
      { name: 'Iced', price: 145 },
      { name: 'Bottled 400 ml', price: 190 },
      { name: '1L Bottle', price: 400 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'berry-matcha',
    name: 'Berry Matcha',
    description: 'Delight in the refreshing medley of iced matcha, milk, and juicy strawberries',
    category: 'Non-Coffee',
    imageUrl: getImage('Berry Matcha.jpg'),
    isSignature: true,
    variants: [
      { name: 'Iced', price: 155 },
      { name: 'Bottled 400 ml', price: 200 },
      { name: '1L Bottle', price: 420 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'ube-milk-drink',
    name: 'Ube Milk Drink',
    description: 'A vibrant and creamy delight with Ube\'s purple magic',
    category: 'Non-Coffee',
    imageUrl: getImage('Ube Milk Drink.jpg'),
    variants: [
      { name: 'Iced', price: 110 },
      { name: 'Bottled 400 ml', price: 155 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'strawberry-milk-drink',
    name: 'Strawberry Milk Drink',
    description: 'Discover the perfect balance of strawberry goodness in a creamy drink',
    category: 'Non-Coffee',
    imageUrl: getImage('Strawberry Milk.jpg'),
    variants: [
      { name: 'Iced', price: 110 },
      { name: 'Bottled 400 ml', price: 155 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'mango-milk-drink',
    name: 'Mango Milk Drink',
    description: 'Taste the tropics in a creamy sip',
    category: 'Non-Coffee',
    imageUrl: getImage('Mango Milk.jpg'),
    variants: [
      { name: 'Iced', price: 110 },
      { name: 'Bottled 400 ml', price: 155 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'thai-milk-tea',
    name: 'Thai Milk Tea',
    description: 'Discover Thai vibrance in a rich, aromatic tea blend',
    category: 'Non-Coffee',
    imageUrl: getImage('Thai Milk Tea.jpg'),
    variants: [
      { name: 'Iced', price: 110 },
      { name: 'Bottled 400 ml', price: 155 },
      { name: '1L Bottle', price: 340 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'strawberry-soda-pop',
    name: 'Strawberry Soda Pop',
    description: 'A refreshing burst of fizzy delight with strawberry sweetness',
    category: 'Non-Coffee',
    imageUrl: getImage('Strawberry Soda Pop.jpg'),
    variants: [
      { name: 'Iced', price: 100 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 320 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'green-apple-soda-pop',
    name: 'Green Apple Soda Pop',
    description: 'Delight in the sparkling fusion of green apple and soda perfection',
    category: 'Non-Coffee',
    imageUrl: getImage('Green Soda Pop.jpg'),
    variants: [
      { name: 'Iced', price: 100 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 320 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'mango-soda-pop',
    name: 'Mango Soda Pop',
    description: 'Treat yourself to the thirst-quenching joy of mango goodness',
    category: 'Non-Coffee',
    imageUrl: getImage('Mango Soda Pop.jpg'),
    variants: [
      { name: 'Iced', price: 100 },
      { name: 'Bottled 400 ml', price: 135 },
      { name: '1L Bottle', price: 320 }
    ],
    modifierGroups: [COFFEE_ADDONS]
  },
  {
    id: 'egg-cheese-toast',
    name: 'Egg & Cheese Toast',
    description: 'Bread Toast, Special Sauce, Egg, Slice Cheese, Japanese Mayo',
    category: 'Toasts',
    imageUrl: 'https://picsum.photos/seed/egg-cheese-toast/400/400',
    variants: [
      { name: 'standard', price: 115 }
    ],
    modifierGroups: [TOAST_ADDONS]
  },
  {
    id: 'ham-egg-toast',
    name: 'Ham & Egg Toast',
    description: 'Bread Toast, Special Sauce, Egg, Ham, Slice Cheese, Japanese Mayo',
    category: 'Toasts',
    imageUrl: 'https://picsum.photos/seed/ham-egg-toast/400/400',
    variants: [
      { name: 'standard', price: 125 }
    ],
    modifierGroups: [TOAST_ADDONS]
  },
  {
    id: 'tuna-egg-toast',
    name: 'Tuna & Egg Toast',
    description: 'Bread Toast, Special Sauce, Egg, Tuna, Slice Cheese, Japanese Mayo',
    category: 'Toasts',
    imageUrl: 'https://picsum.photos/seed/tuna-egg-toast/400/400',
    variants: [
      { name: 'standard', price: 135 }
    ],
    modifierGroups: [TOAST_ADDONS]
  },
  {
    id: 'classic-french-toast',
    name: 'Classic French Toast',
    description: '2 pcs French toast, powdered sugar, butter, maple syrup',
    category: 'Toasts',
    imageUrl: 'https://picsum.photos/seed/classic-french-toast/400/400',
    variants: [
      { name: '2 pcs', price: 145 }
    ],
    modifierGroups: [FRENCH_TOAST_ADDONS]
  },
  {
    id: 'chocolate-crinkle-cookies',
    name: 'Chocolate Crinkle Cookies',
    description: 'Irresistibly chewy and soft chocolatey goodness in every bite',
    category: 'Pastries',
    imageUrl: getImage('Chocolate Crinkles.jpg'),
    variants: [
      { name: '3 pcs', price: 70 },
      { name: '10 pcs', price: 190 }
    ]
  },
  {
    id: 'brownie-bites',
    name: 'Brownie Bites',
    description: 'Bite-sized euphoria: where rich chocolate dreams come true.',
    category: 'Pastries',
    imageUrl: getImage('Brownie Bites.jpg'),
    variants: [
      { name: '8 pcs', price: 130 },
      { name: '16 pcs tub', price: 225 }
    ]
  },
  {
    id: 'cheesecake',
    name: 'Basque Burnt Cheesecake',
    description: 'A slice of heaven in every bite',
    category: 'Pastries',
    imageUrl: getImage('Basque Burnt Cheesecake - Slice.jpg'),
    variants: [
      { name: 'Slice', price: 90 },
      { name: '6 inch whole', price: 625 },
      { name: '8 inch whole', price: 990 }
    ]
  }
];
