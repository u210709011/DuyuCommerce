import AsyncStorage from '@react-native-async-storage/async-storage';

// INFO: Namespaced cart storage key
const CART_STORAGE_KEY = '@DuyuBox_Cart';

// INFO: Save JSON under namespaced key
export const saveItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(`@DuyuBox_${key}`, jsonValue);
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// INFO: Load and parse JSON value
export const loadItem = async (key: string): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@DuyuBox_${key}`);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return null;
  }
};

// INFO: Remove item by namespaced key
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`@DuyuBox_${key}`);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
};

// INFO: Cart save/load/clear helpers
export const CartStorage = {
  async saveCart(cart: any): Promise<void> {
    try {
      const cartJson = JSON.stringify(cart);
      await AsyncStorage.setItem(CART_STORAGE_KEY, cartJson);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  },

  // INFO: Load saved cart JSON
  async loadCart(): Promise<any | null> {
    try {
      const cartJson = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return cartJson ? JSON.parse(cartJson) : null;
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return null;
    }
  },

  // INFO: Clear cart key from storage
  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  }
};