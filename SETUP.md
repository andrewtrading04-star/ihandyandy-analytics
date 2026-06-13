# Setup Instructions

Complete guide to set up, deploy, and test the iHandyAndy Analytics System.

---

## PART 1: SUPABASE SETUP

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up if needed)
3. Create a new project:
   - Project name: `ihandyandy-analytics`
   - Database password: Create a strong password (save this!)
   - Region: Choose closest to you (e.g., us-east-1)
4. Wait for project to initialize (5-10 minutes)

### Step 2: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these three values (you'll need them):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon Key** (labeled as "anon")
   - **Service Role Key** (labeled as "service_role")

**SAVE THESE IN A SAFE PLACE** - you'll need them for backend setup.

### Step 3: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"**
6. Check that all tables were created (no errors)

You should now see these tables in the **Table Editor**:
- `events`
- `users`
- `page_metrics`
- `button_metrics`
- `form_metrics`

✅ **Supabase is ready!**

---

## PART 2: DEPLOY BACKEND TO VERCEL

### Step 1: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (easiest)
3. Complete onboarding

### Step 2: Prepare Backend for Deployment

1. Open your terminal/command prompt
2. Navigate to the `backend` folder:
   ```bash
   cd analytics-system/backend
   ```

3. Create a `.env.local` file (do NOT push this to git):
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   PORT=3000
   NODE_ENV=production
   ```
   Replace the values with your Supabase credentials from Part 1, Step 2.

4. Install dependencies:
   ```bash
   npm install
   ```

### Step 3: Deploy to Vercel

**Option A: Via GitHub (Recommended)**

1. Create a GitHub account (if you don't have one)
2. Create a new GitHub repository:
   - Name: `ihandyandy-analytics`
   - Add the entire `analytics-system` folder
   - Push to GitHub

3. Go to [vercel.com/new](https://vercel.com/new)
4. Select **"Import Git Repository"**
5. Find your `ihandyandy-analytics` repo
6. Click **"Import"**
7. Set up environment variables:
   - Click **"Environment Variables"**
   - Add these three:
     ```
     SUPABASE_URL = https://xxxxx.supabase.co
     SUPABASE_ANON_KEY = your-anon-key-here
     SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here
     ```
   - ⚠️ **IMPORTANT**: Mark these as "Sensitive"
8. Click **"Deploy"**
9. Wait for deployment to complete (2-5 minutes)

**Option B: Via Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the `backend` folder:
   ```bash
   cd backend
   vercel --prod
   ```

4. Follow the prompts and set environment variables in the Vercel dashboard

### Step 4: Get Your Backend URL

After deployment completes:
1. Open the Vercel dashboard
2. Click on your `ihandyandy-analytics` project
3. Copy the **Domain** (looks like `analytics-backend-xyz.vercel.app`)
4. Test it: Open `https://your-backend-url.vercel.app/api/health` in your browser
   - You should see: `{"status":"ok","timestamp":"2024-..."}`

✅ **Backend is deployed!**

---

## PART 3: DEPLOY DASHBOARD TO VERCEL

### Step 1: Prepare Dashboard for Deployment

1. Navigate to the dashboard folder:
   ```bash
   cd analytics-system/dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the dashboard:
   ```bash
   npm run build
   ```

### Step 2: Create Vercel Project for Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your `ihandyandy-analytics` GitHub repo again
3. Change the settings:
   - **Root Directory**: Set to `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **"Deploy"**
5. Wait for deployment (2-5 minutes)

### Step 3: Configure Dashboard with Backend URL

1. Wait for the dashboard to deploy
2. Open your dashboard URL (looks like `https://ihandyandy-analytics-dashboard.vercel.app`)
3. You'll see a **Setup Screen**
4. Enter your backend URL from Part 2, Step 4
5. Click **"Configure"**
6. The dashboard should now load with analytics data!

✅ **Dashboard is deployed!**

---

## PART 4: INJECT TRACKING SCRIPT INTO WEBSITE

### Step 1: Get the Tracking Script

Your tracking script is ready at: `tracking/tracker.js`

### Step 2: Configure the Script

Open `tracking/tracker.js` and find this line (around line 11):
```javascript
const BACKEND_URL = 'https://your-backend-url.vercel.app';
```

Replace with your actual backend URL from Part 2, Step 4:
```javascript
const BACKEND_URL = 'https://analytics-backend-xyz.vercel.app';
```

### Step 3: Inject into Landingsite.ai

1. Go to your Landingsite.ai website editor
2. Look for **"Settings"** or **"Code Injection"** section
3. Find **"Custom Code"** or **"Header Code"** option
4. Copy the entire contents of `tracking/tracker.js`
5. Paste it in the code injection area (usually in a `<script>` tag)
6. Save and publish your website

### Step 4: Verify Tracking is Working

1. Open your website in a browser
2. Open the browser's **Developer Console** (F12 or Right-click → Inspect)
3. Go to the **Network** tab
4. Click buttons, fill in form fields, scroll down
5. Look for POST requests to your backend URL ending with `/api/events`
6. Each request should show a `200` status code
7. Open your analytics dashboard - you should see data appearing in real-time!

✅ **Tracking is live!**

---

## CHECKLIST

- [ ] Supabase project created
- [ ] Database tables created (ran schema.sql)
- [ ] Supabase credentials saved securely
- [ ] Backend deployed to Vercel
- [ ] Backend health check working (`/api/health`)
- [ ] Dashboard deployed to Vercel
- [ ] Dashboard configured with backend URL
- [ ] Tracking script updated with backend URL
- [ ] Tracking script injected into website
- [ ] Testing verified (see TESTING.md)

---

## TROUBLESHOOTING

**"Cannot find module '@supabase/supabase-js'"**
- Solution: Run `npm install` in the `backend` folder

**"Failed to fetch analytics data" in dashboard**
- Solution: Make sure backend URL is correct and CORS is enabled (it is in server.js)

**"No data in dashboard"**
- Solution: Make sure tracking script is injected and working (see Part 4, Step 4)

**"Environment variables not set"**
- Solution: Check Vercel dashboard → Project Settings → Environment Variables

**Tracking script not sending events**
- Solution: Check browser console for errors, verify backend URL is in tracker.js

---

## NEXT STEPS

1. Monitor analytics data in the dashboard
2. Use the funnel analysis to see where users drop off
3. Use session tracking to understand user paths
4. Optimize your website based on the insights!

For questions, check TESTING.md for verification steps.
