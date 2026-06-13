# Testing Instructions

How to verify everything is working end-to-end.

---

## TEST 1: Backend Health Check

**What this tests**: Backend is deployed and running

**Steps**:
1. Open your backend URL in a browser: `https://your-backend-url.vercel.app/api/health`
2. You should see this response:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-15T10:30:45.123Z"
   }
   ```

**If this fails**:
- Check that your backend URL is correct
- Check Vercel dashboard for deployment errors
- Verify environment variables are set in Vercel

---

## TEST 2: Tracking Script in Browser

**What this tests**: Tracking script is properly injected and working

**Steps**:
1. Open your website (ihandyandy.com)
2. Open Developer Console (F12 or Right-click → Inspect)
3. Go to the **Network** tab
4. Filter by: Type = **Fetch** or **XHR**
5. Perform these actions on your website:
   - Load the page (should see a POST to `/api/events` with `page_view`)
   - Click buttons (should see POST with `button_click`)
   - Scroll down (should see POST with `scroll_depth`)
   - Fill in form fields (should see POST with `form_interaction`)

6. Click on each request and look at the **Payload** tab
7. You should see:
   ```json
   {
     "event_type": "page_view",
     "page_url": "https://ihandyandy.com",
     "session_id": "session_...",
     "timestamp": "2024-01-15T10:30:45.123Z",
     "metadata": {...}
   }
   ```

**If requests aren't showing**:
- Check browser console for JavaScript errors
- Verify tracker.js has the correct backend URL
- Check that tracker.js is actually injected in the page (search for "iHandyAndy Analytics Tracker" in page source)

**If requests show errors (not 200 status)**:
- Check backend URL is correct in tracker.js
- Check CORS settings (should be enabled in server.js)
- Check Supabase tables exist and are accessible

---

## TEST 3: Backend Receiving Events

**What this tests**: Backend is storing events in Supabase

**Steps**:
1. Make sure you've sent some events (Test 1 above)
2. Open Supabase dashboard
3. Go to **Table Editor**
4. Click on the **`events`** table
5. You should see rows with your tracked events:
   - `event_type`: page_view, button_click, form_interaction, scroll_depth
   - `session_id`: Should match what you saw in Test 2
   - `timestamp`: Should be recent
   - `metadata`: Should contain event-specific data

**If no events appear**:
- Check that table `events` exists in Supabase
- Verify Supabase URL and keys are correct in backend
- Check backend logs in Vercel dashboard
- Make sure network requests succeeded in Test 2

---

## TEST 4: Backend API Endpoints

**What this tests**: Backend API is returning the correct data

**Steps**:
1. Open these URLs in your browser (replace with your backend URL):

**Page Views**:
```
https://your-backend-url.vercel.app/api/analytics/page-views
```
Should return:
```json
{
  "total": 5,
  "events": [...],
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Clicks**:
```
https://your-backend-url.vercel.app/api/analytics/clicks
```
Should return:
```json
{
  "total": 3,
  "by_button": {
    "book-now": 2,
    "contact-us": 1
  },
  "events": [...]
}
```

**Form Interactions**:
```
https://your-backend-url.vercel.app/api/analytics/form-interactions
```
Should return:
```json
{
  "total": 2,
  "by_field": {
    "service_type": {"count": 1, "types": {"select": 1}},
    "zip_code": {"count": 1, "types": {"text": 1}}
  },
  "events": [...]
}
```

**Funnel**:
```
https://your-backend-url.vercel.app/api/analytics/funnel
```
Should return:
```json
{
  "funnel": [
    {"step": "Page View", "count": 5, "sessions": 3},
    {"step": "Button Click", "count": 3, "sessions": 2},
    {"step": "Form Interaction", "count": 2, "sessions": 1}
  ],
  "total_sessions": 3
}
```

**Sessions**:
```
https://your-backend-url.vercel.app/api/analytics/sessions
```
Should return:
```json
{
  "total": 3,
  "sessions": [
    {
      "session_id": "session_...",
      "start_time": "2024-01-15T10:30:45.123Z",
      "end_time": "2024-01-15T10:35:22.456Z",
      "event_count": 5,
      "events": [...]
    }
  ]
}
```

**If any API endpoint returns errors**:
- Check that events exist in Supabase (Test 3)
- Check backend logs in Vercel
- Verify Supabase credentials are correct

---

## TEST 5: Dashboard Display

**What this tests**: Dashboard is loading and displaying data

**Steps**:
1. Open your dashboard URL: `https://your-dashboard-url.vercel.app`
2. If you see a **Setup Screen**:
   - Enter your backend URL
   - Click **Configure**
3. You should now see the **Analytics Dashboard** with:
   - **Header**: "📊 Analytics Dashboard"
   - **Date Range Controls**: Let you select date range
   - **4 Metric Cards**: Page Views, Button Clicks, Form Interactions, Scroll Depth
   - **Funnel Analysis**: Shows booking funnel with drop-off percentages
   - **Clicks by Button**: Top clicked buttons
   - **User Sessions**: List of user sessions with details

4. Check each section:
   - **Metrics** should show numbers matching Test 4
   - **Funnel** should show conversion steps
   - **Sessions** should show user activity
   - Numbers should update in real-time as you interact with your website

**If dashboard is blank or showing errors**:
- Check browser console (F12) for errors
- Verify backend URL is correct
- Try refreshing the page
- Check that backend API endpoints are working (Test 4)

---

## TEST 6: End-to-End Flow

**Complete workflow test**:

1. **Start fresh**: Clear your browser's localStorage
   - Open DevTools → Application → Local Storage → Delete all
   - Close and reopen your website

2. **Generate events**:
   - Wait for page to load (should track: page_view)
   - Click a button (should track: button_click)
   - Fill a form field (should track: form_interaction)
   - Scroll down (should track: scroll_depth)
   - Stay on page for 30+ seconds (should track: time_on_page)

3. **Verify in dashboard**:
   - Open your analytics dashboard
   - Should show:
     - 1 page view
     - 1+ clicks
     - 1+ form interactions
     - 1 session with all events listed
     - Funnel showing progression

4. **Test multiple sessions**:
   - Open your website in a private/incognito window
   - Perform different actions
   - Check dashboard shows 2+ sessions
   - Verify each session has different events

**If anything fails**:
- Check all previous tests in order
- Look at browser console for JavaScript errors
- Check Vercel logs for backend errors
- Verify all environment variables are set

---

## PERFORMANCE CHECKS

**Tracking Performance**:
- Events should send within 1-2 seconds
- No more than 1-2 pending network requests at a time
- No lag when clicking or scrolling

**Dashboard Performance**:
- Dashboard should load in under 3 seconds
- Metrics should update within 5 seconds of new events
- Switching date ranges should refresh in under 2 seconds

**If performance is slow**:
- Check Supabase database usage
- Check Vercel backend cold starts
- Consider adding database indexes (already in schema.sql)

---

## MONITORING

**What to check regularly**:
1. Analytics dashboard for traffic trends
2. Funnel drop-off rates (where are users leaving?)
3. Top clicked buttons (what's most interesting?)
4. Scroll depth (are users reading full page?)
5. Form field interactions (which form fields get used?)
6. Session length (how long do users stay?)
7. Referrer sources (where do users come from?)

**When to investigate**:
- Sudden drop in page views
- Low funnel conversion rates
- Form field with no interactions
- Users not scrolling past 50%

---

## QUICK TROUBLESHOOTING CHECKLIST

| Issue | Check |
|-------|-------|
| No events in dashboard | Verify tracking script in page source |
| Events not sending | Check backend URL in tracker.js |
| API errors | Verify Supabase credentials and table existence |
| Dashboard blank | Check browser console for errors |
| Slow performance | Check Vercel logs and Supabase usage |
| Date range not filtering | Verify dates are in ISO format |
| Session not tracking | Check localStorage is enabled in browser |

---

## CONTACT & SUPPORT

If you encounter issues:
1. Check this testing guide
2. Review error messages in browser console (F12)
3. Check Vercel logs: Vercel dashboard → Project → Deployments → View logs
4. Check Supabase logs: Supabase dashboard → Logs
5. Verify all setup steps were completed (see SETUP.md)
