import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ORDERS_TABLE = process.env.DYNAMODB_ORDERS_TABLE || 'ecommerce-orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get orders for specific user
      const command = new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      });

      const result = await dynamodb.send(command);
      const orders = result.Items || [];

      return NextResponse.json({
        success: true,
        data: orders,
      });
    } else {
      // Get all orders
      const command = new ScanCommand({
        TableName: ORDERS_TABLE,
      });

      const result = await dynamodb.send(command);
      const orders = result.Items || [];

      return NextResponse.json({
        success: true,
        data: orders,
      });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    const item = {
      id: String(orderData.id),
      userId: String(orderData.userId),
      items: orderData.items || [],
      total: Number(orderData.total),
      subtotal: Number(orderData.subtotal),
      shipping: Number(orderData.shipping),
      tax: Number(orderData.tax),
      status: String(orderData.status || 'pending'),
      createdAt: String(orderData.createdAt || new Date().toISOString()),
      updatedAt: String(orderData.updatedAt || new Date().toISOString()),
    };

    console.log('Item to save:', JSON.stringify(item, null, 2));

    const command = new PutCommand({
      TableName: ORDERS_TABLE,
      Item: item,
    });

    console.log('Sending PutCommand to table:', ORDERS_TABLE);
    await dynamodb.send(command);
    console.log('Order created successfully');

    return NextResponse.json({
      success: true,
      data: { id: orderData.id },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
