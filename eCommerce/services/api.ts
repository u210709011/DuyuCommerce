import { API_BASE_URL } from '@/config/environment';

// INFO: Build query string from params
function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const pairs: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });
  return pairs.length ? `?${pairs.join('&')}` : '';
}

// INFO: GET with timeout; unwraps optional { data } envelope
export async function apiGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>, options?: { timeoutMs?: number }) {
  const timeoutMs = options?.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const qs = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${qs}`, { signal: controller.signal });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json(); 
    return (json?.data ?? json) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}



