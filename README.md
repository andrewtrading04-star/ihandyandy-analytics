# iHandyAndy Analytics System

Complete analytics platform for tracking TV mounting service website performance and user behavior.

## What's Included

- **Tracking Script** - Lightweight vanilla JS, no dependencies. Inject into Landingsite.ai
- **Backend API** - Node.js + Express. Receives events, stores in Supabase
- **React Dashboard** - Admin panel with real-time metrics and funnel analysis
- **Database Schema** - Supabase tables ready to set up

## Quick Start

1. **Set up Supabase** → Create tables (see SETUP.md)
2. **Deploy Backend** → Push to Vercel (see SETUP.md)
3. **Deploy Dashboard** → Push to Vercel (see SETUP.md)
4. **Inject Tracking Script** → Add to Landingsite.ai code injection (see SETUP.md)

## Files

```
backend/          → Express API server
dashboard/        → React admin dashboard
tracking/         → Vanilla JS tracking script
database/         → Supabase SQL schema
SETUP.md          → Step-by-step setup instructions
TESTING.md        → How to verify everything works
```

## Tracks

- Page views
- Button clicks
- Form interactions (service selection, zip code entry)
- Scroll depth
- Time on page
- User sessions

## Stack

- **Frontend**: Vanilla JS (tracking), React + Vite (dashboard)
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (free tier)
