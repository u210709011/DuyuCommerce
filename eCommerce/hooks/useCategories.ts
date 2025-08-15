import { useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import { getCategories } from '@/services/product';
import { Category } from '@/types/product';

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * INFO: Centralized hook for category data management with caching and error handling
 * Provides consistent category fetching across all screens
 */
export function useCategories(): UseCategoriesResult {
  const fetchCategories = useCallback(async () => {
    return await getCategories();
  }, []);

  const {
    data: categories,
    loading,
    error,
    refresh,
    reset,
  } = useAsyncData(fetchCategories, {
    onError: (error) => {
      console.warn('Failed to fetch categories:', error.message);
    },
  });

  return {
    categories: categories || [],
    loading,
    error,
    refresh,
    reset,
  };
}
