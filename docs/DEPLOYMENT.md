# Deployment & Operations Guide

This document consolidates all of the critical information needed to run the Paper & Ink e‑commerce platform in production.

## 1. Environment Overview

| Area | Service | Notes |
|------|---------|-------|
| Frontend | Next.js 14 (App Router) | Deploy on Vercel or any Node host |
| Auth | AWS Cognito User Pool | Handles signup/login + JWT tokens |
| Database | DynamoDB tables (`ecommerce-*`) | Products, categories, orders, users, reviews |
| Storage | Amazon S3 | Product imagery via pre‑signed URLs |
| Payments | Razorpay | Sandbox/live keys managed via env vars |
| IaC | AWS SAM / CloudFormation | `aws-backend/` folder |

## 2. Required Environment Variables

Create `.env.local` from the provided example and set the following (values shown are examples):

```env
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# DynamoDB (no suffixes in table names)
DYNAMODB_PRODUCTS_TABLE=ecommerce-products
DYNAMODB_CATEGORIES_TABLE=ecommerce-categories
DYNAMODB_ORDERS_TABLE=ecommerce-orders
DYNAMODB_ORDER_ITEMS_TABLE=ecommerce-order-items
DYNAMODB_USERS_TABLE=ecommerce-users
DYNAMODB_REVIEWS_TABLE=ecommerce-reviews-prod

# S3
S3_BUCKET_NAME=ecommerce-product-images-420
NEXT_PUBLIC_S3_BUCKET_URL=https://ecommerce-product-images-420.s3.amazonaws.com

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 3. Razorpay Setup

1. Log in to the Razorpay dashboard → switch to **Test Mode** while developing.
2. Create API keys and add them to `.env.local`.
3. Whitelist `localhost:3000` (or your production domain) under **Settings → Allowed Domains**.
4. The checkout flow now creates an order in DynamoDB **and** calls `/api/razorpay/create-order` before opening the Razorpay modal.
5. Payment verification requires both the order id and user id because the `ecommerce-orders` table uses a composite key (`id` + `userId`). Do not remove either.

## 4. DynamoDB Tables

Make sure these tables exist before deploying:

| Table | Keys | Notes |
|-------|------|-------|
| `ecommerce-products` | `id (HASH)` | `categoryId-index`, `hostId-index` |
| `ecommerce-categories` | `id (HASH)` | — |
| `ecommerce-orders` | `id (HASH)`, `userId (RANGE)` | `userId-index` on (`userId`, `createdAt`) |
| `ecommerce-order-items` | `id (HASH)` | GSIs for `orderId` and `hostId` |
| `ecommerce-users` | `id (HASH)` | — |
| `ecommerce-reviews-prod` | `id (HASH)` | `productId-index` |

To create a table quickly:

```bash
aws dynamodb create-table \
  --table-name ecommerce-reviews-prod \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=productId,AttributeType=S AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes IndexName=productId-index,KeySchema=[{AttributeName=productId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL} \
  --region us-east-1
```

## 5. Deployment Steps

### Frontend (Vercel)

1. Push to GitHub.
2. Import the repository in Vercel → set environment variables.
3. Deploy via UI or `vercel --prod`.

### Backend (AWS SAM)

```bash
cd aws-backend
sam build
sam deploy --guided
```

Provide stack name, region, and parameter overrides (e.g., `Environment=prod`).

### Pre-Deploy Checklist

- [ ] Remove `.next/` and other build artifacts from the repo.
- [ ] Commit only source files (no `node_modules/`).
- [ ] Update `next.config.ts` (use `images.remotePatterns` instead of deprecated `images.domains`).
- [ ] Verify `.env.local` is **not** committed.
- [ ] Run `npm run lint` and `npm run type-check`.
- [ ] Test checkout flow end-to-end (creates order, payment verified, admin panel updates).

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| **`ValidationException: The provided key element does not match the schema`** | Ensure `/api/orders/verify-payment` receives both `orderId` and `userId`. The table key is composite. |
| **Orders not showing in admin panel** | `/admin/orders` now calls `/api/orders`; ensure the API returns data and DynamoDB tables contain entries. |
| **Razorpay modal error (“localhost is not allowed”)** | Use **Test Mode** keys and add localhost to allowed domains. |
| **Reviews API 500** | Create the `ecommerce-reviews-prod` table or update `DYNAMODB_REVIEWS_TABLE` env var. |
| **Images blocked in production** | Replace `images.domains` with `images.remotePatterns` in `next.config.ts` and whitelist S3 bucket host. |

## 7. Reference Commands

```bash
# Scan orders table
aws dynamodb scan --table-name ecommerce-orders --region us-east-1

# Fetch specific order (remember composite key)
aws dynamodb get-item \
  --table-name ecommerce-orders \
  --key '{"id":{"S":"ORDER-123"},"userId":{"S":"USER-456"}}' \
  --region us-east-1
```

Keep this document and `README.md` under version control; remove other ad-hoc notes before deployment.
