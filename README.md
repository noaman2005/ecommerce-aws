# Nisha Stationery - Cloud-Native E-Commerce Platform

A full-stack, serverless e-commerce web application built with **Next.js 14+**, **TypeScript**, and **AWS services**. A curated stationery marketplace featuring a modern, aesthetic UI with smooth micro-animations, role-based access control, and scalable cloud infrastructure.

![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Customer Features
- 🏠 **Home Page** - Hero section with featured stationery products
- 🛍️ **Product Listing** - Browse notebooks, pens, planners with category filters
- 📦 **Product Details** - Image gallery, descriptions, and add-to-cart
- 🛒 **Shopping Cart** - Quantity management and price calculation
- 🔐 **Authentication** - Sign up, login, logout with AWS Cognito
- 🚫 **Checkout Disabled** - No online checkout or orders; users are directed to contact/WhatsApp/store

### Host/Admin Features
- 📊 **Admin Dashboard** - Inventory-focused overview (no orders)
- ➕ **Product CRUD** - Add, edit, delete products with S3 image upload
- 🏷️ **Category Management** - Create and manage product categories
- 🖼️ **Bulk Image Assist** - Category placeholders and SerpAPI-powered suggestions during bulk upload
- 🔒 **Secure Access** - Role-based route guards and API protection

### UI/UX
- 🎨 **Minimalistic Design** - Clean layouts with modern aesthetics
- ✨ **Micro-Animations** - Smooth transitions with Framer Motion
- 📱 **Responsive** - Mobile-first design approach
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 🌙 **Dark Mode Support** - Automatic theme switching

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vercel)                     │
│  Next.js 14 + TypeScript + Tailwind CSS + Framer Motion    │
└────────────────────┬────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS API Gateway                           │
│              (REST API + Cognito Authorizer)                │
└────────────────────┬────────────────────────────────────────┘
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
  ┌─────────┐               ┌─────────┐
  │ Lambda  │               │ Lambda  │
  │Products │               │Categories│
  └────┬────┘               └────┬────┘
       │                         │
       └────────────┬────────────┘
                    ▼
       ┌────────────────────────┐
       │   DynamoDB Tables      │
       │ • Products             │
       │ • Categories           │
       │ • Users                │
       └────────────────────────┘

┌──────────────┐         ┌──────────────┐
│  AWS Cognito │         │   AWS S3     │
│  User Pools  │         │Product Images│
└──────────────┘         └──────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend (AWS)
- **Compute**: AWS Lambda (Node.js 18)
- **API**: AWS API Gateway (REST)
- **Database**: AWS DynamoDB (products, categories, users; orders removed)
- **Authentication**: AWS Cognito
- **Storage**: AWS S3
- **Monitoring**: AWS CloudWatch
- **IaC**: AWS CloudFormation / SAM

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- AWS Account with appropriate permissions
- AWS CLI configured
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-aws.git
cd ecommerce-aws
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your AWS credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your AWS configuration:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# DynamoDB Tables
DYNAMODB_PRODUCTS_TABLE=ecommerce-products
DYNAMODB_CATEGORIES_TABLE=ecommerce-categories
DYNAMODB_USERS_TABLE=ecommerce-users

# AWS S3
S3_BUCKET_NAME=ecommerce-product-images
NEXT_PUBLIC_S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com

# API Gateway
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### 4. Set Up AWS Infrastructure

#### Option A: Using CloudFormation (Recommended)

```bash
cd aws-backend/infrastructure
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name shopaws-stack \
  --parameter-overrides Environment=prod \
  --capabilities CAPABILITY_IAM
```

#### Option B: Manual Setup

```bash
# Create DynamoDB tables
cd aws-backend/infrastructure
node dynamodb-setup.js

# Create S3 bucket
aws s3 mb s3://ecommerce-product-images --region us-east-1

# Deploy Lambda functions
cd ../lambdas/products
npm install
zip -r function.zip .
aws lambda create-function --function-name products-handler \
  --runtime nodejs18.x --handler index.handler \
  --zip-file fileb://function.zip --role YOUR_LAMBDA_ROLE_ARN
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

### Backend (AWS)

```bash
# Using AWS SAM
cd aws-backend
sam build
sam deploy --guided

