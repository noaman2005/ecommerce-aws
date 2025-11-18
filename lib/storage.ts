import { Product } from '@/types';
import {
  getProductFromDynamoDB,
  getAllProductsFromDynamoDB,
  putProductToDynamoDB,
  updateProductInDynamoDB,
  deleteProductFromDynamoDB,
} from '@/lib/dynamodb';

let inMemoryProducts: Product[] = [];

// Try to use DynamoDB on server; fall back to localStorage on client or in-memory storage
const loadFromDynamoDBOrFallback = async (): Promise<Product[]> => {
  // On server side, try DynamoDB first
  if (typeof window === 'undefined') {
    try {
      return await getAllProductsFromDynamoDB();
    } catch (error) {
      console.warn('DynamoDB unavailable, falling back to in-memory storage:', error);
      return inMemoryProducts;
    }
  }

  // On client side, use localStorage
  try {
    const stored = localStorage.getItem('ecommerce-products');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save to DynamoDB on server; localStorage on client
const saveToStorage = async (products: Product[]) => {
  if (typeof window === 'undefined') {
    // On server, save to in-memory cache only (DynamoDB writes happen in API routes)
    inMemoryProducts = products;
  } else {
    // On client, save to localStorage
    try {
      localStorage.setItem('ecommerce-products', JSON.stringify(products));
    } catch {
      // Ignore errors
    }
  }
};

export async function getProducts(): Promise<Product[]> {
  return await loadFromDynamoDBOrFallback();
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name || 'Untitled Product',
    description: data.description || '',
    price: data.price || 0,
    categoryId: data.categoryId || 'uncategorized',
    images: data.images || [],
    stock: data.stock || 0,
    hostId: data.hostId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByEmail: data.createdByEmail,
    featured: data.featured || false,
    categoryName: data.categoryName,
  } as Product;

  // Try to save to DynamoDB on server
  if (typeof window === 'undefined') {
    try {
      return await putProductToDynamoDB(newProduct);
    } catch (error) {
      console.error('Failed to save to DynamoDB, using in-memory:', error);
      inMemoryProducts.push(newProduct);
      return newProduct;
    }
  }

  // On client, just return it (will be saved via API call)
  return newProduct;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  // On server, use DynamoDB
  if (typeof window === 'undefined') {
    try {
      return await updateProductInDynamoDB(id, payload);
    } catch (error) {
      console.error('Failed to update in DynamoDB:', error);
      throw error;
    }
  }

  // On client, just update locally
  throw new Error('Use API endpoint to update products from client');
}

export async function deleteProduct(id: string): Promise<void> {
  // On server, use DynamoDB
  if (typeof window === 'undefined') {
    try {
      return await deleteProductFromDynamoDB(id);
    } catch (error) {
      console.error('Failed to delete from DynamoDB:', error);
      throw error;
    }
  }

  // On client, just delete locally
  throw new Error('Use API endpoint to delete products from client');
}
