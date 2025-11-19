import { NextRequest, NextResponse } from 'next/server';
import { getProductFromDynamoDB, updateProductInDynamoDB, deleteProductFromDynamoDB } from '@/lib/dynamodb';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context as { params: { id: string } };
  try {
    const product = await getProductFromDynamoDB(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  context: any
) {
  const { params } = context as { params: { id: string } };
  try {
    const body = await request.json();
    const updatedProduct = await updateProductInDynamoDB(params.id, body);
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.message === 'Product not found') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  context: any
) {
  const { params } = context as { params: { id: string } };
  try {
    await deleteProductFromDynamoDB(params.id);
    return NextResponse.json({ id: params.id });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
