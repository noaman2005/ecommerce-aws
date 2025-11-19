import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ORDERS_TABLE = process.env.DYNAMODB_ORDERS_TABLE || 'ecommerce-orders';

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await request.json();

    console.log('Verifying payment:', { orderId, userId, razorpayPaymentId, razorpayOrderId });

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    console.log('Signature verification:', { 
      expected: expectedSignature, 
      received: razorpaySignature,
      match: expectedSignature === razorpaySignature 
    });

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order status to paid
    console.log('Updating order with table:', ORDERS_TABLE, 'orderId:', orderId, 'userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required for payment verification' },
        { status: 400 }
      );
    }

    const command = new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { 
        id: String(orderId),
        userId: String(userId)
      },
      UpdateExpression: 'SET #status = :status, razorpayPaymentId = :paymentId, updatedAt = :now',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'paid',
        ':paymentId': String(razorpayPaymentId),
        ':now': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    console.log('Sending UpdateCommand with Key:', { id: orderId, userId });

    const result = await dynamodb.send(command);
    console.log('Update result:', result);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
