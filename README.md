# Where them ICE at? 🧊 🧊

An anonymous, real-time ICE agent location reporting platform built with Next.js 14, TypeScript, Supabase, and Google Maps.

## Features

- 🗺️ **Real-time Location Reporting**: Anonymous reporting of ICE agent locations with live map integration
- 📍 **Proximity Detection**: Automatically shows reports within 50 meters before creating duplicates
- 🌡️ **Temperature-based UI**: UI gets progressively "colder" (more icy/blue) as you approach reported locations
- 🔄 **Real-time Updates**: Live data synchronization using Supabase real-time subscriptions
- 👍 **Community Validation**: Upvote/downvote system with automatic validity extension
- 💬 **Comments System**: Infinite scroll comments with reporting functionality
- 🎨 **Glassmorphism Design**: Beautiful frosted glass effects that intensify with proximity
- 🔒 **Fully Anonymous**: No user accounts, data tracked via hashed IP + browser fingerprint only
- 📱 **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Maps**: Google Maps JavaScript API
- **State Management**: Zustand
- **Animations**: Framer Motion, Number Flow
- **Fingerprinting**: FingerprintJS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Maps API key

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd ice-location-reporter
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Run the database migration:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run it in the SQL Editor

This will create:
- Tables for reports, votes, comments, and comment reports
- PostGIS extension for geospatial queries
- Functions for proximity searches and automatic cleanup
- Row Level Security policies for anonymous access

### 4. Set Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API (optional)
4. Create API credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Restrict the API key:
     - Application restrictions: HTTP referrers
     - Add your domain (e.g., `localhost:3000` for development)
     - API restrictions: Select "Maps JavaScript API"

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`bash
cp env.example .env.local
\`\`\`

Edit `.env.local` and add your credentials:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
\`\`\`

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
ice-location-reporter/
├── app/
│   ├── api/              # API routes
│   │   ├── reports/      # Report creation and retrieval
│   │   ├── votes/        # Voting system
│   │   └── comments/     # Comments system
│   ├── layout.tsx        # Root layout with SEO
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── components/
│   ├── Animations/       # Animated components (PixelBlast, etc.)
│   ├── Comments/         # Comment components
│   ├── Map/              # Google Maps integration
│   ├── Reports/          # Report cards and modals
│   ├── UI/               # Reusable UI components
│   ├── Votes/            # Voting buttons
│   └── Header.tsx        # Main header
├── hooks/
│   ├── useGeolocation.ts         # Location tracking
│   ├── useRealtimeReports.ts     # Supabase real-time
│   └── useProximityCalculator.ts # Temperature calculation
├── lib/
│   ├── constants.ts      # All configurable values
│   ├── types.ts          # TypeScript definitions
│   ├── supabase.ts       # Supabase client
│   ├── fingerprint.ts    # User identification
│   ├── geolocation.ts    # Location utilities
│   ├── temperature.ts    # Temperature calculations
│   └── utils.ts          # Helper functions
├── store/
│   └── useAppStore.ts    # Zustand state management
├── utils/
│   ├── validation.ts     # Input validation
│   └── time.ts           # Time/validity calculations
└── supabase/
    └── migrations/       # Database schema
\`\`\`

## Configuration

All timing, distance, and voting mechanics can be customized in `lib/constants.ts`:

- `PROXIMITY_RADIUS_METERS`: Distance for nearby report detection (default: 50m)
- `INITIAL_REPORT_VALIDITY_MINUTES`: Initial report lifetime (default: 60 min)
- `UPVOTE_TIME_EXTENSION_MINUTES`: Time added per upvote (default: 20 min)
- `MAX_VALIDITY_CAP_MINUTES`: Maximum report lifetime (default: 70 min)
- `DOWNVOTES_FOR_TIME_REDUCTION`: Downvotes needed to reduce time (default: 5)
- `COMMENT_AUTO_DELETE_REPORT_THRESHOLD`: Reports to auto-delete comment (default: 15)

## How It Works

### Reporting Flow

1. User clicks "Report ICE Agent Location"
2. System checks for reports within 50 meters
3. If nearby reports exist, user is prompted to upvote instead
4. Otherwise, a new report is created with 60-minute validity

### Voting System

- **Upvotes**: Extend report validity by 20 minutes (max 70 min total)
- **Downvotes**: Every 5 downvotes removes 2 minutes from validity
- Each user (IP + fingerprint) can vote once per report
- Clicking the same vote again removes it (undo)

### Temperature System

The UI dynamically changes based on distance to nearest report:

- **5km+**: Normal (dark purple/blue)
- **2km-5km**: Cool (blue tones)
- **500m-2km**: Cold (icy blue)
- **100m-500m**: Freeze (bright ice blue)
- **<100m**: Extreme (maximum ice effect)

Effects include:
- Background gradient shifts
- Glassmorphism intensity increases
- UI elements get more "frosty"

### Privacy

- No user accounts or personal data stored
- IP addresses and fingerprints are hashed (SHA-256) before storage
- Geolocation never saved, only used for report creation
- All data is anonymous and ephemeral

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Deploy to Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Next.js 14:

- Netlify
- AWS Amplify
- Railway
- Render

Make sure to:
- Set all environment variables
- Configure the build command: `npm run build`
- Configure the start command: `npm start`

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is provided as-is for community use. Please use responsibly and in accordance with local laws.

## Support

For issues and questions, please open a GitHub issue.

---

**Remember**: This tool is meant to help communities stay informed and safe. Use it responsibly and ethically.
