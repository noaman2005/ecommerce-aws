import { docClient, TABLES } from '@/lib/aws/config';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Product } from '@/types';

async function getCategoryName(categoryId: string): Promise<string> {
  try {
    const command = new GetCommand({
      TableName: TABLES.CATEGORIES,
      Key: { id: categoryId },
    });
    const response = await docClient.send(command);
    interface CategoryRecord {
      name?: string;
    }
    return (response.Item as CategoryRecord)?.name || categoryId;
  } catch (error) {
    console.warn(`Failed to fetch category name for ${categoryId}:`, error);
    return categoryId;
  }
}

/**
 * Enrich products with category names
 */
export async function enrichProductsWithCategoryNames(products: Product[]): Promise<Product[]> {
  return Promise.all(
    products.map(async (product) => {
      if (!product.categoryName && product.categoryId) {
        product.categoryName = await getCategoryName(product.categoryId);
      }
      return product;
    })
  );
}

/**
 * DynamoDB helpers for Products table
 */

export async function getProductFromDynamoDB(id: string): Promise<Product | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.PRODUCTS,
      Key: { id },
    });
    const response = await docClient.send(command);
    const product = (response.Item as Product) || null;
    
    // Enrich with category name
    if (product && !product.categoryName && product.categoryId) {
      product.categoryName = await getCategoryName(product.categoryId);
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id} from DynamoDB:`, error);
    return null;
  }
}

export async function getAllProductsFromDynamoDB(): Promise<Product[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCTS,
    });
    const response = await docClient.send(command);
    let products = (response.Items as Product[]) || [];
    
    // Enrich products with category names
    products = await Promise.all(
      products.map(async (product) => {
        if (!product.categoryName && product.categoryId) {
          product.categoryName = await getCategoryName(product.categoryId);
        }
        return product;
      })
    );
    
    return products;
  } catch (error) {
    console.error('Error scanning products from DynamoDB:', error);
    return [];
  }
}

export async function putProductToDynamoDB(product: Product): Promise<Product> {
  try {
    const command = new PutCommand({
      TableName: TABLES.PRODUCTS,
      Item: {
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    await docClient.send(command);
    return product;
  } catch (error) {
    console.error('Error putting product to DynamoDB:', error);
    throw error;
  }
}

export async function updateProductInDynamoDB(id: string, payload: Partial<Product>): Promise<Product> {
  try {
    // First fetch the product to ensure it exists
    const existing = await getProductFromDynamoDB(id);
    if (!existing) throw new Error('Product not found');

    const updated = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLES.PRODUCTS,
      Item: updated,
    });
    await docClient.send(command);
    return updated;
  } catch (error) {
    console.error(`Error updating product ${id} in DynamoDB:`, error);
    throw error;
  }
}

export async function deleteProductFromDynamoDB(id: string): Promise<void> {
  try {
    const command = new DeleteCommand({
      TableName: TABLES.PRODUCTS,
      Key: { id },
    });
    await docClient.send(command);
  } catch (error) {
    console.error(`Error deleting product ${id} from DynamoDB:`, error);
    throw error;
  }
}

/**
 * Get products by categoryId using GSI
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.PRODUCTS,
      IndexName: 'categoryId-index',
      KeyConditionExpression: 'categoryId = :categoryId',
      ExpressionAttributeValues: {
        ':categoryId': categoryId,
      },
    });
    const response = await docClient.send(command);
    return (response.Items as Product[]) || [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Get products by hostId using GSI
 */
export async function getProductsByHost(hostId: string): Promise<Product[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.PRODUCTS,
      IndexName: 'hostId-index',
      KeyConditionExpression: 'hostId = :hostId',
      ExpressionAttributeValues: {
        ':hostId': hostId,
      },
    });
    const response = await docClient.send(command);
    return (response.Items as Product[]) || [];
  } catch (error) {
    console.error(`Error fetching products for host ${hostId}:`, error);
    return [];
  }
}
