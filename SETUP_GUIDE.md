# 🚀 Tonninyira - Complete Setup Guide
## GitHub + Cloudflare Pages + Supabase Backend

---

## 📋 Table of Contents
1. [GitHub Repository Setup](#github-setup)
2. [Supabase Database Setup](#supabase-setup)
3. [Cloudflare Pages Deployment](#cloudflare-setup)
4. [Environment Variables](#environment-variables)
5. [Testing & Troubleshooting](#testing)

---

## <a name="github-setup"></a>🐙 GitHub Repository Setup

### Step 1: Create GitHub Repository

```bash
# Create a new repository on GitHub at github.com/new
# Name: tonninyira
# Description: Affordable e-commerce & delivery platform for Kampala
# Make it PUBLIC for free hosting
```

### Step 2: Clone & Push to GitHub

```bash
# Navigate to your project folder
cd tonninyira-prod

# Initialize git
git init
git add .
git commit -m "🚀 Initial Tonninyira App - GitHub + Cloudflare + Supabase"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/tonninyira.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Verify GitHub Pages

✅ Your repo should now have `index.html` in the root  
✅ GitHub will automatically serve it at: `https://USERNAME.github.io/tonninyira/`

---

## <a name="supabase-setup"></a>🔒 Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Enter project details:
   - **Name**: Tonninyira
   - **Database Password**: Create a strong password
   - **Region**: Select region closest to Uganda (Europe - London is acceptable)
5. Click "Create New Project" (wait 2-3 minutes)

### Step 2: Get API Credentials

Once your project is created:

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon (public)** key → `SUPABASE_ANON_KEY`

### Step 3: Create Database Tables

Go to **SQL Editor** and run this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id),
  user_email VARCHAR(255),
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  delivery_area VARCHAR(50),
  delivery_option VARCHAR(50),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category VARCHAR(50),
  icon VARCHAR(10),
  zone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample products
INSERT INTO public.products (id, name, description, price, category, icon, zone) VALUES
-- Fast Foods
('ff-1', 'Rolex (Chapati Roll)', 'Egg + vegetable wrapped in chapati', 2000, 'fastfood', '🌯', 'fastfood'),
('ff-2', 'Posho & Beans', 'Ready-to-eat meal', 3500, 'fastfood', '🍲', 'fastfood'),
('ff-3', 'Rice & Stew', 'With meat/chicken pieces', 4000, 'fastfood', '🍚', 'fastfood'),
('ff-4', 'Fried Chicken Pieces', '5-6 pieces (crispy)', 5000, 'fastfood', '🍗', 'fastfood'),
('ff-5', 'Ugali & Vegetables', 'With sukuma wiki & sauce', 3000, 'fastfood', '🥔', 'fastfood'),
('ff-6', 'Samosa Pack', '5 pieces (meat or veg)', 2500, 'fastfood', '🥟', 'fastfood'),
('ff-7', 'Chapati & Curry', '2 chapatis + sauce', 3500, 'fastfood', '🫓', 'fastfood'),
('ff-8', 'Chicken Soup', 'With rice or posho', 4500, 'fastfood', '🍲', 'fastfood'),
('ff-9', 'Matoke & Fish', 'Steamed plantain + fish', 6000, 'fastfood', '🍌', 'fastfood'),
('ff-10', 'Beans on Toast', 'With toast slices', 2500, 'fastfood', '🍞', 'fastfood'),
('ff-11', 'Beef Skewers', '3-4 sticks grilled', 5500, 'fastfood', '🍢', 'fastfood'),
('ff-12', 'Mandazi Pack', '6 pieces (sweet fried bread)', 2000, 'fastfood', '🍩', 'fastfood');

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 4: Enable Authentication

1. Go to **Authentication → Providers**
2. Enable:
   - ✅ Email (default - already enabled)
   - ✅ Phone (optional)
3. Go to **Authentication → Email Templates**
4. Customize welcome email if desired

### Step 5: Test Supabase Connection

Create a test file `test-supabase.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <h1>Testing Supabase Connection...</h1>
    <p id="result">Loading...</p>
    <script>
        const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
        const SUPABASE_KEY = 'YOUR_ANON_KEY';
        
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        async function test() {
            try {
                const { data, error } = await client.from('products').select('*').limit(1);
                if (error) throw error;
                document.getElementById('result').textContent = '✅ Supabase connected! Found ' + data.length + ' products.';
            } catch (error) {
                document.getElementById('result').textContent = '❌ Error: ' + error.message;
            }
        }
        
        test();
    </script>
</body>
</html>
```

---

## <a name="cloudflare-setup"></a>☁️ Cloudflare Pages Deployment

### Step 1: Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up and verify email
3. Add your domain or use Cloudflare's free subdomain

### Step 2: Connect GitHub to Cloudflare

1. Go to **Cloudflare Dashboard → Pages**
2. Click **Create a project**
3. Select **Connect to Git**
4. Authorize GitHub
5. Select your `tonninyira` repository
6. Click **Begin setup**

### Step 3: Configure Build Settings

```
Framework preset: None
Build command: (leave empty - we don't have a build step)
Build output directory: . (current directory)
Environment variables: (see next section)
```

### Step 4: Add Environment Variables

In Cloudflare Pages project settings → **Environment Variables**:

```
SUPABASE_URL = https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY = your_anon_key_here
```

### Step 5: Deploy!

Click **Save and Deploy**

✅ Your app will be available at: `https://tonninyira.pages.dev`

---

## <a name="environment-variables"></a>🔐 Environment Variables

### Local Development (.env file)

Create a `.env` file in the root:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ IMPORTANT: Add `.env` to `.gitignore`**

```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "🔒 Add .env to .gitignore for security"
git push
```

### GitHub Secrets (for CI/CD)

1. Go to **GitHub Repo → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:

| Secret Name | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API Token |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key |

---

## <a name="testing"></a>✅ Testing & Troubleshooting

### Test Local Development

```bash
# Start a simple HTTP server
python -m http.server 8000

# Open browser
http://localhost:8000
```

### Test Production Links

- **GitHub Pages**: `https://USERNAME.github.io/tonninyira/`
- **Cloudflare Pages**: `https://tonninyira.pages.dev`

### Common Issues & Solutions

#### ❌ Issue: "Only seeing README.md"

**Solution**: Ensure `index.html` is in the **root** of your repository, not in a subfolder.

```bash
# Check file structure
ls -la
# Should show: index.html, app.js, style.css, README.md
```

#### ❌ Issue: "Supabase connection failed"

**Solution**: Verify your API credentials:

1. Go to Supabase Dashboard
2. Check **Settings → API**
3. Confirm `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
4. Check browser console for actual error message

#### ❌ Issue: "Cloudflare not deploying updates"

**Solution**: 

1. Verify deployment workflow in **.github/workflows/deploy.yml**
2. Check GitHub Actions tab for failed workflows
3. Ensure branch is set to `main`
4. Try manual deployment: GitHub Repo → Settings → Pages → Deploy from branch

#### ❌ Issue: "CORS errors with Supabase"

**Solution**: Supabase automatically allows your app domain. If issues persist:

1. Go to Supabase → **Settings → CORS**
2. Add your Cloudflare Pages domain to allowed origins

---

## 📝 Pushing Updates

After making changes locally:

```bash
# Stage all changes
git add .

# Commit with message
git commit -m "✨ Feature: Add new products"

# Push to main
git push

# Cloudflare will auto-deploy in ~30 seconds
# GitHub Pages updates within 1-2 minutes
```

---

## 🔄 CI/CD Pipeline Summary

```
Your Local Changes
       ↓
  Git Push to main
       ↓
  GitHub Actions Workflow
       ↓
  Deploy to Cloudflare Pages ← Auto-deployed!
       ↓
  https://tonninyira.pages.dev (Live!)
```

---

## 📱 Testing on Mobile

1. Get your Cloudflare Pages URL: `https://tonninyira.pages.dev`
2. Open on your phone browser
3. Test all features:
   - ✅ Add to cart
   - ✅ Change delivery area
   - ✅ View savings
   - ✅ Login / Authentication
   - ✅ Payment flow

---

## 🎉 Success Checklist

- [ ] GitHub repository created and pushed
- [ ] `index.html` is in the root directory
- [ ] Supabase project created with API keys
- [ ] Database tables created (SQL script run)
- [ ] Cloudflare Pages connected to GitHub
- [ ] Environment variables added to Cloudflare
- [ ] App deployed and working at: `https://tonninyira.pages.dev`
- [ ] Fast Foods category showing (2000 UGX and above)
- [ ] Login/Authentication working
- [ ] Orders saving to Supabase database
- [ ] Savings calculator working correctly

---

## 🆘 Need Help?

### Resources:
- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Pages**: https://pages.cloudflare.com/
- **GitHub Pages**: https://pages.github.com/

### Debug Checklist:
1. Check browser console (F12 → Console)
2. Check Cloudflare build logs
3. Verify Supabase connection
4. Inspect network requests (F12 → Network)
5. Check environment variables are set

---

## 🚀 Next Steps

1. **Add Real Delivery Integration**: Integrate with actual logistics API
2. **Payment Gateway**: Add real MTN MoMo, Airtel Money payments
3. **Vendor Dashboard**: Build admin panel for product management
4. **Order Tracking**: Real-time tracking with Google Maps API
5. **Push Notifications**: Send delivery updates to customers

---

**Happy shipping! 📦** 

Made with ❤️ for affordable e-commerce in Uganda
