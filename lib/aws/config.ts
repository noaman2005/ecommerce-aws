import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// AWS Region Configuration
export const AWS_REGION = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1';

// DynamoDB Configuration
const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// S3 Configuration
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Table Names
export const TABLES = {
  PRODUCTS: process.env.DYNAMODB_PRODUCTS_TABLE || 'ecommerce-products',
  CATEGORIES: process.env.DYNAMODB_CATEGORIES_TABLE || 'ecommerce-categories',
  ORDERS: process.env.DYNAMODB_ORDERS_TABLE || 'ecommerce-orders',
  ORDER_ITEMS: process.env.DYNAMODB_ORDER_ITEMS_TABLE || 'ecommerce-order-items',
  USERS: process.env.DYNAMODB_USERS_TABLE || 'ecommerce-users',
};

// S3 Bucket
export const S3_BUCKET = process.env.S3_BUCKET_NAME || 'ecommerce-product-images';
export const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || '';

// API Gateway
export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || '';
