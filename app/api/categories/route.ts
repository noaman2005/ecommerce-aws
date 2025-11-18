import { NextResponse } from 'next/server';
import { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '@/lib/aws/config';

// GET /api/categories - list categories
export async function GET() {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.CATEGORIES }));
    return NextResponse.json({ success: true, data: result.Items || [] });
  } catch (err) {
    console.error('[api/categories] GET error', err);
    return NextResponse.json({ success: false, error: 'Failed to list categories' }, { status: 500 });
  }
}

// POST /api/categories - create category
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const now = new Date().toISOString();
    const item = {
      id: payload.id || crypto.randomUUID(),
      name: payload.name || '',
      description: payload.description || '',
      subcategories: payload.subcategories || [],
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({ TableName: TABLES.CATEGORIES, Item: item }));
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    console.error('[api/categories] POST error', err);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT /api/categories - update category
export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    if (!payload.id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    const allowed = ['name', 'description', 'subcategories'];
    allowed.forEach((field) => {
      if (payload[field] !== undefined) {
        updateExpression.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = payload[field];
      }
    });

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.CATEGORIES,
      Key: { id: payload.id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return NextResponse.json({ success: true, data: result.Attributes });
  } catch (err) {
    console.error('[api/categories] PUT error', err);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories?id=... - delete category
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await docClient.send(new DeleteCommand({ TableName: TABLES.CATEGORIES, Key: { id } }));
    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error('[api/categories] DELETE error', err);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
