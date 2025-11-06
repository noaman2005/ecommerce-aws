# Deployment Guide - ShopAWS E-Commerce Platform

This guide provides step-by-step instructions for deploying the ShopAWS platform to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (AWS Lambda)](#backend-deployment-aws-lambda)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### Required Tools
- Node.js 18+ installed
- AWS CLI configured (`aws configure`)
- AWS SAM CLI (optional, for easier Lambda deployment)
- Vercel CLI (optional, for frontend deployment)
- Git

### AWS Account Requirements
- IAM user with appropriate permissions:
  - DynamoDB full access
  - Lambda full access
  - API Gateway full access
  - S3 full access
  - Cognito full access
  - CloudWatch Logs access
  - IAM role creation

## AWS Infrastructure Setup

### Step 1: Create AWS Cognito User Pool

```bash
# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name ShopAWS-Users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --auto-verified-attributes email \
  --schema Name=email,AttributeDataType=String,Required=true \
          Name=name,AttributeDataType=String,Required=true \
          Name=custom:role,AttributeDataType=String,Mutable=true \
  --region us-east-1

# Note the UserPoolId from the output

# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id YOUR_USER_POOL_ID \
  --client-name ShopAWS-Web \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1

# Note the ClientId from the output
```

### Step 2: Create DynamoDB Tables

```bash
cd aws-backend/infrastructure

# Install dependencies
npm install @aws-sdk/client-dynamodb

# Run the setup script
node dynamodb-setup.js
```

Alternatively, use CloudFormation:

```bash
aws cloudformation create-stack \
  --stack-name shopaws-dynamodb \
  --template-body file://dynamodb-tables.yaml \
  --region us-east-1
```

### Step 3: Create S3 Bucket for Product Images

```bash
# Create bucket
aws s3 mb s3://shopaws-product-images-prod --region us-east-1

# Enable CORS
cat > cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket shopaws-product-images-prod \
  --cors-configuration file://cors.json

# Set public read policy
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shopaws-product-images-prod/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket shopaws-product-images-prod \
  --policy file://bucket-policy.json
```

### Step 4: Deploy Lambda Functions

#### Option A: Using AWS SAM (Recommended)

```bash
cd aws-backend

# Build
sam build

# Deploy
sam deploy \
  --stack-name shopaws-backend \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=prod \
    CognitoUserPoolId=YOUR_USER_POOL_ID \
  --region us-east-1
```

#### Option B: Manual Deployment

```bash
cd aws-backend/lambdas/products

# Install dependencies
npm install

# Create deployment package
zip -r function.zip .

# Create IAM role for Lambda
aws iam create-role \
  --role-name ShopAWS-Lambda-Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name ShopAWS-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name ShopAWS-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Create Lambda function
aws lambda create-function \
  --function-name shopaws-products-handler \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ShopAWS-Lambda-Role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables={
    DYNAMODB_PRODUCTS_TABLE=ecommerce-products,
    AWS_REGION=us-east-1
  } \
  --region us-east-1
```

### Step 5: Create API Gateway

```bash
# Create REST API
aws apigateway create-rest-api \
  --name ShopAWS-API \
  --description "ShopAWS E-Commerce API" \
  --region us-east-1

# Note the API ID from the output

# Create Cognito Authorizer
aws apigateway create-authorizer \
  --rest-api-id YOUR_API_ID \
  --name CognitoAuthorizer \
  --type COGNITO_USER_POOLS \
  --provider-arns arn:aws:cognito-idp:us-east-1:YOUR_ACCOUNT_ID:userpool/YOUR_USER_POOL_ID \
  --identity-source method.request.header.Authorization \
  --region us-east-1

# Create resources and methods (see AWS Console for easier setup)
# Or use the CloudFormation template which includes API Gateway configuration
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Environment Variables

Create a `.env.production` file:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_URL=https://shopaws-product-images-prod.s3.amazonaws.com
NEXT_PUBLIC_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Step 2: Deploy to Vercel

#### Using Vercel Dashboard:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables from `.env.production`
7. Click "Deploy"

#### Using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_COGNITO_USER_POOL_ID
vercel env add NEXT_PUBLIC_COGNITO_CLIENT_ID
# ... add all other variables
```

### Step 3: Configure Custom Domain (Optional)

```bash
# Add domain
vercel domains add your-domain.com

# Configure DNS records as instructed by Vercel
```

## Backend Deployment (AWS Lambda)

### Using CloudFormation Stack

```bash
cd aws-backend/infrastructure

aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name shopaws-stack \
  --parameter-overrides \
    Environment=prod \
    CognitoUserPoolId=YOUR_USER_POOL_ID \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Get outputs
aws cloudformation describe-stacks \
  --stack-name shopaws-stack \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

## Post-Deployment Configuration

### 1. Update Frontend Environment Variables

After deploying the backend, update your Vercel environment variables with the actual API Gateway URL:

```bash
vercel env add NEXT_PUBLIC_API_GATEWAY_URL production
# Enter the API Gateway URL from CloudFormation outputs
```

### 2. Create Initial Admin User

```bash
# Sign up through the application UI, then update the user role in Cognito
aws cognito-idp admin-update-user-attributes \
  --user-pool-id YOUR_USER_POOL_ID \
  --username user@example.com \
  --user-attributes Name=custom:role,Value=admin \
  --region us-east-1
```

### 3. Seed Initial Data (Optional)

```bash
# Create sample categories
node aws-backend/scripts/seed-categories.js

# Create sample products
node aws-backend/scripts/seed-products.js
```

### 4. Configure CloudWatch Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name shopaws-lambda-errors \
  --alarm-description "Alert on Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=shopaws-products-handler \
  --region us-east-1
```

## Monitoring and Maintenance

### CloudWatch Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/shopaws-products-handler --follow

# View API Gateway logs
aws logs tail /aws/apigateway/ShopAWS-API --follow
```

### Performance Monitoring

- **Lambda**: Monitor invocation count, duration, and errors in CloudWatch
- **DynamoDB**: Monitor read/write capacity and throttling
- **API Gateway**: Monitor request count, latency, and 4XX/5XX errors
- **Vercel**: Use Vercel Analytics for frontend performance

### Cost Optimization

1. **DynamoDB**: Use on-demand billing for variable workloads
2. **Lambda**: Optimize memory allocation and timeout settings
3. **S3**: Enable lifecycle policies to archive old images
4. **API Gateway**: Enable caching for frequently accessed endpoints

### Backup Strategy

```bash
# Enable DynamoDB point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name ecommerce-products \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket shopaws-product-images-prod \
  --versioning-configuration Status=Enabled
```

### Scaling Considerations

- **Lambda**: Automatically scales with concurrent executions
- **DynamoDB**: On-demand mode scales automatically
- **API Gateway**: No scaling configuration needed
- **Vercel**: Automatically scales with traffic

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure API Gateway has CORS enabled and S3 bucket has correct CORS configuration
2. **Authentication Failures**: Verify Cognito User Pool ID and Client ID are correct
3. **Lambda Timeouts**: Increase timeout setting or optimize function code
4. **DynamoDB Throttling**: Switch to on-demand billing or increase provisioned capacity

### Health Checks

```bash
# Test API Gateway endpoint
curl https://YOUR_API_GATEWAY_URL/products

# Test Cognito authentication
aws cognito-idp admin-initiate-auth \
  --user-pool-id YOUR_USER_POOL_ID \
  --client-id YOUR_CLIENT_ID \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=test@example.com,PASSWORD=TestPassword123
```

## Rollback Procedure

### Frontend Rollback

```bash
# Rollback to previous deployment in Vercel
vercel rollback
```

### Backend Rollback

```bash
# Rollback CloudFormation stack
aws cloudformation update-stack \
  --stack-name shopaws-stack \
  --use-previous-template \
  --region us-east-1
```

## Security Checklist

- [ ] All API endpoints use HTTPS
- [ ] Cognito User Pool has strong password policy
- [ ] IAM roles follow principle of least privilege
- [ ] S3 bucket has appropriate access policies
- [ ] Environment variables are not committed to Git
- [ ] API Gateway has rate limiting enabled
- [ ] CloudWatch Logs are enabled for all services
- [ ] DynamoDB tables have encryption at rest enabled

## Support

For deployment issues, contact:
- Email: devops@shopaws.com
- Slack: #shopaws-deployment

---

**Last Updated**: January 2024
