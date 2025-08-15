import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}


 //INFO: Generic hook for async data fetching with loading, error, and refresh states

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // INFO: Use ref to track if component is mounted to prevent state updates on unmounted components
  const mountedRef = useRef(true);
  
  // INFO: Store the async function in a ref to prevent dependency cycles
  const asyncFunctionRef = useRef(asyncFunction);
  asyncFunctionRef.current = asyncFunction;
  
  // INFO: Store callbacks in refs to prevent dependency cycles
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const execute = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunctionRef.current();
      if (mountedRef.current) {
        setData(result);
        onSuccessRef.current?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      if (mountedRef.current) {
        setError(error);
        onErrorRef.current?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  const refresh = useCallback(async () => {
    await execute();
  }, [execute]);
  
  const reset = useCallback(() => {
    if (mountedRef.current) {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, []);
  
  // INFO: Execute immediately on mount if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);
  
  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset,
  };
}
