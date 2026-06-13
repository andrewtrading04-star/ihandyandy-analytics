# ✅ DEPLOYMENT IN PROGRESS - YOUR URLS

**Status**: Backend & Dashboard deployed to Vercel ✅
**Remaining**: Supabase SQL + Tracking Injection (5 min)

---

## 🎯 YOUR DEPLOYMENT URLS

### Backend API (LIVE NOW)
```
https://backend-6azf0a434-andrew-c-projects.vercel.app
```
✅ Test it: https://backend-6azf0a434-andrew-c-projects.vercel.app/api/health

### Dashboard (LIVE NOW)
```
https://dashboard-q599mizle-andrew-c-projects.vercel.app
```
✅ Open it: https://dashboard-q599mizle-andrew-c-projects.vercel.app

### Supabase Project
```
https://dqlefeafzvjbcrhqhdps.supabase.co
```

---

## 2️⃣ STEP 1: CREATE SUPABASE TABLES (2 minutes)

### Instructions:
1. Go to your Supabase dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy this entire SQL script below ⬇️
5. Paste into Supabase SQL editor
6. Click **"Run"** (green button)
7. Wait for completion ✅

### SQL SCRIPT (Copy entire thing):

```sql
-- iHandyAndy Analytics Database Schema for Supabase

-- Main events table (stores all tracking events)
CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  page_id VARCHAR(100) NOT NULL,
  page_url TEXT,
  page_title VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_page_url ON events(page_url);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Users table (optional, for tracking unique visitors)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  visit_count INT DEFAULT 1,
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX idx_users_session_id ON users(session_id);
CREATE INDEX idx_users_first_visit ON users(first_visit DESC);

-- Page metrics table (aggregated page view data)
CREATE TABLE IF NOT EXISTS page_metrics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  total_views INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  avg_time_on_page INT DEFAULT 0,
  avg_scroll_depth INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_metrics_page_url ON page_metrics(page_url);
CREATE INDEX idx_page_metrics_updated_at ON page_metrics(updated_at DESC);

-- Button metrics table (aggregated click data)
CREATE TABLE IF NOT EXISTS button_metrics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  button_id VARCHAR(100) NOT NULL,
  button_text VARCHAR(500),
  page_url TEXT,
  click_count INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  ctr DECIMAL(5, 2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_button_metrics_button_id ON button_metrics(button_id);
CREATE INDEX idx_button_metrics_page_url ON button_metrics(page_url);
CREATE INDEX idx_button_metrics_click_count ON button_metrics(click_count DESC);

-- Form metrics table (aggregated form interaction data)
CREATE TABLE IF NOT EXISTS form_metrics (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50),
  page_url TEXT,
  interaction_count INT DEFAULT 0,
  unique_sessions INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_metrics_field_name ON form_metrics(field_name);
CREATE INDEX idx_form_metrics_page_url ON form_metrics(page_url);
CREATE INDEX idx_form_metrics_interaction_count ON form_metrics(interaction_count DESC);

-- Enable row level security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE button_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow inserts from backend" ON events FOR INSERT USING (TRUE);
CREATE POLICY "Allow select for authenticated" ON events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow inserts for users" ON users FOR INSERT USING (TRUE);
CREATE POLICY "Allow select for authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow select page_metrics" ON page_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow select button_metrics" ON button_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow select form_metrics" ON form_metrics FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 3️⃣ STEP 2: INJECT TRACKING SCRIPT (2 minutes)

### Your Tracking Script (with backend URL already set):

Go to: https://raw.githubusercontent.com/andrewtrading04-star/ihandyandy-analytics/main/tracking/tracker.js

**OR** Copy this code:

```javascript
// iHandyAndy Analytics Tracker
// Lightweight vanilla JS - no dependencies
// Inject this into your website via Landingsite.ai code injection

