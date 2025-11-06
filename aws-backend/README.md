# AWS Backend Infrastructure

This directory contains the AWS Lambda functions and infrastructure configuration for the ShopAWS e-commerce platform.

## Directory Structure

```
aws-backend/
├── lambdas/
│   ├── products/          # Product CRUD operations
│   ├── categories/        # Category management
│   ├── orders/            # Order processing
│   └── shared/            # Shared utilities
├── infrastructure/        # IaC templates (CloudFormation/Terraform)
└── scripts/              # Deployment scripts
```

## AWS Services Used

### DynamoDB Tables

1. **ecommerce-products**
   - Primary Key: `id` (String)
   - GSI: `categoryId-index` (categoryId, createdAt)
   - GSI: `hostId-index` (hostId, createdAt)

2. **ecommerce-categories**
   - Primary Key: `id` (String)

3. **ecommerce-orders**
   - Primary Key: `id` (String)
   - GSI: `userId-index` (userId, createdAt)

4. **ecommerce-order-items**
   - Primary Key: `id` (String)
   - GSI: `orderId-index` (orderId)
   - GSI: `hostId-index` (hostId, createdAt)

5. **ecommerce-users**
   - Primary Key: `id` (String)
   - Attributes synced from Cognito

### S3 Buckets

- **ecommerce-product-images**: Stores product images with public read access

### API Gateway

- REST API with Cognito authorizer
- CORS enabled for frontend domain
- Endpoints:
  - `/products` - Product operations
  - `/categories` - Category operations
  - `/orders` - Order operations
  - `/upload` - Pre-signed URL generation

### Cognito

- User Pool with custom attributes:
  - `custom:role` - User role (customer/host/admin)
- App Client for web application

## Setup Instructions

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 18+ installed
- AWS account with necessary permissions

### 1. Create DynamoDB Tables

```bash
# Navigate to infrastructure directory
cd infrastructure

# Run the DynamoDB setup script
node create-dynamodb-tables.js
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://ecommerce-product-images --region us-east-1
aws s3api put-bucket-cors --bucket ecommerce-product-images --cors-configuration file://s3-cors.json
aws s3api put-bucket-policy --bucket ecommerce-product-images --policy file://s3-policy.json
```

### 3. Deploy Lambda Functions

```bash
# Navigate to lambdas directory
cd lambdas

# Install dependencies for each function
cd products && npm install && cd ..
cd categories && npm install && cd ..
cd orders && npm install && cd ..

# Deploy using AWS SAM or Serverless Framework
sam build
sam deploy --guided
```

### 4. Configure API Gateway

```bash
# Create API Gateway
aws apigateway create-rest-api --name "ShopAWS-API" --region us-east-1

# Configure resources and methods (see infrastructure/api-gateway-config.json)
```

### 5. Set Up Cognito

```bash
# Create User Pool
aws cognito-idp create-user-pool --pool-name "ShopAWS-Users" --region us-east-1

# Create App Client
aws cognito-idp create-user-pool-client --user-pool-id YOUR_POOL_ID --client-name "ShopAWS-Web"
```

## Environment Variables

Update your `.env.local` file with the created resources:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1

DYNAMODB_PRODUCTS_TABLE=ecommerce-products
DYNAMODB_CATEGORIES_TABLE=ecommerce-categories
DYNAMODB_ORDERS_TABLE=ecommerce-orders
DYNAMODB_ORDER_ITEMS_TABLE=ecommerce-order-items
DYNAMODB_USERS_TABLE=ecommerce-users

S3_BUCKET_NAME=ecommerce-product-images
NEXT_PUBLIC_S3_BUCKET_URL=https://ecommerce-product-images.s3.amazonaws.com

NEXT_PUBLIC_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## Deployment

### Using AWS SAM

```bash
sam build
sam deploy --guided
```

### Using Serverless Framework

```bash
serverless deploy --stage prod
```

### Manual Deployment

```bash
# Zip each Lambda function
cd lambdas/products
zip -r function.zip .
aws lambda create-function --function-name products-handler --runtime nodejs18.x --handler index.handler --zip-file fileb://function.zip
```

## Monitoring

- CloudWatch Logs: Monitor Lambda execution logs
- CloudWatch Metrics: Track API Gateway requests, Lambda invocations, DynamoDB operations
- X-Ray: Distributed tracing for debugging

## Security

- All API endpoints protected with Cognito authorizer
- S3 bucket configured with appropriate CORS and access policies
- DynamoDB tables use IAM roles for access control
- Environment variables stored securely in AWS Systems Manager Parameter Store

## Cost Optimization

- DynamoDB: Use on-demand billing for variable workloads
- Lambda: Optimize function memory and timeout settings
- S3: Enable lifecycle policies for old images
- API Gateway: Enable caching for frequently accessed endpoints
