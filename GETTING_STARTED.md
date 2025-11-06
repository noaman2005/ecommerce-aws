# Getting Started with ShopAWS

Welcome to ShopAWS! This guide will help you get the application running on your local machine for development and testing.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

For local development without AWS, you can use mock data (already configured in the code).

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You'll See

### Home Page
- Hero section with call-to-action buttons
- Feature highlights (Fast Delivery, Secure Payments, Quality Products)
- Featured products section
- Call-to-action for sellers

### Navigation
- **Home**: Landing page
- **Products**: Browse all products with search and filters
- **Cart**: View and manage shopping cart
- **Login/Signup**: User authentication

## Key Features to Explore

### As a Customer

1. **Browse Products**
   - Go to `/products`
   - Use search bar to find products
   - Filter by category
   - Sort by price, name, or date

2. **Add to Cart**
   - Click on any product card
   - Click "Add to Cart" button
   - View cart icon in navbar (shows item count)

3. **Manage Cart**
   - Go to `/cart`
   - Update quantities
   - Remove items
   - See total price calculation

4. **Authentication**
   - Click "Login" in navbar
   - Try the signup flow at `/auth/signup`
   - Choose between Customer and Host roles

### As a Host/Admin

1. **Access Dashboard**
   - Sign up with "Host" role
   - Click "Switch to Host" or "Dashboard" in navbar
   - View at `/admin/dashboard`

2. **Manage Products**
   - Navigate to Admin Dashboard
   - Click "Manage Products" or go to `/admin/products`
   - Add, edit, or delete products
   - Search and filter products

3. **View Analytics**
   - See total products, orders, revenue
   - View recent orders
   - Monitor pending orders

## Project Structure Overview

```
ecommerce-aws/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home page
│   ├── products/          # Product listing
│   ├── cart/              # Shopping cart
│   ├── auth/              # Login/Signup
│   └── admin/             # Admin dashboard
├── components/            # Reusable components
│   ├── ui/               # UI components (Button, Input, Card)
│   ├── layout/           # Navbar, Footer
│   └── products/         # Product-specific components
├── lib/                   # Utilities
│   ├── aws/              # AWS SDK configuration
│   ├── auth/             # Cognito helpers
│   └── store/            # Zustand state management
├── types/                 # TypeScript types
└── aws-backend/          # Lambda functions & infrastructure
```

## Development Tips

### Hot Reload
The app uses Next.js hot reload. Any changes you make will automatically refresh the browser.

### Mock Data
Currently, the app uses mock data for products and orders. This allows you to develop without setting up AWS services.

### State Management
- **Authentication**: Managed by Zustand (`lib/store/auth-store.ts`)
- **Cart**: Managed by Zustand (`lib/store/cart-store.ts`)
- **Persistence**: Cart and auth state persist in localStorage

### Styling
- Uses Tailwind CSS for styling
- Custom design system in `app/globals.css`
- Framer Motion for animations

## Common Development Tasks

### Add a New Page

1. Create a new folder in `app/`
2. Add a `page.tsx` file
3. Export a default component

Example:
```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}
```

### Add a New Component

1. Create a file in `components/`
2. Export the component
3. Import where needed

Example:
```tsx
// components/ui/badge.tsx
export const Badge = ({ children }) => {
  return <span className="badge">{children}</span>;
};
```

### Add a New API Route

1. Create a file in `app/api/`
2. Export handler functions

Example:
```tsx
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello' });
}
```

## Testing Features

### Test Authentication Flow
1. Go to `/auth/signup`
2. Fill in the form (email, password, name)
3. Select "Customer" or "Host" role
4. Click "Create Account"
5. Note: Without AWS Cognito, this will show an error, but you can still explore the UI

### Test Shopping Flow
1. Browse products at `/products`
2. Click "Add to Cart" on any product
3. Go to `/cart`
4. Update quantities
5. Click "Proceed to Checkout"

### Test Admin Features
1. Manually set user role to "host" in the auth store (browser dev tools)
2. Refresh the page
3. Click "Dashboard" in navbar
4. Explore product management at `/admin/products`

## Connecting to AWS (Optional)

To connect to real AWS services:

1. **Set up AWS account** and create required resources
2. **Update `.env.local`** with your AWS credentials
3. **Follow** the detailed setup in `DEPLOYMENT.md`

Required AWS services:
- Cognito User Pool (authentication)
- DynamoDB Tables (database)
- S3 Bucket (image storage)
- Lambda Functions (API handlers)
- API Gateway (REST API)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Or ignore and continue
# TypeScript errors won't prevent the dev server from running
```

### Styling Not Working
```bash
# Restart the dev server
# Tailwind CSS sometimes needs a restart to pick up new classes
```

## Next Steps

1. **Explore the Code**: Browse through the files to understand the structure
2. **Customize**: Modify colors, fonts, and layouts in `app/globals.css`
3. **Add Features**: Implement checkout, order history, or product reviews
4. **Set Up AWS**: Follow `DEPLOYMENT.md` to connect real backend services
5. **Deploy**: Push to Vercel for a live demo

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Zustand](https://github.com/pmndrs/zustand)

## Getting Help

- Check `README.md` for project overview
- See `DEPLOYMENT.md` for production deployment
- Review code comments for implementation details
- Open an issue on GitHub for bugs or questions

---

**Happy Coding! 🚀**