(function() {
  const BACKEND_URL = 'https://backend-6azf0a434-andrew-c-projects.vercel.app'; // Analytics backend
  const SESSION_ID = generateSessionId();
  const PAGE_ID = generatePageId();
  let pageStartTime = Date.now();
  let maxScrollDepth = 0;

  // Generate unique session ID (persists for session)
  function generateSessionId() {
    const stored = localStorage.getItem('analytics_session_id');
    if (stored) return stored;
    const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_session_id', id);
    return id;
  }

  // Generate unique page ID (for this page load)
  function generatePageId() {
    return 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send event to backend
  function sendEvent(eventType, data = {}) {
    const payload = {
      event_type: eventType,
      page_url: window.location.href,
      page_title: document.title,
      session_id: SESSION_ID,
      page_id: PAGE_ID,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      ...data
    };

    // Use sendBeacon for reliability (even if tab closes)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${BACKEND_URL}/api/events`, JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch(`${BACKEND_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Track page view
  function trackPageView() {
    sendEvent('page_view', {
      referrer: document.referrer
    });
  }

  // Track button clicks
  function trackClick(e) {
    const target = e.target.closest('button, a[role="button"], .btn, [data-track-click]');
    if (!target) return;

    sendEvent('button_click', {
      button_text: (target.textContent || '').trim().slice(0, 100),
      button_id: target.id || target.getAttribute('data-button-id') || 'unnamed',
      button_class: target.className || '',
      target_url: target.href || ''
    });
  }

  // Track form interactions
  function trackFormInteraction(e) {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') return;

    sendEvent('form_interaction', {
      field_name: target.name || target.id || 'unnamed',
      field_type: target.type || 'unknown',
      field_id: target.id || '',
      form_id: target.form?.id || '',
      value_length: (target.value || '').length
    });
  }

  // Track scroll depth
  function trackScrollDepth() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight === 0) return;

    const scrolled = window.scrollY;
    const depth = Math.round((scrolled / scrollHeight) * 100);

    if (depth > maxScrollDepth) {
      maxScrollDepth = depth;
      if (depth % 25 === 0) { // Send every 25% increment
        sendEvent('scroll_depth', { depth_percent: depth });
      }
    }
  }

  // Track time on page (send periodically)
  function trackTimeOnPage() {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    sendEvent('time_on_page', { seconds: timeSpent });
  }

  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();

    // Listen for clicks
    document.addEventListener('click', trackClick, true);

    // Listen for form interactions
    document.addEventListener('change', trackFormInteraction, true);
    document.addEventListener('input', trackFormInteraction, true);

    // Track scroll depth
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Send time on page every 30 seconds
    setInterval(trackTimeOnPage, 30000);

    // Send time on page when leaving
    window.addEventListener('beforeunload', trackTimeOnPage);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### How to Inject:
1. Go to **Landingsite.ai**
2. Open your website editor
3. Find **Settings** → **Code Injection** or **Custom Code**
4. Click **"Add Code"** or **"Add to Header"**
5. Paste the entire script above
6. Save and **Publish**

---

## 4️⃣ STEP 3: CONFIGURE DASHBOARD (1 minute)

1. Open: https://dashboard-q599mizle-andrew-c-projects.vercel.app
2. You'll see **Setup Screen**
3. Paste this Backend URL:
   ```
   https://backend-6azf0a434-andrew-c-projects.vercel.app
   ```
4. Click **"Configure"**
5. Dashboard loads! 🎉

---

## ✅ VERIFY EVERYTHING WORKS

### Test 1: Backend Health Check
```
https://backend-6azf0a434-andrew-c-projects.vercel.app/api/health
```
Should show: `{"status":"ok","timestamp":"..."}`

### Test 2: Dashboard
```
https://dashboard-q599mizle-andrew-c-projects.vercel.app
```
Should load and show setup screen

### Test 3: Website Tracking
1. Open your website
2. Press F12 (Developer Tools)
3. Go to **Network** tab
4. Reload page
5. Look for POST requests to `/api/events`
6. You should see blue "fetch" requests

### Test 4: Data in Database
1. Go to Supabase
2. Click **Table Editor**
3. Select **events** table
4. You should see rows with your events

---

## 📋 SUMMARY

| Item | Status | URL |
|------|--------|-----|
| Backend | ✅ LIVE | https://backend-6azf0a434-andrew-c-projects.vercel.app |
| Dashboard | ✅ LIVE | https://dashboard-q599mizle-andrew-c-projects.vercel.app |
| Database | ⏳ Needs SQL | https://dqlefeafzvjbcrhqhdps.supabase.co |
| Tracking | ⏳ Needs injection | Your website |

---

## 🎉 YOU'RE ALMOST DONE!

Just 2 more things:
1. **Run SQL in Supabase** (copy-paste the SQL above)
2. **Inject tracking script** (paste into Landingsite.ai)

Both take 2 minutes each = 4 minutes to LIVE!

---

## 🆘 ISSUES?

**Backend not responding?**
- Go to: https://vercel.com/andrew-c-projects/backend
- Check deployment status

**Dashboard won't load?**
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito/private window

**No data in database after SQL?**
- Check SQL ran without errors in Supabase

**Tracking not working?**
- Check tracking script is in your website (Ctrl+U, search "Analytics Tracker")
- Check backend URL is correct in script

---

## 🔐 SECURITY REMINDER

⚠️ **Your Vercel token is exposed in GitHub/chat**

**Revoke immediately:**
1. Go to: https://vercel.com/account/tokens
2. Find `analytics-deploy` token
3. Click Delete
4. Create new one if needed

**Same for Supabase keys - consider regenerating them after setup**

---

Ready? Start with Step 1 - run the SQL in Supabase now! 🚀
