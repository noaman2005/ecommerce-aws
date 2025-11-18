import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = process.env.DYNAMODB_PRODUCTS_TABLE || 'ecommerce-products';

/**
 * Lambda handler for product operations
 */
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Support both API Gateway REST (v1) and HTTP API (v2) event formats
  const httpMethod = event.httpMethod || event.requestContext?.http?.method;
  const resource = event.resource || event.requestContext?.routeKey || '';
  const path = event.path || event.rawPath || '';
  const pathParameters = event.pathParameters || {};
  const body = event.body;
  let queryStringParameters = event.queryStringParameters || null;
  const requestContext = event.requestContext || {};

  // If HTTP API v2 provided rawQueryString, parse it into an object
  if (!queryStringParameters && event.rawQueryString) {
    try {
      queryStringParameters = Object.fromEntries(new URLSearchParams(event.rawQueryString));
    } catch {
      queryStringParameters = null;
    }
  }

  // Normalize path by stripping stage prefix when present
  const stagePrefix = requestContext?.stage ? `/${requestContext.stage}` : '';
  const normalizedPath = typeof path === 'string' && stagePrefix && path.startsWith(stagePrefix)
    ? path.slice(stagePrefix.length)
    : path;
  const segments = (normalizedPath || '').split('/').filter(Boolean);
  // Support different authorizer shapes (REST & HTTP API v2)
  const claims = requestContext?.authorizer?.claims || requestContext?.authorizer?.jwt?.claims || requestContext?.authorizer || {};
  const userId = claims?.sub;
  const userRole = claims?.['custom:role'];
  const userEmail = claims?.email;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const isAdmin = (ADMIN_EMAIL && userEmail && ADMIN_EMAIL === userEmail) || userRole === 'admin';

  // Router debug
  console.log('[router]', { httpMethod, resource, path, normalizedPath, segments, pathParameters });

  try {
    // Route based on HTTP method and path
    if (httpMethod === 'GET' && (resource === '/products' || normalizedPath === '/products' || (segments[0] === 'products' && segments.length === 1))) {
      return await listProducts(queryStringParameters);
    }

    if (httpMethod === 'GET' && (resource === '/products/{id}' || pathParameters?.id || (segments[0] === 'products' && segments.length === 2))) {
      const id = (pathParameters && pathParameters.id) || segments[1];
      return await getProduct(id);
    }

    if (httpMethod === 'POST' && (resource === '/products' || normalizedPath === '/products' || (segments[0] === 'products' && segments.length === 1))) {
      if (!isAdmin && userRole !== 'host' && userRole !== 'admin') {
        return errorResponse(403, 'Only hosts can create products');
      }
      return await createProduct(body ? JSON.parse(body) : {}, userId);
    }

    if (httpMethod === 'PUT' && (resource === '/products/{id}' || pathParameters?.id || (segments[0] === 'products' && segments.length === 2))) {
      const id = (pathParameters && pathParameters.id) || segments[1];
      return await updateProduct(id, body ? JSON.parse(body) : {}, userId, userRole, isAdmin);
    }

    if (httpMethod === 'DELETE' && (resource === '/products/{id}' || pathParameters?.id || (segments[0] === 'products' && segments.length === 2))) {
      const id = (pathParameters && pathParameters.id) || segments[1];
      return await deleteProduct(id, userId, userRole, isAdmin);
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, error.message);
  }
};

/**
 * List products with optional filters
 */
async function listProducts(params) {
  // queryStringParameters can be null from API Gateway; ensure we have an object
  params = params || {};
  const { categoryId, search, minPrice, maxPrice, sortBy, limit = 20, lastKey } = params;

  let command;
  const commandParams = {
    TableName: PRODUCTS_TABLE,
    Limit: parseInt(limit),
  };

  if (lastKey) {
    commandParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
  }

  if (categoryId) {
    command = new QueryCommand({
      ...commandParams,
      IndexName: 'categoryId-index',
      KeyConditionExpression: 'categoryId = :categoryId',
      ExpressionAttributeValues: {
        ':categoryId': categoryId,
      },
    });
  } else {
    command = new ScanCommand(commandParams);
  }

  const result = await docClient.send(command);
  let items = result.Items || [];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  }

  if (minPrice) {
    items = items.filter(item => item.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    items = items.filter(item => item.price <= parseFloat(maxPrice));
  }

  // Apply sorting
  if (sortBy) {
    switch (sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
  }

  return successResponse({
    items,
    lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
    hasMore: !!result.LastEvaluatedKey,
  });
}

/**
 * Get a single product by ID
 */
async function getProduct(id) {
  const command = new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { id },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    return errorResponse(404, 'Product not found');
  }

  return successResponse(result.Item);
}

/**
 * Create a new product
 */
async function createProduct(data, hostId) {
  const product = {
    id: uuidv4(),
    ...data,
    hostId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: PRODUCTS_TABLE,
    Item: product,
  });

  await docClient.send(command);

  return successResponse(product, 201);
}

/**
 * Update an existing product
 */
async function updateProduct(id, data, userId, userRole, isAdminFlag) {
  // First, get the product to check ownership
  const getCommand = new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { id },
  });

  const existing = await docClient.send(getCommand);

  if (!existing.Item) {
    return errorResponse(404, 'Product not found');
  }

  // Check if user is the host or an admin
  if (existing.Item.hostId !== userId && !isAdminFlag && userRole !== 'admin') {
    return errorResponse(403, 'You can only update your own products');
  }

  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Build update expression dynamically
  const allowedFields = ['name', 'description', 'price', 'categoryId', 'images', 'stock', 'featured'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateExpression.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = data[field];
    }
  });

  updateExpression.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: PRODUCTS_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);

  return successResponse(result.Attributes);
}

/**
 * Delete a product
 */
async function deleteProduct(id, userId, userRole, isAdminFlag) {
  // First, get the product to check ownership
  const getCommand = new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { id },
  });

  const existing = await docClient.send(getCommand);

  if (!existing.Item) {
    return errorResponse(404, 'Product not found');
  }

  // Check if user is the host or an admin
  if (existing.Item.hostId !== userId && !isAdminFlag && userRole !== 'admin') {
    return errorResponse(403, 'You can only delete your own products');
  }

  const command = new DeleteCommand({
    TableName: PRODUCTS_TABLE,
    Key: { id },
  });

  await docClient.send(command);

  return successResponse({ message: 'Product deleted successfully' });
}

/**
 * Success response helper
 */
function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: true,
      data,
    }),
  };
}

/**
 * Error response helper
 */
function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: false,
      error: message,
    }),
  };
}
