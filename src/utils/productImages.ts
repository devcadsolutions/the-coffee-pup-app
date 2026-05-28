/**
 * Maps product IDs to their local image assets.
 * Using Vite's `new URL(..., import.meta.url).href` ensures the correct
 * hashed asset URL is always resolved, even after rebuilds.
 *
 * When products are loaded from Firestore, their `imageUrl` field may be
 * stale (pointing to a previous build's hashed URL). Use `resolveProductImage`
 * to always get the correct URL.
 */

const img = (name: string) =>
  new URL(`../assets/images/${name}`, import.meta.url).href;

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'americano':                 img('Americano.jpg'),
  'cafe-latte':                img('Cafe Latte.jpg'),
  'caramel-macchiato':         img('Caramel Macchiato.jpg'),
  'french-vanilla-latte':      img('French Vanilla.jpg'),
  'spanish-latte':             img('Spanish Latte.jpg'),
  'hazelnut-latte':            img('Hazelnut Latte.jpg'),
  'salted-caramel-macchiato':  img('Salted Caramel Macchiato.jpg'),
  'coffee-jelly-latte':        img('Coffee Jelly Latte.jpg'),
  'oreo-latte':                img('Oreo Latte.jpg'),
  'pumpkin-spice-latte':       img('Pumpkin Spice Latte.jpg'),
  'white-mocha-latte':         img('White Mocha Latte.jpg'),
  'mocha-latte':               img('Mocha Latte.jpg'),
  'ube-latte':                 img('Ube Latte.jpg'),
  'dirty-matcha':              img('Dirty Matcha.jpg'),
  'black-charcoal-latte':      img('Black Charcoal Latte.jpg'),
  'seasalt-latte':             img('Seasalt Latte.jpg'),
  'tiramisu-latte':            'https://picsum.photos/seed/tiramisu-latte/400/400',
  'biscoff-latte':             img('Biscoff Latte.jpg'),
  'iced-matcha':               img('Iced Matcha.jpg'),
  'berry-matcha':              img('Berry Matcha.jpg'),
  'ube-milk-drink':            img('Ube Milk Drink.jpg'),
  'strawberry-milk-drink':     img('Strawberry Milk.jpg'),
  'mango-milk-drink':          img('Mango Milk.jpg'),
  'thai-milk-tea':             img('Thai Milk Tea.jpg'),
  'strawberry-soda-pop':       img('Strawberry Soda Pop.jpg'),
  'green-apple-soda-pop':      img('Green Soda Pop.jpg'),
  'mango-soda-pop':            img('Mango Soda Pop.jpg'),
  'egg-cheese-toast':          'https://picsum.photos/seed/egg-cheese-toast/400/400',
  'ham-egg-toast':             'https://picsum.photos/seed/ham-egg-toast/400/400',
  'tuna-egg-toast':            'https://picsum.photos/seed/tuna-egg-toast/400/400',
  'classic-french-toast':      'https://picsum.photos/seed/classic-french-toast/400/400',
  'chocolate-crinkle-cookies': img('Chocolate Crinkles.jpg'),
  'brownie-bites':             img('Brownie Bites.jpg'),
  'cheesecake':                img('Basque Burnt Cheesecake - Slice.jpg'),
};

/**
 * Returns the correct local image URL for a product.
 * Falls back to the stored imageUrl (if it's an http URL), then to a placeholder.
 */
export function resolveProductImage(product: { id: string; imageUrl?: string }): string {
  // Always prefer the local mapped image (always fresh and hashed correctly)
  if (PRODUCT_IMAGE_MAP[product.id]) {
    return PRODUCT_IMAGE_MAP[product.id];
  }
  // If there's a full http URL stored (e.g. external image added via admin), use it
  if (product.imageUrl && product.imageUrl.startsWith('http')) {
    return product.imageUrl;
  }
  // Final fallback placeholder
  return `https://picsum.photos/seed/${product.id}/400/400`;
}
