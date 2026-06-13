# Quick Reference Card

Print this out or keep it handy during setup.

---

## YOUR CREDENTIALS (SAVE THESE!)

After Supabase setup, save these securely:

```
Supabase URL: _______________________________
Supabase Anon Key: _______________________________
Supabase Service Role Key: _______________________________

Backend URL (after Vercel deploy): _______________________________
Dashboard URL (after Vercel deploy): _______________________________
```

---

## SETUP TIMELINE

| Step | Time | What |
|------|------|------|
| 1 | 5 min | Create Supabase account + get credentials |
| 2 | 2 min | Run SQL schema in Supabase |
| 3 | 10 min | Push backend to GitHub |
| 4 | 5 min | Deploy backend to Vercel (add env vars) |
| 5 | 10 min | Deploy dashboard to Vercel |
| 6 | 2 min | Configure dashboard with backend URL |
| 7 | 1 min | Update tracker.js with backend URL |
| 8 | 2 min | Inject tracker.js into Landingsite.ai |
| 9 | 5 min | Test everything (see TESTING.md) |
| **TOTAL** | **~45 min** | **Complete deployment** |

---

## KEY URLS

### While Setting Up
- Supabase: https://supabase.com
- Vercel: https://vercel.com
- GitHub: https://github.com

### After Setup (Replace YOUR_NAME with actual values)
- Backend: `https://YOUR_BACKEND_URL.vercel.app`
  - Health check: `/api/health`
  - Dashboard: `/api/analytics/`
- Dashboard: `https://YOUR_DASHBOARD_URL.vercel.app`
- Website: `https://ihandyandy.com`

---

## CRUCIAL FILES TO COPY/PASTE

### 1️⃣ Database Schema
- **Source**: `database/schema.sql`
- **Destination**: Supabase → SQL Editor
- **Action**: Copy entire file → Paste → Run

### 2️⃣ Tracking Script
- **Source**: `tracking/tracker.js`
- **Destination**: Landingsite.ai → Code Injection
- **Action**: Update backend URL → Copy → Paste

### 3️⃣ Environment Variables (Backend)
- **Source**: `backend/.env.example`
- **Destination**: Vercel Dashboard → Environment Variables
- **Action**: Create 3 entries:
  - `SUPABASE_URL` = your Supabase URL
  - `SUPABASE_ANON_KEY` = your anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

---

## FILES TO NEVER COMMIT

❌ **Don't push to GitHub**:
- `.env` or `.env.local` (your credentials!)
- `node_modules/` (generated automatically)

✅ **These are safe**:
- `.env.example` (template only)
- All source code
- All configs

---

## DEPLOYMENT CHECKLIST

### Pre-Deploy
- [ ] Supabase account created
- [ ] Database schema (SQL) run successfully
- [ ] GitHub repository created with all files
- [ ] `.gitignore` contains `.env` and `node_modules/`

### Backend Deploy
- [ ] Backend code pushed to GitHub
- [ ] Vercel project connected to GitHub
- [ ] Environment variables added to Vercel:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deployment completed successfully
- [ ] Health check URL working: `/api/health`

### Dashboard Deploy
- [ ] Dashboard code pushed to GitHub (or same repo)
- [ ] Vercel project created for dashboard
- [ ] Build settings correct:
  - [ ] Root directory: `dashboard`
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
- [ ] Deployment completed successfully
- [ ] Dashboard loads without errors

### Tracking Setup
- [ ] Backend URL added to `tracker.js`
- [ ] Script copied to Landingsite.ai
- [ ] Website published with script
- [ ] Test: Open website → DevTools → Network tab
- [ ] Verify POST requests to `/api/events`

### Testing
- [ ] Backend health check returns `200`
- [ ] Events appear in Supabase
- [ ] Dashboard shows data
- [ ] Funnel analysis displays correctly
- [ ] Session tracking works

---

## COMMON MISTAKES (AVOID THESE!)

❌ **Committing credentials**
- Don't push `.env` files
- Use `.env.example` as template

❌ **Wrong backend URL in tracker.js**
- Must match your Vercel deployment
- Format: `https://your-domain.vercel.app`

❌ **Missing environment variables in Vercel**
- All 3 Supabase keys required
- Check Vercel dashboard: Settings → Environment Variables

❌ **Not running database schema**
- Tables won't exist → events fail to save
- Supabase SQL Editor → Copy schema.sql → Run

❌ **Tracker script not injected**
- Website tracking won't work
- Check page source (Ctrl+U) for "Analytics Tracker"

---

## TROUBLESHOOTING FLOWCHART

```
No data in dashboard?
├─ Check tracker.js in page source (Ctrl+U)?
│  ├─ No? → Inject script in Landingsite.ai
│  └─ Yes? → Continue...
├─ Check network tab for POST to /api/events?
│  ├─ No requests? → Verify backend URL in tracker.js
│  ├─ 404 errors? → Wrong backend URL
│  ├─ 500 errors? → Check Vercel logs
│  └─ 200 OK? → Continue...
├─ Check Supabase events table?
│  ├─ Empty? → Backend not storing data
│  │  └─ Check Supabase credentials in Vercel
│  └─ Has data? → Continue...
└─ Check dashboard loads?
   ├─ Blank page? → Backend URL not configured
   ├─ Error? → Check browser console
   └─ Shows data? → Everything working! ✅
```

---

## TESTING QUICK COMMANDS

**Backend Health Check**:
```
Open in browser: https://YOUR_BACKEND_URL.vercel.app/api/health
Expect: {"status":"ok","timestamp":"..."}
```

**Get Page Views**:
```
Open: https://YOUR_BACKEND_URL.vercel.app/api/analytics/page-views
Expect: {"total":X,"events":[...],"timestamp":"..."}
```

**Get Funnel Data**:
```
Open: https://YOUR_BACKEND_URL.vercel.app/api/analytics/funnel
Expect: {"funnel":[...],"total_sessions":X}
```

---

## PASSWORDS & KEYS TO CREATE

1. **Supabase Database Password**
   - Create strong password (12+ chars)
   - Save securely

2. **GitHub Token** (if using CLI)
   - Not needed for web interface
   - Optional for advanced setup

3. **Vercel Token** (if using CLI)
   - Not needed for web interface
   - Optional for advanced setup

---

## SUPPORT CONTACTS

**If stuck on:**

- **Supabase setup** → https://supabase.com/docs
- **Vercel deployment** → https://vercel.com/docs  
- **React code** → https://react.dev/learn
- **Database SQL** → https://www.postgresql.org/docs/
- **General questions** → Review SETUP.md & TESTING.md

---

## ESTIMATED COSTS (2024)

### Free Tier (Recommended for testing)
- **Supabase**: $0/month (free tier)
- **Vercel**: $0/month (free tier)
- **Total**: **$0**

### Paid Tiers (if you outgrow free)
- **Supabase**: $25+/month (if >2GB data)
- **Vercel**: $20+/month (if >100GB bandwidth)
- **Total**: **$45+/month** (enterprise scale)

---

## NEXT ACTIONS

1. **Today**: Read SETUP.md completely
2. **Tomorrow**: Create Supabase account & setup
3. **Same Day**: Deploy backend & dashboard
4. **Test**: Follow TESTING.md checklist
5. **Monitor**: Check dashboard daily first week
6. **Optimize**: Use insights to improve website

---

## CONTACT ME

If you need help:
- Check SETUP.md troubleshooting section
- Check TESTING.md for verification steps
- Review DELIVERABLES.md for overview
- Look at inline code comments

Good luck! 🚀
