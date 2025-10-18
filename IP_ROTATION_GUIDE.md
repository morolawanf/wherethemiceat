# IP Geolocation API Guide - Primary + Fallback System

## Overview

This system uses **ipapi.co as the primary service** (free per unique IP) with **optional ipgeolocation.io fallback keys** that you can enable/disable manually in the code.

## Architecture

### Primary Service: ipapi.co
- ✅ **Always used first**
- ✅ **Free per unique IP** (no API key needed)
- ✅ **No account creation required**
- ✅ **1,000 requests per day per IP address**
- ✅ **Perfect for MVP usage**

### Fallback Service: ipgeolocation.io
- 🔄 **Only used when primary fails or rate limits**
- 🔐 **Requires free API keys**
- ⚙️ **Manually enabled/disabled in code**
- 🎯 **1,000 requests per day per API key**
- 💰 **Save these for emergencies**

## Quick Setup

### 1. Primary Service (ipapi.co)

**No setup needed!** 

ipapi.co is automatically used and doesn't require any configuration. It's free based on your users' IP addresses.

### 2. Fallback Service (ipgeolocation.io)

#### Create Accounts (Optional)
1. Go to https://ipgeolocation.io
2. Sign up for free account
3. Get your API key from dashboard
4. Repeat 2-3 times with different emails

#### Configure Environment Variables

Edit your `.env.local` file:

```env
# Fallback keys (only used when enabled)
NEXT_PUBLIC_IP_API_IPGEO_1=abc123xyz789...
NEXT_PUBLIC_IP_API_IPGEO_2=def456uvw012...
NEXT_PUBLIC_IP_API_IPGEO_3=ghi789rst345...
```

#### Enable/Disable Fallback

Edit `lib/constants.ts`:

```typescript
/**
 * Enable/Disable ipgeolocation.io fallback keys
 * Set to false to use only ipapi.co (recommended for MVP)
 * Set to true to enable fallback when ipapi.co fails
 */
export const ENABLE_IPGEOLOCATION_FALLBACK = false; // Change to true to enable
```

## How It Works

### Normal Operation (Fallback Disabled)

```
Every Request:
└─ Try ipapi.co
   ├─ ✅ Success → Return IP
   └─ ❌ Failed → Return "unknown"
```

**Benefits:**
- Zero API key management
- No rate limit tracking needed
- Perfect for MVP/development
- Free forever (based on user IPs)

### With Fallback Enabled

```
Every Request:
└─ Try ipapi.co (Primary)
   ├─ ✅ Success → Return IP
   └─ ❌ Failed/Rate Limited
      └─ Try ipgeolocation.io Key #1
         ├─ ✅ Success → Return IP
         └─ ❌ Failed
            └─ Try ipgeolocation.io Key #2
               └─ etc...
```

**When to Enable:**
- High traffic expected
- Users hitting ipapi.co rate limits
- Production deployment with many requests
- Need guaranteed uptime

## Configuration

### Disable Fallback (Default - Recommended for MVP)

`lib/constants.ts`:
```typescript
export const ENABLE_IPGEOLOCATION_FALLBACK = false;
```

**Pros:**
- No API key management
- No cost tracking
- Simple and reliable
- Great for MVP

**Cons:**
- May fail for users who exceed ipapi.co limits
- No guaranteed uptime

### Enable Fallback (Production/High Traffic)

`lib/constants.ts`:
```typescript
export const ENABLE_IPGEOLOCATION_FALLBACK = true;
```

**Pros:**
- Guaranteed fallback if primary fails
- Better reliability
- Can handle high traffic

**Cons:**
- Need to manage API keys
- Track usage of fallback keys
- More complex monitoring

## Monitoring

### IP API Monitor Panel

The monitor panel shows:

**With Fallback Disabled:**
- Shows only ipapi.co status
- Tracks request count
- Simple view

**With Fallback Enabled:**
- Shows ipapi.co + all ipgeolocation.io keys
- Color-coded status per key
- Request counts and remaining capacity
- Which service is currently active

### Access the Monitor

1. **Development:** Click the Activity icon (bottom-right)
2. **Production:** Set `NEXT_PUBLIC_SHOW_IP_MONITOR=true` in `.env.local`

## Cost Optimization Strategy

### For MVP (Minimal Cost)

```typescript
// lib/constants.ts
export const ENABLE_IPGEOLOCATION_FALLBACK = false;
```

```env
# .env.local - No fallback keys needed!
# ipapi.co is used automatically
```

**Cost: $0/month**
**Capacity: ~1,000 requests/day per unique user IP**

### For Production (Reliability)

```typescript
// lib/constants.ts
export const ENABLE_IPGEOLOCATION_FALLBACK = true;
```

