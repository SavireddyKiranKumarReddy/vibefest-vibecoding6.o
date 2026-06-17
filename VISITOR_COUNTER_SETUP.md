# Visitor Counter Setup Guide

## Overview
This implements a real-time visitor counter that displays at the bottom-left of the website. It tracks:
- **Total Visits**: Every page load (including repeat visits)
- **Unique Visitors**: Counted once per browser using localStorage

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cybnqzhqmajzgyvbtdvl
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the entire content from `supabase/migrations/20260617_create_visitor_counter.sql`
5. Click **"Run"** to execute the migration
6. You should see "Success. No rows returned" message

### Option 2: Using Supabase CLI

```bash
cd "C:\Users\Savir\OneDrive\Desktop\vibecoding-6.0\vibefest-vibecoding6.o"

# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref cybnqzhqmajzgyvbtdvl

# Push the migration
npx supabase db push
```

## How It Works

### Database Structure

1. **`site_visits` table**: Stores every visit with visitor ID, timestamp, page path, etc.
2. **`site_stats` table**: Stores aggregated real-time counts (total_visits, unique_visitors)
3. **`track_visit()` function**: Records a visit and updates stats atomically
4. **`get_site_stats()` function**: Returns current visitor statistics

### Frontend Component

- **Location**: Bottom-left corner, fixed position
- **Tracking**: Uses localStorage to generate a unique visitor ID
- **Real-time**: Subscribes to Supabase realtime changes on `site_stats` table
- **Animation**: Pulses when new visitors arrive
- **Responsive**: Automatically hides on mobile to avoid conflicts with bottom navigation

### Features

✅ Real-time updates across all connected clients
✅ Smooth animations when counts change
✅ Unique visitor tracking (browser-based)
✅ Total visits counter
✅ Floating design with glassmorphism effect
✅ Hover effects and live indicator dot
✅ Mobile responsive

## Testing

1. **Open the website** - The counter should appear in the bottom-left
2. **Open in incognito** - Counter should increment (new unique visitor)
3. **Refresh page** - Total visits should increment, unique visitors stays same
4. **Open in another browser** - Both should update in real-time

## Verify Database Setup

Run this query in Supabase SQL Editor to check if everything is set up:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('site_visits', 'site_stats');

-- Check current stats
SELECT * FROM site_stats;

-- Check realtime is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('site_visits', 'site_stats');
```

## Manual Stats Reset (Optional)

If you want to reset the counter:

```sql
-- Reset stats to zero
UPDATE site_stats SET total_visits = 0, unique_visitors = 0, last_updated = NOW() WHERE id = 1;

-- Clear all visit records (optional)
DELETE FROM site_visits;
```

## Troubleshooting

### Counter Not Showing Up

1. **Check Supabase connection**: Make sure `.env.local` has valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. **Check browser console**: Look for any errors
3. **Verify database**: Run the verification query above
4. **Check realtime**: Ensure realtime is enabled in Supabase Dashboard → Database → Replication

### Real-time Not Working

1. Go to Supabase Dashboard → Database → Replication
2. Make sure `site_stats` table is enabled for realtime
3. If not, click **"0 tables"** and enable `site_stats`

### Counter Shows 0

1. Open browser console and check for errors
2. Verify the `track_visit()` function is being called
3. Check SQL Editor and run: `SELECT * FROM site_stats;`
4. If stats table is empty, the migration might not have run correctly

## Customization

### Change Position

Edit `src/components/VisitorCounter.tsx`:

```tsx
// Current: bottom-left
className="fixed bottom-6 left-6 z-40"

// Top-left
className="fixed top-20 left-6 z-40"

// Bottom-right
className="fixed bottom-6 right-6 z-40"

// Top-right
className="fixed top-20 right-6 z-40"
```

### Change Colors

```tsx
// Change from saffron to blue
text-saffron -> text-blue-500
from-saffron/20 -> from-blue-500/20
```

### Hide on Mobile

Add this to the main div in `VisitorCounter.tsx`:

```tsx
className="hidden md:block fixed bottom-6 left-6 z-40"
```

## Performance Notes

- Visitor ID is stored in localStorage (no cookies)
- Database uses indexed queries for fast lookups
- Real-time subscriptions are lightweight
- Stats table has only 1 row (always) for fast updates

## Security

- Row Level Security (RLS) is enabled
- Anonymous users can only insert visits and read stats
- Only service role can delete or update
- No sensitive data is stored

---

**Setup Complete!** The visitor counter should now be live on your website 🎉
