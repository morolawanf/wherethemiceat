# Setup Guide - Where them ICE at? 🧊

## Quick Start Checklist

### 1. Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Google Cloud account created

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Supabase Setup

#### Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and name your project
4. Select a region close to your users
5. Set a secure database password
6. Wait for project to be provisioned (~2 minutes)

#### Get Supabase Credentials
1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy:
   - Project URL (starts with `https://`)
   - `anon` `public` key (under "Project API keys")

#### Run Database Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql` from this project
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Verify success (should see "Success. No rows returned")

#### Verify Setup
Check that these tables were created:
- [ ] `reports`
- [ ] `votes`
- [ ] `comments`
- [ ] `comment_reports`

### 4. Google Maps API Setup

#### Enable Google Maps
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Go to **APIs & Services** > **Library**
4. Search for "Maps JavaScript API"
5. Click it and click "Enable"

#### Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API Key**
3. Copy the API key immediately

#### Restrict API Key (Important for Security)
1. Click on your newly created API key
2. Under **Application restrictions**:
   - Select "HTTP referrers"
   - Add `localhost:3000/*` (for development)
   - Add your production domain when deploying
3. Under **API restrictions**:
   - Select "Restrict key"
   - Check "Maps JavaScript API"
4. Click **Save**

### 5. Environment Variables

Create `.env.local` in the project root:

\`\`\`bash
cp env.example .env.local
\`\`\`

Edit `.env.local` and add your credentials:

\`\`\`env
# From Supabase Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# From Google Cloud Console
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

### 7. Test the Application

1. **Allow Location Access**: Click "Allow" when prompted for location
2. **View Map**: You should see a Google Map with your current location
3. **Create Report**: Click "Report ICE Agent Location"
4. **Vote on Reports**: Click thumbs up/down on any report
5. **Add Comments**: Click a report marker and add a comment

## Troubleshooting

### "Missing Supabase environment variables"
- Verify `.env.local` exists in project root
- Check variables are named exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after adding environment variables

### "Failed to load map"
- Verify Google Maps API key is correct
- Check API key restrictions allow localhost:3000
- Ensure Maps JavaScript API is enabled
- Check browser console for specific error messages

### "Geolocation is not supported"
- Use HTTPS (or localhost which is allowed)
- Check browser permissions for location access
- Try a different browser

### Database Errors
- Verify migration ran successfully
- Check Supabase logs in dashboard under **Logs** > **Postgres Logs**
- Ensure Row Level Security policies were created

### Real-time Updates Not Working
- Check Supabase plan includes real-time (free tier includes it)
- Verify Supabase URL is correct
- Check Network tab for WebSocket connection

## Customization

### Adjust Constants
Edit `lib/constants.ts` to change:
- Proximity radius (default: 50 meters)
- Report validity times
- Voting thresholds
- Comment limits

### Change Theme Colors
Edit `tailwind.config.ts`:
- Ice blue colors
- Gradient presets
- Temperature color scales

### Modify Map Styles
Edit `MAP_STYLES` in `lib/constants.ts`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
6. Click "Deploy"

### Update API Key Restrictions
After deployment, add your Vercel domain to:
- Google Maps API key restrictions
- Supabase Auth Site URL (if using auth later)

## Support

If you encounter issues:
1. Check this guide thoroughly
2. Review the main README.md
3. Check browser console for errors
4. Open a GitHub issue with error details

## Security Checklist

Before going live:
- [ ] Google Maps API key is restricted by HTTP referrer
- [ ] Google Maps API key is restricted to Maps JavaScript API only
- [ ] Production domain added to API key restrictions
- [ ] Supabase Row Level Security policies verified
- [ ] Environment variables never committed to git
- [ ] HTTPS enabled in production
- [ ] Rate limiting considered (future enhancement)

## Next Steps

After successful setup:
1. Test all features thoroughly
2. Customize styling to match your brand
3. Add analytics (optional)
4. Set up monitoring (optional)
5. Configure ad spaces with real ads
6. Share with your community!

---

Congratulations! Your ICE location reporter is now ready to use. 🎉

