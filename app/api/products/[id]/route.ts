import { NextRequest, NextResponse } from 'next/server';
import { getProductFromDynamoDB, updateProductInDynamoDB, deleteProductFromDynamoDB } from '@/lib/dynamodb';

type RouteContext = {
  params?: { id?: string } | Promise<{ id?: string }>;
};

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const rawParams = context?.params;
    let paramsValue: { id?: string } | undefined;
    if (rawParams) {
      if (typeof rawParams === 'object' && 'then' in rawParams && typeof (rawParams as { then?: unknown }).then === 'function') {
        paramsValue = await (rawParams as Promise<{ id?: string }>);
      } else {
        paramsValue = rawParams as { id?: string };
      }
    }
    const id = paramsValue?.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    const product = await getProductFromDynamoDB(id);
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
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const rawParams = context?.params;
    let paramsValue: { id?: string } | undefined;
    if (rawParams) {
      if (typeof rawParams === 'object' && 'then' in rawParams && typeof (rawParams as { then?: unknown }).then === 'function') {
        paramsValue = await (rawParams as Promise<{ id?: string }>);
      } else {
        paramsValue = rawParams as { id?: string };
      }
    }
    const body = await request.json();
    const id = paramsValue?.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }
    const updatedProduct = await updateProductInDynamoDB(id, body);
    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const e = error as { message?: string };
    if (e.message === 'Product not found') {
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
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const rawParams = context?.params;
    let paramsValue: { id?: string } | undefined;
    if (rawParams) {
      if (typeof rawParams === 'object' && 'then' in rawParams && typeof (rawParams as { then?: unknown }).then === 'function') {
        paramsValue = await (rawParams as Promise<{ id?: string }>);
      } else {
        paramsValue = rawParams as { id?: string };
      }
    }
    const id = paramsValue?.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }
    await deleteProductFromDynamoDB(id);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
