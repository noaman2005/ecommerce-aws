import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const generateId = () => `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const REVIEWS_TABLE = process.env.DYNAMODB_REVIEWS_TABLE || 'ecommerce-reviews-prod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Get reviews for specific product
      const command = new QueryCommand({
        TableName: REVIEWS_TABLE,
        IndexName: 'productId-index',
        KeyConditionExpression: 'productId = :productId',
        ExpressionAttributeValues: {
          ':productId': productId,
        },
      });

      const result = await dynamodb.send(command);
      const reviews = result.Items || [];

      // Calculate average rating (narrow item shape)
      const reviewsTyped = reviews as Array<{ rating?: number }>;
      const averageRating = reviewsTyped.length > 0
        ? reviewsTyped.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewsTyped.length
        : 0;

      return NextResponse.json({
        success: true,
        data: reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      });
    } else {
      // Get all reviews
      const command = new ScanCommand({
        TableName: REVIEWS_TABLE,
      });

      const result = await dynamodb.send(command);
      return NextResponse.json({
        success: true,
        data: result.Items || [],
      });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json();

    const review = {
      id: generateId(),
      productId: reviewData.productId,
      userId: reviewData.userId,
      userName: reviewData.userName,
      rating: Math.min(5, Math.max(1, reviewData.rating)), // Ensure 1-5
      title: reviewData.title,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: REVIEWS_TABLE,
      Item: review,
    });

    await dynamodb.send(command);

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const command = new DeleteCommand({
      TableName: REVIEWS_TABLE,
      Key: { id: reviewId },
    });

    await dynamodb.send(command);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
