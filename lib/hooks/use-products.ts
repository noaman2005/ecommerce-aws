import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { Product, Category } from '@/types';
import { useMemo } from 'react';

interface UseProductsOptions {
  token?: string | null;
}

export interface CategoryRecord extends Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { token } = options;

  const { mutate } = useSWRConfig();

  // Fetch products
  const { data: rawProducts, error: productsError, isLoading: productsLoading } = useSWR<Product[]>(
    ['products', token],
    () => getProducts({ token }),
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
    }
  );

  // Fetch categories
  const { data: categories = [] } = useSWR<CategoryRecord[]>(
    'categories',
    async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Enrich products with category names
  const products = useMemo(() => {
    if (!rawProducts) return [];
    
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    
    return rawProducts.map((product) => ({
      ...product,
      categoryName: product.categoryName || categoryMap.get(product.categoryId) || product.categoryId,
    }));
  }, [rawProducts, categories]);

  const refresh = () => mutate(['products', token]);

  const create = async (payload: Partial<Product>) => {
    const created = await createProduct(payload, { token });
    await mutate(['products', token]);
    return created;
  };

  const update = async (id: string, payload: Partial<Product>) => {
    const updated = await updateProduct(id, payload, { token });
    await mutate(['products', token]);
    return updated;
  };

  const remove = async (id: string) => {
    await deleteProduct(id, { token });
    await mutate(['products', token]);
    return { id };
  };

  return {
    products,
    isLoading: productsLoading,
    isError: !!productsError,
    error: productsError,
    refresh,
    create,
    update,
    remove,
  };
}
