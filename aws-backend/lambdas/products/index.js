const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = process.env.DYNAMODB_PRODUCTS_TABLE || 'ecommerce-products';

/**
 * Lambda handler for product operations
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const { httpMethod, path, pathParameters, body, queryStringParameters } = event;
  const userId = event.requestContext?.authorizer?.claims?.sub;
  const userRole = event.requestContext?.authorizer?.claims?.['custom:role'];

  try {
    // Route based on HTTP method and path
    if (httpMethod === 'GET' && path === '/products') {
      return await listProducts(queryStringParameters);
    }

    if (httpMethod === 'GET' && pathParameters?.id) {
      return await getProduct(pathParameters.id);
    }

    if (httpMethod === 'POST' && path === '/products') {
      if (userRole !== 'host' && userRole !== 'admin') {
        return errorResponse(403, 'Only hosts can create products');
      }
      return await createProduct(JSON.parse(body), userId);
    }

    if (httpMethod === 'PUT' && pathParameters?.id) {
      return await updateProduct(pathParameters.id, JSON.parse(body), userId, userRole);
    }

    if (httpMethod === 'DELETE' && pathParameters?.id) {
      return await deleteProduct(pathParameters.id, userId, userRole);
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
async function listProducts(params = {}) {
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
async function updateProduct(id, data, userId, userRole) {
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
  if (existing.Item.hostId !== userId && userRole !== 'admin') {
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
async function deleteProduct(id, userId, userRole) {
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
  if (existing.Item.hostId !== userId && userRole !== 'admin') {
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
