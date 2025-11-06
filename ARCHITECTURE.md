# ShopAWS Architecture Documentation

## System Architecture Overview

ShopAWS is built as a modern, cloud-native application using a serverless architecture. The system is divided into three main layers: Frontend, API Layer, and Data Layer.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Web Browser (Desktop/Mobile)                 │   │
│  │                                                            │   │
│  │  React Components + Next.js App Router + Tailwind CSS    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Vercel)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 Application                 │   │
│  │  • Server-Side Rendering (SSR)                           │   │
│  │  • Static Site Generation (SSG)                          │   │
│  │  • API Routes                                            │   │
│  │  • Edge Functions                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS SERVICES                              │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  AWS Cognito     │  │  AWS S3          │  │ API Gateway   │ │
│  │  User Pools      │  │  Product Images  │  │ REST API      │ │
│  │  • Authentication│  │  • Public Read   │  │ • CORS        │ │
│  │  • Authorization │  │  • Pre-signed    │  │ • Throttling  │ │
│  │  • JWT Tokens    │  │    URLs          │  │ • Caching     │ │
│  └──────────────────┘  └──────────────────┘  └───────┬───────┘ │
│                                                        │          │
│                                                        ▼          │
│                                          ┌──────────────────────┐│
│                                          │  Lambda Functions    ││
│                                          │  • Products Handler  ││
│                                          │  • Orders Handler    ││
│                                          │  • Categories        ││
│                                          │  • Upload Handler    ││
│                                          └──────────┬───────────┘│
│                                                     │             │
│                                                     ▼             │
│                                          ┌──────────────────────┐│
│                                          │  DynamoDB Tables     ││
│                                          │  • Products          ││
│                                          │  • Orders            ││
│                                          │  • Categories        ││
│                                          │  • Users             ││
│                                          │  • Order Items       ││
│                                          └──────────────────────┘│
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    CloudWatch                             │   │
│  │  • Logs  • Metrics  • Alarms  • Dashboards              │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Layer

#### Next.js Application
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Deployment**: Vercel Edge Network

**Key Features:**
- Server-Side Rendering for SEO
- Static Site Generation for performance
- Incremental Static Regeneration
- API Routes for backend logic
- Image optimization
- Code splitting and lazy loading

#### Pages Structure
```
/                    → Home page (SSG)
/products            → Product listing (SSR)
/products/[id]       → Product details (SSR)
/cart                → Shopping cart (Client-side)
/checkout            → Checkout flow (Client-side)
/auth/login          → Login page (SSG)
/auth/signup         → Signup page (SSG)
/admin/dashboard     → Admin dashboard (Protected, SSR)
/admin/products      → Product management (Protected, SSR)
/orders              → Order history (Protected, SSR)
```

### API Layer

#### AWS API Gateway
- **Type**: REST API
- **Authentication**: AWS Cognito Authorizer
- **CORS**: Enabled for frontend domain
- **Rate Limiting**: 10,000 requests per second
- **Caching**: Enabled for GET requests (TTL: 5 minutes)

**Endpoints:**
```
GET    /products              → List all products
GET    /products/{id}         → Get product details
POST   /products              → Create product (Auth required)
PUT    /products/{id}         → Update product (Auth required)
DELETE /products/{id}         → Delete product (Auth required)

GET    /categories            → List categories
POST   /categories            → Create category (Auth required)

GET    /orders                → List user orders (Auth required)
POST   /orders                → Create order (Auth required)
GET    /orders/{id}           → Get order details (Auth required)
PUT    /orders/{id}/status    → Update order status (Auth required)

POST   /upload/presigned-url  → Get S3 upload URL (Auth required)
```

#### Lambda Functions

**Products Handler** (`products/index.js`)
- Runtime: Node.js 18
- Memory: 512 MB
- Timeout: 30 seconds
- Triggers: API Gateway
- Permissions: DynamoDB Read/Write

**Orders Handler** (`orders/index.js`)
- Runtime: Node.js 18
- Memory: 512 MB
- Timeout: 30 seconds
- Triggers: API Gateway
- Permissions: DynamoDB Read/Write, SES (for emails)

**Categories Handler** (`categories/index.js`)
- Runtime: Node.js 18
- Memory: 256 MB
- Timeout: 15 seconds
- Triggers: API Gateway
- Permissions: DynamoDB Read/Write

### Data Layer

#### DynamoDB Tables

**Products Table**
```
Primary Key: id (String)
Attributes:
  - name (String)
  - description (String)
  - price (Number)
  - categoryId (String)
  - images (List)
  - stock (Number)
  - hostId (String)
  - featured (Boolean)
  - createdAt (String)
  - updatedAt (String)

Global Secondary Indexes:
  - categoryId-index (categoryId, createdAt)
  - hostId-index (hostId, createdAt)
```

**Orders Table**
```
Primary Key: id (String)
Attributes:
  - userId (String)
  - items (List)
  - total (Number)
  - status (String)
  - shippingAddress (Map)
  - createdAt (String)
  - updatedAt (String)

Global Secondary Indexes:
  - userId-index (userId, createdAt)
```

**Categories Table**
```
Primary Key: id (String)
Attributes:
  - name (String)
  - description (String)
  - createdAt (String)
  - updatedAt (String)
```

**Order Items Table**
```
Primary Key: id (String)
Attributes:
  - orderId (String)
  - productId (String)
  - productName (String)
  - productImage (String)
  - quantity (Number)
  - price (Number)
  - hostId (String)
  - createdAt (String)

Global Secondary Indexes:
  - orderId-index (orderId)
  - hostId-index (hostId, createdAt)
```