# Using Serverless Framework
serverless deploy --stage prod
```

## 📁 Project Structure

```
ecommerce-aws/
├── app/                          # Next.js app directory (App Router)
│   ├── api/                      # Next.js API routes (for internal use)
│   │   ├── products/             # Product API endpoints (not used by frontend)
│   │   ├── categories/           # Category API endpoints (not used by frontend)
│   │   ├── image-suggest/        # SerpAPI Bing Images proxy
│   │   └── upload/               # Image upload endpoint
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   └── categories/
│   ├── products/                 # Product pages
│   │   ├── page.tsx              # Product listing
│   │   └── [id]/page.tsx         # Product detail
│   │   ├── cart/                     # Shopping cart (no checkout)
│   ├── categories/               # Categories page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles
│   └── providers.tsx             # Auth provider
├── components/                   # React components
│   ├── ui/                       # UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── image-upload.tsx      # S3 image upload
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── products/                 # Product components
│   │   └── product-card.tsx
│   └── app-shell.tsx             # App shell wrapper
├── lib/                          # Utilities and helpers
│   ├── api.ts                    # API client (Lambda/Gateway)
│   ├── dynamodb.ts               # DynamoDB helpers
│   ├── s3.ts                     # S3 upload helpers
│   ├── storage.ts                # Product storage (legacy)
│   ├── constants.ts              # App constants
│   ├── aws/                      # AWS SDK config
│   │   ├── config.ts
│   │   └── s3.ts
│   ├── auth/                     # Authentication helpers
│   │   └── cognito.ts
│   ├── hooks/                    # React hooks
│   │   └── use-products.ts       # SWR hook for products
│   └── store/                    # Zustand stores
│       ├── auth-store.ts
│       └── cart-store.ts
├── types/                        # TypeScript types
│   └── index.ts
├── aws-backend/                  # AWS Lambda functions
│   ├── lambdas/
│   │   └── products/             # Products Lambda handler
│   │       ├── index.js          # ESM handler with routing
│   │       ├── package.json
│   │       └── package-lock.json
│   ├── infrastructure/           # IaC templates
│   │   ├── cloudformation-template.yaml
│   │   └── README.md
│   └── README.md
├── public/                       # Static assets
├── .env.local.example            # Environment variables template
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔑 AWS Services Used

| Service | Purpose |
|---------|---------|
| **AWS Lambda** | Serverless compute for API handlers |
| **API Gateway** | RESTful API endpoints with CORS |
| **DynamoDB** | NoSQL database for products, orders, users |
| **Cognito** | User authentication and authorization |
| **S3** | Object storage for product images |
| **CloudWatch** | Logging and monitoring |
| **IAM** | Access control and permissions |

## 🔐 Security

- ✅ JWT-based authentication with AWS Cognito
- ✅ Role-based access control (RBAC)
- ✅ API Gateway with Cognito authorizer
- ✅ Secure S3 pre-signed URLs for uploads
- ✅ Environment variables for sensitive data
- ✅ HTTPS everywhere
- ✅ Input validation with Zod
- ✅ XSS and CSRF protection

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance Optimizations

- ⚡ Next.js App Router for optimal performance
- 🖼️ Image optimization with Next.js Image component
- 📦 Code splitting and lazy loading
- 🗄️ DynamoDB on-demand billing for cost efficiency
- 🚀 CDN delivery via Vercel Edge Network
- 💾 Client-side state caching with Zustand

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- Next.js team for the amazing framework
- AWS for cloud infrastructure
- Vercel for hosting platform
- Open source community

## 📧 Support

For support, open an issue in the repository or check the documentation files.

---

**Built with ❤️ using Next.js and AWS**  
**Status**: ✅ Core features complete, backend integrated with DynamoDB, S3 image uploads, and Cognito authentication
