import { create } from 'zustand';

import { Product } from '@/types/product';

import { saveItem, loadItem } from '@/utils/storage';

interface WishlistStore {
  wishlistItems: Product[];
  isLoading: boolean;
  
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
  clearWishlist: () => void;
}

// INFO: Wishlist store with AsyncStorage persistence
export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlistItems: [],
  isLoading: false,

  // INFO: Add if not already present; persist
  addToWishlist: async (product: Product) => {
    const { wishlistItems } = get();
    const isAlreadyInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (!isAlreadyInWishlist) {
      const newWishlist = [...wishlistItems, product];
      set({ wishlistItems: newWishlist });
      await saveItem('wishlist', newWishlist);
    }
  },

  // INFO: Remove product by id; persist
  removeFromWishlist: async (productId: string) => {
    const { wishlistItems } = get();
    const newWishlist = wishlistItems.filter(item => item.id !== productId);
    set({ wishlistItems: newWishlist });
    await saveItem('wishlist', newWishlist);
  },

  // INFO: Check if product id is in wishlist
  isInWishlist: (productId: string) => {
    const { wishlistItems } = get();
    return wishlistItems.some(item => item.id === productId);
  },

  // INFO: Load wishlist from AsyncStorage
  loadWishlist: async () => {
    set({ isLoading: true });
    try {
      const savedWishlist = await loadItem('wishlist');
      if (savedWishlist) {
        set({ wishlistItems: savedWishlist });
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // INFO: Clear wishlist and persist empty array
  clearWishlist: async () => {
    set({ wishlistItems: [] });
    await saveItem('wishlist', []);
  },
}));

export const useWishlist = () => {
  const { wishlistItems, isLoading, addToWishlist, removeFromWishlist, isInWishlist, loadWishlist, clearWishlist } = useWishlistStore();
  
  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadWishlist,
    clearWishlist,
    wishlistCount: wishlistItems.length,
  };
};