**Users Table**
```
Primary Key: id (String)
Attributes:
  - email (String)
  - name (String)
  - role (String)
  - createdAt (String)
  - updatedAt (String)
```

#### AWS S3
- **Bucket**: shopaws-product-images
- **Access**: Public read, authenticated write
- **CORS**: Enabled for frontend domain
- **Lifecycle**: Archive to Glacier after 90 days

### Authentication & Authorization

#### AWS Cognito User Pool
```
User Attributes:
  - email (required, verified)
  - name (required)
  - custom:role (customer | host | admin)

Password Policy:
  - Minimum length: 8 characters
  - Require uppercase: Yes
  - Require lowercase: Yes
  - Require numbers: Yes
  - Require symbols: No

MFA: Optional (TOTP)
```

#### Authorization Flow
```
1. User signs up/logs in
2. Cognito issues JWT tokens (ID token, Access token, Refresh token)
3. Frontend stores tokens in localStorage
4. API requests include ID token in Authorization header
5. API Gateway validates token with Cognito
6. Lambda function extracts user info from token
7. Lambda checks user role for protected operations
```

## Data Flow Examples

### Customer Browsing Products
```
1. User visits /products
2. Next.js SSR fetches products from API Gateway
3. API Gateway invokes Products Lambda
4. Lambda queries DynamoDB Products table
5. Results returned to Next.js
6. Page rendered with product data
7. HTML sent to browser
```

### Adding Product to Cart
```
1. User clicks "Add to Cart"
2. Frontend updates Zustand cart store
3. Cart state persisted to localStorage
4. Cart icon updated with item count
5. Toast notification shown
```

### Host Creating Product
```
1. Host fills product form
2. Host uploads image
3. Frontend requests pre-signed URL from API
4. API Gateway invokes Upload Lambda
5. Lambda generates S3 pre-signed URL
6. Frontend uploads image directly to S3
7. Frontend submits product data to API
8. API Gateway validates JWT token
9. Lambda checks user role (must be host/admin)
10. Lambda writes to DynamoDB Products table
11. Success response returned
12. UI updated with new product
```

### Order Processing
```
1. Customer proceeds to checkout
2. Frontend submits order to API
3. API Gateway validates authentication
4. Orders Lambda creates order record
5. Lambda creates order items records
6. Lambda updates product stock
7. Lambda sends confirmation email (SES)
8. Order ID returned to frontend
9. User redirected to order confirmation page
```

## Security Architecture

### Network Security
- All traffic over HTTPS/TLS 1.2+
- API Gateway with AWS WAF (optional)
- DDoS protection via AWS Shield
- VPC endpoints for Lambda (optional)

### Authentication Security
- JWT tokens with short expiration (1 hour)
- Refresh tokens for session management
- Secure token storage (httpOnly cookies recommended)
- Password hashing by Cognito (bcrypt)

### Authorization Security
- Role-based access control (RBAC)
- Resource-level permissions
- API Gateway request validation
- Lambda function input validation

### Data Security
- DynamoDB encryption at rest
- S3 encryption at rest
- Secrets in AWS Systems Manager Parameter Store
- No sensitive data in logs

## Scalability

### Horizontal Scaling
- Lambda: Auto-scales to 1000 concurrent executions
- API Gateway: Handles millions of requests
- DynamoDB: On-demand scaling
- S3: Unlimited storage

### Performance Optimization
- CloudFront CDN for static assets
- API Gateway caching
- DynamoDB DAX for caching (optional)
- Next.js image optimization
- Code splitting and lazy loading

## Monitoring & Observability

### CloudWatch Metrics
- Lambda invocations, duration, errors
- API Gateway requests, latency, errors
- DynamoDB read/write capacity, throttles
- S3 request metrics

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- Application logs from Next.js

### CloudWatch Alarms
- Lambda error rate > 5%
- API Gateway 5XX errors > 1%
- DynamoDB throttling events
- High latency alerts

### Distributed Tracing
- AWS X-Ray for request tracing
- End-to-end visibility
- Performance bottleneck identification

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery (35 days)
- S3: Versioning enabled
- Cognito: User pool export
- Code: Git repository

### Recovery Procedures
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 5 minutes
- Automated backups daily
- Cross-region replication (optional)

## Cost Optimization

### Estimated Monthly Costs (1000 users)
- Lambda: $5-10
- API Gateway: $3-5
- DynamoDB: $5-15 (on-demand)
- S3: $1-3
- Cognito: Free (< 50,000 MAU)
- CloudWatch: $2-5
- **Total**: ~$20-40/month

### Cost Reduction Strategies
- Use DynamoDB on-demand billing
- Enable API Gateway caching
- Optimize Lambda memory allocation
- S3 lifecycle policies
- Reserved capacity for predictable workloads

## Future Enhancements

### Planned Features
- [ ] Real-time inventory updates (WebSockets)
- [ ] Product recommendations (ML)
- [ ] Advanced search (Elasticsearch)
- [ ] Multi-region deployment
- [ ] GraphQL API (AppSync)
- [ ] Mobile app (React Native)
- [ ] Payment integration (Stripe)
- [ ] Email notifications (SES)
- [ ] Analytics dashboard (QuickSight)

### Technical Debt
- [ ] Add comprehensive unit tests
- [ ] Implement E2E tests (Playwright)
- [ ] Add API documentation (Swagger)
- [ ] Implement rate limiting per user
- [ ] Add request/response validation schemas
- [ ] Optimize bundle size
- [ ] Implement proper error boundaries

---

**Last Updated**: January 2024
**Version**: 1.0.0
