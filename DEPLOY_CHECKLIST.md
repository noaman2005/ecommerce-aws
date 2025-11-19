# Pre-Deployment Checklist

## ✅ Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] No console.log statements left (except critical ones)
- [ ] No TODO comments in production code

## ✅ Environment & Secrets
- [ ] `.env.local` exists locally (NOT committed)
- [ ] All required env vars set:
  - AWS credentials
  - Cognito IDs
  - DynamoDB table names
  - S3 bucket info
  - Razorpay keys (TEST mode for staging, LIVE for production)
- [ ] `.env.local.example` updated with all required vars (no secrets)

## ✅ AWS Infrastructure
- [ ] All DynamoDB tables created:
  - `ecommerce-products`
  - `ecommerce-categories`
  - `ecommerce-orders` (composite key: id + userId)
  - `ecommerce-order-items`
  - `ecommerce-users`
  - `ecommerce-reviews-prod`
- [ ] S3 bucket created and CORS configured
- [ ] Cognito User Pool and App Client created
- [ ] IAM roles/permissions configured

## ✅ Frontend Configuration
- [ ] `next.config.ts` uses `remotePatterns` (not deprecated `domains`)
- [ ] S3 bucket hostname added to `remotePatterns`
- [ ] No hardcoded URLs (use env vars)
- [ ] Build succeeds: `npm run build`

## ✅ Payment Integration
- [ ] Razorpay TEST keys in `.env.local`
- [ ] Razorpay LIVE keys ready for production
- [ ] Localhost/domain whitelisted in Razorpay settings
- [ ] Payment flow tested end-to-end

## ✅ Database & APIs
- [ ] `/api/orders` returns all orders (admin panel uses this)
- [ ] `/api/orders/verify-payment` accepts both `orderId` and `userId`
- [ ] `/api/reviews` endpoint working
- [ ] All API routes have error handling

## ✅ Admin Panel
- [ ] Admin orders page fetches from `/api/orders`
- [ ] Orders display in real-time
- [ ] Order status shows correctly

## ✅ Documentation
- [ ] README.md updated
- [ ] `docs/DEPLOYMENT.md` complete
- [ ] `.env.local.example` has all required vars

## ✅ Git & Cleanup
- [ ] `.gitignore` excludes `.env.local`, `node_modules/`, `.next/`
- [ ] No build artifacts committed
- [ ] All markdown files consolidated (only README + docs/DEPLOYMENT.md)
- [ ] Latest changes committed to GitHub

## ✅ Deployment Targets

### Vercel (Frontend)
- [ ] GitHub repo connected
- [ ] Environment variables added in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`

### AWS (Backend - if using Lambda)
- [ ] SAM template ready in `aws-backend/`
- [ ] Lambda functions packaged
- [ ] API Gateway configured
- [ ] DynamoDB tables created

## 🚀 Deployment Commands

```bash
# Local build test
npm run build
npm run start

# Deploy to Vercel
vercel --prod

# Deploy to AWS (if using SAM)
cd aws-backend
sam build
sam deploy --guided
```

## 📋 Post-Deployment Verification

After deploying:
1. [ ] Homepage loads
2. [ ] Can browse products
3. [ ] Can add to cart
4. [ ] Checkout flow works
5. [ ] Razorpay payment modal opens
6. [ ] Payment verification succeeds
7. [ ] Order appears in admin panel
8. [ ] Order status shows "paid"
9. [ ] User can view order history
10. [ ] Can add reviews to products

---

**Status**: Ready for deployment ✅
