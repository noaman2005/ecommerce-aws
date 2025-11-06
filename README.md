# ShopAWS - Cloud-Native E-Commerce Platform

A full-stack, serverless e-commerce web application built with **Next.js 14+**, **TypeScript**, and **AWS services**. Features a minimalistic, aesthetic UI with smooth micro-animations, role-based access control, and scalable cloud infrastructure.

![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Customer Features
- 🏠 **Home Page** - Hero section with featured products and categories
- 🛍️ **Product Listing** - Search, filters (category, price range), and sorting
- 📦 **Product Details** - Image gallery, descriptions, reviews, and add-to-cart
- 🛒 **Shopping Cart** - Quantity management and price calculation
- 💳 **Checkout Flow** - Order summary and address management
- 🔐 **Authentication** - Sign up, login, logout with AWS Cognito
- 📋 **Order History** - View past purchases and order status

### Host/Admin Features
- 🔄 **Role Switching** - Toggle between customer and host mode (Airbnb-style)
- 📊 **Admin Dashboard** - Analytics overview and management hub
- ➕ **Product CRUD** - Add, edit, delete products with S3 image upload
- 🏷️ **Category Management** - Create and assign product categories
- 📦 **Order Management** - View and update order status
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
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Lambda  │  │ Lambda  │  │ Lambda  │
   │Products │  │ Orders  │  │Categories│
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
        ┌────────────────────────┐
        │   DynamoDB Tables      │
        │ • Products             │
        │ • Orders               │
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
- **Database**: AWS DynamoDB
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
DYNAMODB_ORDERS_TABLE=ecommerce-orders
DYNAMODB_ORDER_ITEMS_TABLE=ecommerce-order-items
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
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── products/                 # Product pages
│   ├── cart/                     # Shopping cart
│   ├── checkout/                 # Checkout flow
│   ├── orders/                   # Order history
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── orders/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── modal.tsx
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   └── products/                 # Product components
│       └── product-card.tsx
├── lib/                          # Utilities and helpers
│   ├── aws/                      # AWS SDK clients
│   │   ├── config.ts
│   │   └── s3.ts
│   ├── auth/                     # Authentication helpers
│   │   └── cognito.ts
│   └── store/                    # State management
│       ├── auth-store.ts
│       └── cart-store.ts
├── types/                        # TypeScript types
│   └── index.ts
├── aws-backend/                  # AWS Lambda functions
│   ├── lambdas/
│   │   ├── products/
│   │   ├── categories/
│   │   └── orders/
│   └── infrastructure/           # IaC templates
│       ├── cloudformation-template.yaml
│       └── dynamodb-setup.js
├── public/                       # Static assets
├── .env.local.example            # Environment variables template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- AWS for cloud infrastructure
- Vercel for hosting platform
- Open source community

## 📧 Support

For support, email support@shopaws.com or open an issue in the repository.

---

**Built with ❤️ using Next.js and AWS**
