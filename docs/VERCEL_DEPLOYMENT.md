# Deploy to Vercel - Step by Step

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Go to Vercel

1. Visit https://vercel.com
2. Sign in with GitHub (or create account)
3. Click **"Add New..."** → **"Project"**

### Step 3: Import GitHub Repository

1. Search for your repository name (e.g., `ecommerce-aws`)
2. Click **"Import"**
3. Vercel will auto-detect Next.js framework

### Step 4: Add Environment Variables

Before deploying, add all env vars from your `.env.local`:

1. Click **"Environment Variables"**
2. Add each variable:

```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = your_key_here
AWS_SECRET_ACCESS_KEY = your_secret_here
NEXT_PUBLIC_COGNITO_USER_POOL_ID = us-east-1_XXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID = xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION = us-east-1
DYNAMODB_PRODUCTS_TABLE = ecommerce-products
DYNAMODB_CATEGORIES_TABLE = ecommerce-categories
DYNAMODB_ORDERS_TABLE = ecommerce-orders
DYNAMODB_ORDER_ITEMS_TABLE = ecommerce-order-items
DYNAMODB_USERS_TABLE = ecommerce-users
DYNAMODB_REVIEWS_TABLE = ecommerce-reviews-prod
S3_BUCKET_NAME = ecommerce-product-images-420
NEXT_PUBLIC_S3_BUCKET_URL = https://ecommerce-product-images-420.s3.amazonaws.com
NEXT_PUBLIC_RAZORPAY_KEY_ID = rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET = xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL = https://your-vercel-domain.vercel.app
```

**Important**: 
- `NEXT_PUBLIC_*` variables are visible in browser (safe for public keys)
- Other variables are server-only (safe for secrets)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 2-3 minutes)
3. Once done, you'll get a live URL: `https://your-project.vercel.app`

### Step 6: Update Razorpay Settings

1. Go to Razorpay Dashboard
2. Settings → Allowed Domains
3. Add your Vercel domain: `your-project.vercel.app`

Done! Your app is live! 🎉

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel --prod
```

This will:
- Ask for project name
- Link to GitHub repo
- Deploy to production

### Step 4: Add Environment Variables via CLI

After first deploy, add env vars:

```bash
vercel env add AWS_REGION
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
# ... repeat for all variables
```

Or edit in Vercel dashboard (easier).

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Check `npm run build` locally first |
| **"Cannot find module"** | Run `npm install` and commit `package-lock.json` |
| **Env vars not working** | Redeploy after adding vars: `vercel --prod` |
| **Images not loading** | Verify S3 bucket hostname in `next.config.ts` |
| **Razorpay modal blocked** | Add Vercel domain to Razorpay allowed domains |
| **DynamoDB connection error** | Check AWS credentials in env vars |

---

## Post-Deployment Testing

After deployment, test the full flow:

1. **Visit your Vercel URL**
2. **Browse products** - should load from DynamoDB
3. **Add to cart** - should work
4. **Go to checkout** - should show shipping form
5. **Click "Pay Now"** - Razorpay modal should open
6. **Use test card**: `4111 1111 1111 1111`
7. **Complete payment** - should redirect to order confirmation
8. **Check admin panel** - order should appear

If everything works, you're live! 🚀

---

## Custom Domain (Optional)

To use your own domain instead of `vercel.app`:

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain
3. Follow DNS setup instructions
4. Update Razorpay allowed domains to your custom domain

---

## Monitoring & Logs

View deployment logs in Vercel:

1. Dashboard → Your Project → **Deployments**
2. Click on a deployment to see logs
3. Check **Functions** tab for API route logs

---

## Rollback

If something breaks:

1. Go to **Deployments** tab
2. Find the previous working deployment
3. Click **"Redeploy"**

---

## Next Steps

- Monitor your app in production
- Set up error tracking (Sentry, LogRocket)
- Enable analytics
- Plan Phase 2 features (wishlist, coupons, etc.)

**Your app is now live on the internet!** 🌍
