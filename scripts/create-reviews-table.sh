#!/bin/bash

# Create Reviews Table in DynamoDB
# This script creates the ecommerce-reviews table with the required indexes

TABLE_NAME="ecommerce-reviews-prod"
REGION="us-east-1"

echo "Creating DynamoDB table: $TABLE_NAME"

aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=productId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    IndexName=productId-index,Keys=[{AttributeName=productId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL} \
  --region "$REGION"

if [ $? -eq 0 ]; then
  echo "✅ Table created successfully!"
  echo "Waiting for table to be active..."
  aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
  echo "✅ Table is now active and ready to use!"
else
  echo "❌ Failed to create table. The table may already exist."
  echo "Checking table status..."
  aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" 2>/dev/null && echo "Table already exists." || echo "Table does not exist."
fi
