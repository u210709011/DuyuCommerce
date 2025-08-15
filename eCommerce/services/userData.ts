import { apiGet } from '@/services/api';
import { API_BASE_URL } from '@/config/api';

export type WishlistResponse = { productIds: string[] };
export type CartItemWire = { productId: string; quantity: number; variantKey: string };
export type CartResponse = { items: CartItemWire[] };

// INFO: Fetch wishlist for a user
export async function fetchWishlist(userId: string): Promise<WishlistResponse> {
  const res = await apiGet<{ productIds: string[] }>(`/users/${userId}/wishlist`);
  return res;
}

// INFO: Replace wishlist for a user
export async function syncWishlist(userId: string, productIds: string[]): Promise<void> {
  await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });
}

// INFO: Fetch cart for a user
export async function fetchCart(userId: string): Promise<CartResponse> {
  const res = await apiGet<{ items: CartItemWire[] }>(`/users/${userId}/cart`);
  return res;
}

// INFO: Replace cart for a user
export async function syncCart(userId: string, items: CartItemWire[]): Promise<void> {
  await fetch(`${API_BASE_URL}/users/${userId}/cart`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

// INFO: Helper to get products by IDs for wishlist restoration
export async function getProductsByIds(productIds: string[]): Promise<any[]> {
  // This would need a new backend endpoint, for now return empty
  // TODO: Implement GET /products/batch with body: { ids: string[] }
  return [];
}

// INFO: Helper to reconstruct cart items from server data
export async function reconstructCartItems(serverCartItems: CartItemWire[]): Promise<any[]> {
  // This would need to fetch product details and reconstruct full CartItem objects
  // For now, return empty as it requires significant backend changes
  // TODO: Implement product lookup and cart reconstruction
  return [];
}


