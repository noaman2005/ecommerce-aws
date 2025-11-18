import { Product } from '@/types';

interface FetchOptions {
  token?: string | null;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_GATEWAY_URL || '').replace(/\/$/, '');
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

if (!API_BASE_URL) {
  console.warn('NEXT_PUBLIC_API_GATEWAY_URL is not defined. Product API calls will fail.');
}

const request = async <T>(path: string, init: RequestInit = {}, opts: FetchOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  DEBUG && console.debug('[api] request', {
    url: `${API_BASE_URL}${path}`,
    method: init.method || 'GET',
  });

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const fallback = res.statusText || 'Request failed';
    const bodyText = await res.text().catch(() => fallback);
    throw new Error(bodyText || fallback);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  DEBUG && console.debug('[api] response', { status: res.status, contentType });
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  const payload = await res.json();

  if (DEBUG) {
    if (Array.isArray(payload)) {
      console.debug('[api] payload: array', { length: payload.length });
    } else if (payload && typeof payload === 'object') {
      console.debug('[api] payload: object keys', Object.keys(payload));
    } else {
      console.debug('[api] payload: primitive');
    }
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const { success, data, error: apiError } = payload as { success: boolean; data?: unknown; error?: string };
    if (!success) {
      throw new Error(apiError || 'Request failed');
    }
    return (data as T) ?? (undefined as T);
  }

  return payload as T;
};

export const getProducts = async (opts: FetchOptions = {}): Promise<Product[]> => {
  const data = await request<Product[] | { items?: Product[] }>('/products', { method: 'GET' }, opts);
  if (Array.isArray(data)) {
    DEBUG && console.debug('[api] getProducts -> array length', data.length);
    return data;
  }

  if (data && typeof data === 'object' && Array.isArray(data.items)) {
    DEBUG && console.debug('[api] getProducts -> items length', data.items.length);
    return data.items;
  }

  DEBUG && console.debug('[api] getProducts -> empty result');
  return [];
};

export const createProduct = async (data: Partial<Product>, opts: FetchOptions = {}): Promise<Product> => {
  return await request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }, opts);
};

export const updateProduct = async (id: string, data: Partial<Product>, opts: FetchOptions = {}): Promise<Product> => {
  return await request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, opts);
};

export const deleteProduct = async (id: string, opts: FetchOptions = {}): Promise<{ id: string }> => {
  await request(`/products/${id}`, { method: 'DELETE' }, opts);
  return { id };
};
