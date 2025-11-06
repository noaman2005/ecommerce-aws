# Quick Reference Guide

## 🚀 Common Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### AWS Commands
```bash
# Configure AWS CLI
aws configure

# List DynamoDB tables
aws dynamodb list-tables

# List S3 buckets
aws s3 ls

# View Lambda functions
aws lambda list-functions

# View CloudWatch logs
aws logs tail /aws/lambda/function-name --follow
```

## 📁 File Locations

### Configuration
- Environment variables: `.env.local`
- TypeScript config: `tsconfig.json`
- Next.js config: `next.config.ts`
- Tailwind config: `app/globals.css`

### Key Files
- Home page: `app/page.tsx`
- Products: `app/products/page.tsx`
- Cart: `app/cart/page.tsx`
- Admin: `app/admin/dashboard/page.tsx`
- Auth store: `lib/store/auth-store.ts`
- Cart store: `lib/store/cart-store.ts`

### AWS Backend
- Lambda functions: `aws-backend/lambdas/`
- Infrastructure: `aws-backend/infrastructure/`
- CloudFormation: `aws-backend/infrastructure/cloudformation-template.yaml`

## 🎨 Styling Quick Reference

### Colors
```css
Primary: #2563eb (blue-600)
Secondary: #f1f5f9 (gray-100)
Accent: #3b82f6 (blue-500)
Success: #10b981 (green-500)
Error: #ef4444 (red-500)
Warning: #f59e0b (orange-500)
```

### Common Classes
```tsx
// Buttons
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

// Cards
className="bg-white rounded-xl shadow-md p-6"

// Inputs
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"

// Containers
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

## 🔐 Authentication Flow

### Sign Up
```typescript
import { useAuthStore } from '@/lib/store/auth-store';

const signup = useAuthStore((state) => state.signup);
await signup(email, password, name, 'customer');
```

### Login
```typescript
const login = useAuthStore((state) => state.login);
await login(email, password);
```

### Logout
```typescript
const logout = useAuthStore((state) => state.logout);
logout();
```

### Check Auth Status
```typescript
const { user, isAuthenticated, isLoading } = useAuthStore();
```

## 🛒 Cart Operations

### Add to Cart
```typescript
import { useCartStore } from '@/lib/store/cart-store';

const addItem = useCartStore((state) => state.addItem);
addItem(product, quantity);
```

### Update Quantity
```typescript
const updateQuantity = useCartStore((state) => state.updateQuantity);
updateQuantity(productId, newQuantity);
```

### Remove Item
```typescript
const removeItem = useCartStore((state) => state.removeItem);
removeItem(productId);
```

### Clear Cart
```typescript
const clearCart = useCartStore((state) => state.clearCart);
clearCart();
```

## 🎭 Component Patterns

### Page Component
```typescript
export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Page Title</h1>
        {/* Content */}
      </div>
    </div>
  );
}
```

### Protected Route
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function ProtectedPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## 🎬 Animation Patterns

### Fade In
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Slide Up
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Stagger Children
```typescript
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Clear Cache
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors
```bash
# Check for errors
npx tsc --noEmit

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Module Not Found
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📊 Environment Variables

### Required for Development
```env
# Optional for local development (uses mock data)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_API_GATEWAY_URL=
```

### Required for Production
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# DynamoDB
DYNAMODB_PRODUCTS_TABLE=ecommerce-products
DYNAMODB_ORDERS_TABLE=ecommerce-orders

# S3
S3_BUCKET_NAME=ecommerce-product-images
NEXT_PUBLIC_S3_BUCKET_URL=https://bucket.s3.amazonaws.com

# API Gateway
NEXT_PUBLIC_API_GATEWAY_URL=https://xxx.execute-api.us-east-1.amazonaws.com/prod
```

## 🎯 Testing Checklist

### Manual Testing
- [ ] Home page loads correctly
- [ ] Products page shows products
- [ ] Search and filters work
- [ ] Add to cart functionality
- [ ] Cart updates correctly
- [ ] Login form validation
- [ ] Signup flow works
- [ ] Admin dashboard accessible
- [ ] Product CRUD operations
- [ ] Responsive on mobile
- [ ] Animations are smooth

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices
xl: '1280px'  // Extra large devices
2xl: '1536px' // 2X large devices

// Usage
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## 🚨 Common Errors & Solutions

### "Cannot find module './providers'"
**Solution**: Restart TypeScript server or development server

### "CORS error"
**Solution**: Check API Gateway CORS configuration

### "Unauthorized"
**Solution**: Check JWT token in localStorage, re-login if expired

### "Module not found: Can't resolve '@/...'"
**Solution**: Check `tsconfig.json` paths configuration

### "Hydration error"
**Solution**: Ensure client/server rendered content matches

## 📚 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Zustand](https://github.com/pmndrs/zustand)

## 💡 Pro Tips

1. **Use TypeScript**: Always define types for better DX
2. **Component Composition**: Break down large components
3. **Reuse Styles**: Create utility classes for common patterns
4. **Error Boundaries**: Wrap components in error boundaries
5. **Loading States**: Always show loading indicators
6. **Optimistic Updates**: Update UI before API response
7. **Memoization**: Use `useMemo` and `useCallback` wisely
8. **Code Splitting**: Use dynamic imports for large components
9. **Image Optimization**: Use Next.js Image component
10. **Accessibility**: Test with keyboard navigation

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: January 2024