```env
# .env.local
NEXT_PUBLIC_IP_API_IPGEO_1=key1
NEXT_PUBLIC_IP_API_IPGEO_2=key2
NEXT_PUBLIC_IP_API_IPGEO_3=key3
```

**Cost: $0/month (free tier)**
**Capacity: 1,000+ requests/day with fallback**

## Usage Scenarios

### Scenario 1: Small MVP (Recommended)

```typescript
ENABLE_IPGEOLOCATION_FALLBACK = false
```

**Perfect for:**
- Testing and development
- Small user base (<100 users/day)
- MVP validation
- Budget-conscious projects

### Scenario 2: Growing Product

```typescript
ENABLE_IPGEOLOCATION_FALLBACK = true
```

**Perfect for:**
- Production deployment
- Growing user base
- Need reliability
- Can manage API keys

### Scenario 3: High Traffic

```typescript
ENABLE_IPGEOLOCATION_FALLBACK = true
// + 6-10 ipgeolocation.io keys
```

**Perfect for:**
- Large user base
- High daily traffic
- Mission-critical uptime
- Can monitor usage

## Adjust Request Limits

Edit `lib/constants.ts`:

```typescript
/** Maximum requests per IP API key before rotating to next one */
export const MAX_REQUESTS_PER_IP_KEY = 999;
```

Change to:
- `500` - More conservative
- `950` - Leave buffer
- `999` - Maximum (default)

## Troubleshooting

### "ipapi.co rate limit reached"

**With Fallback Disabled:**
- Expected behavior for high traffic
- User will get "unknown" IP
- Consider enabling fallback

**Solution:**
1. Enable fallback: `ENABLE_IPGEOLOCATION_FALLBACK = true`
2. Add ipgeolocation.io keys to `.env.local`
3. Restart server

### "All keys exhausted"

**Problem:** All ipgeolocation.io fallback keys used their quota

**Solutions:**
- Wait for 24-hour reset
- Add more keys to `.env.local`
- Check monitor panel for status

### "Fallback not working"

**Check:**
1. `ENABLE_IPGEOLOCATION_FALLBACK = true` in `lib/constants.ts`
2. Valid API keys in `.env.local`
3. Keys are not placeholder values
4. Server restarted after changes

## Manual Enable/Disable Steps

### To Enable Fallback:

1. **Edit constants file:**
   ```typescript
   // lib/constants.ts
   export const ENABLE_IPGEOLOCATION_FALLBACK = true;
   ```

2. **Add keys to environment:**
   ```env
   # .env.local
   NEXT_PUBLIC_IP_API_IPGEO_1=your_real_key_1
   NEXT_PUBLIC_IP_API_IPGEO_2=your_real_key_2
   NEXT_PUBLIC_IP_API_IPGEO_3=your_real_key_3
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Verify in monitor panel:**
   - Should show ipapi.co + ipgeolocation.io keys
   - All keys should be active

### To Disable Fallback:

1. **Edit constants file:**
   ```typescript
   // lib/constants.ts
   export const ENABLE_IPGEOLOCATION_FALLBACK = false;
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

3. **Verify in monitor panel:**
   - Should show only ipapi.co
   - No ipgeolocation.io keys visible

## Production Checklist

### MVP Launch (Fallback Disabled)
- [x] ipapi.co working (automatic)
- [ ] Monitor panel tested
- [ ] Error handling verified
- [ ] "unknown" IP handling implemented

### Production Launch (Fallback Enabled)
- [ ] 3 ipgeolocation.io accounts created
- [ ] API keys added to `.env.local`
- [ ] `ENABLE_IPGEOLOCATION_FALLBACK = true`
- [ ] Keys tested and working
- [ ] Monitor panel accessible
- [ ] Error handling verified
- [ ] Calendar reminder to check quotas

## Best Practices

1. **Start with fallback disabled** - Simplest for MVP
2. **Monitor your traffic** - Use the monitor panel
3. **Enable fallback when needed** - Based on actual usage
4. **Keep fallback keys secure** - Don't commit to git
5. **Document your decision** - Team should know current config

## Support

Questions? Check:
- Main README.md for general setup
- SETUP_GUIDE.md for detailed instructions
- Monitor panel for real-time status

## Quick Reference

| Configuration | Cost | Complexity | Reliability | Best For |
|--------------|------|------------|-------------|----------|
| Fallback OFF | $0 | Low | Good | MVP, Testing |
| Fallback ON (3 keys) | $0 | Medium | Great | Production |
| Fallback ON (10 keys) | $0 | Medium | Excellent | High Traffic |

---

**Recommended for MVP: Fallback DISABLED**
- Zero configuration needed
- ipapi.co handles everything
- Enable fallback only when you need it! 🚀
