/**
 * IP geolocation API system with fallback support
 * - Primary: ipapi.co (free per unique IP, no API key needed)
 * - Fallback: ipgeolocation.io (free API keys, manually enabled/disabled)
 */

import { 
  MAX_REQUESTS_PER_IP_KEY, 
  IP_KEY_RESET_INTERVAL_MS,
  ENABLE_IPGEOLOCATION_FALLBACK 
} from "./constants";

// ============================================
// TYPES
// ============================================

interface IPApiKey {
  service: "ipapi" | "ipgeolocation";
  key: string;
  requestCount: number;
  lastReset: number;
}

interface IPApiConfig {
  keys: IPApiKey[];
  currentIndex: number;
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_KEY = "ip_api_rotation_state";
const LAST_RESET_KEY = "ip_api_last_reset";

// ============================================
// RATE LIMITING
// ============================================

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests

/**
 * Rate limiting function to prevent too many rapid requests
 */
async function rateLimitRequest(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delay}ms before next IP request`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Load API keys from environment variables
 * ipapi.co is always enabled (primary), ipgeolocation.io is optional fallback
 */
function loadAPIKeysFromEnv(): IPApiKey[] {
  const keys: IPApiKey[] = [];

  // Always add ipapi.co as primary (free per unique IP, no key needed)
  keys.push({
    service: "ipapi",
    key: "free",
    requestCount: 0,
    lastReset: Date.now(),
  });

  // Only load ipgeolocation.io keys if fallback is enabled
  if (ENABLE_IPGEOLOCATION_FALLBACK) {
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`NEXT_PUBLIC_IP_API_IPGEO_${i}`];
      if (key && key.trim() !== "" && key.trim() !== "your_ipgeolocation_api_key") {
        keys.push({
          service: "ipgeolocation",
          key: key.trim(),
          requestCount: 0,
          lastReset: Date.now(),
        });
      }
    }
  }

  return keys;
}

/**
 * Get saved state from localStorage or initialize new state
 */
function getStoredState(): IPApiConfig {
  if (typeof window === "undefined") {
    // Server-side: return fresh config
    return {
      keys: loadAPIKeysFromEnv(),
      currentIndex: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: IPApiConfig = JSON.parse(stored);
      
      // Check if we need to reset counts (24 hours passed)
      const lastReset = localStorage.getItem(LAST_RESET_KEY);
      if (lastReset) {
        const timeSinceReset = Date.now() - parseInt(lastReset);
        if (timeSinceReset >= IP_KEY_RESET_INTERVAL_MS) {
          // Reset all counts
          parsed.keys.forEach((key) => {
            key.requestCount = 0;
            key.lastReset = Date.now();
          });
          localStorage.setItem(LAST_RESET_KEY, Date.now().toString());
        }
      }
      
      // Merge with current env keys (in case keys were added/removed)
      const envKeys = loadAPIKeysFromEnv();
      const mergedKeys = envKeys.map((envKey) => {
        const existingKey = parsed.keys.find(
          (k) => k.service === envKey.service && k.key === envKey.key
        );
        return existingKey || envKey;
      });
      
      return {
        keys: mergedKeys,
        currentIndex: parsed.currentIndex < mergedKeys.length ? parsed.currentIndex : 0,
      };
    }
  } catch (error) {
    console.error("Error loading IP API rotation state:", error);
  }

  // Initialize fresh state
  const config: IPApiConfig = {
    keys: loadAPIKeysFromEnv(),
    currentIndex: 0,
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_RESET_KEY, Date.now().toString());
  }
  
  return config;
}

/**
 * Save state to localStorage
 */
function saveState(config: IPApiConfig): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving IP API rotation state:", error);
  }
}

// ============================================
// ROTATION LOGIC
// ============================================

let cachedConfig: IPApiConfig | null = null;

/**
 * Get the current configuration
 */
function getConfig(): IPApiConfig {
  if (!cachedConfig) {
    cachedConfig = getStoredState();
  }
  return cachedConfig;
}

/**
 * Get the next available API key
 * Strategy: Always try ipapi.co first, fallback to ipgeolocation.io if enabled and ipapi fails
 */
export function getNextIPApiKey(): IPApiKey | null {
  const config = getConfig();
  
  if (config.keys.length === 0) {
    console.warn("No IP API keys configured.");
    return null;
  }

  // Always prefer ipapi.co (index 0) if available
  const ipapiKey = config.keys.find(k => k.service === "ipapi");
  if (ipapiKey && ipapiKey.requestCount < MAX_REQUESTS_PER_IP_KEY) {
    return ipapiKey;
  }

  // If ipapi.co is exhausted and fallback is enabled, use ipgeolocation.io
  if (ENABLE_IPGEOLOCATION_FALLBACK) {
    // Find next available ipgeolocation key
    const ipgeoKeys = config.keys.filter(k => k.service === "ipgeolocation");
    for (const key of ipgeoKeys) {
      if (key.requestCount < MAX_REQUESTS_PER_IP_KEY) {
        return key;
      }
    }
    
    // All ipgeolocation keys exhausted, rotate through them anyway
    if (ipgeoKeys.length > 0) {
      config.currentIndex = (config.currentIndex + 1) % config.keys.length;
      return config.keys[config.currentIndex];
    }
  }

  // No fallback enabled or all keys exhausted - return ipapi.co anyway
  console.warn(
    ENABLE_IPGEOLOCATION_FALLBACK 
      ? "All IP API keys exhausted. Continuing with ipapi.co..."
      : "ipapi.co rate limit may be reached. Enable ENABLE_IPGEOLOCATION_FALLBACK in constants.ts to use backup keys."
  );
  return ipapiKey || config.keys[0];
}

/**
 * Increment request count for a key and rotate if needed
 */
export function incrementKeyUsage(apiKey: IPApiKey): void {
  const config = getConfig();
  
  // Find and increment the key
  const keyIndex = config.keys.findIndex(
    (k) => k.service === apiKey.service && k.key === apiKey.key
  );
  
  if (keyIndex !== -1) {
    config.keys[keyIndex].requestCount++;
    
    // If this key has exceeded the limit, rotate to next
    if (config.keys[keyIndex].requestCount >= MAX_REQUESTS_PER_IP_KEY) {
      config.currentIndex = (keyIndex + 1) % config.keys.length;
      console.log(
        `IP API key ${keyIndex + 1} (${apiKey.service}) reached limit. Rotating to next key.`
      );
    }
    
    saveState(config);
  }
}

/**
 * Get IP using primary service with optional fallback
 * Primary: ipapi.co (always enabled)
 * Fallback: ipgeolocation.io (if ENABLE_IPGEOLOCATION_FALLBACK is true)
 */
export async function getUserIPWithRotation(): Promise<string> {
  // Apply rate limiting
  await rateLimitRequest();
  
  const apiKey = getNextIPApiKey();
  
  if (!apiKey) {
    console.warn("No IP API keys available. Using fallback.");
    return "unknown";
  }

  try {
    let url: string;
    
    if (apiKey.service === "ipapi") {
      // ipapi.co - free per unique IP, no API key needed
      url = `https://ipapi.co/json/`;
    } else {
      // ipgeolocation.io - free tier allows 1000 requests/day per key
      url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey.key}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for rate limit errors from ipapi.co
    if (apiKey.service === "ipapi" && data.error) {
      console.warn("ipapi.co rate limit reached:", data.reason);
      throw new Error("Rate limit exceeded");
    }
    
    // Extract IP from response
    const ip = data.ip;

    // Increment usage count
    incrementKeyUsage(apiKey);

    return ip;
  } catch (error) {
    console.error(`Error fetching IP with ${apiKey.service}:`, error);
    
    // If primary (ipapi.co) failed and fallback is enabled, try ipgeolocation.io
    if (apiKey.service === "ipapi" && ENABLE_IPGEOLOCATION_FALLBACK) {
      console.log("Falling back to ipgeolocation.io...");
      const config = getConfig();
      const ipgeoKey = config.keys.find(k => k.service === "ipgeolocation");
      
      if (ipgeoKey) {
        try {
          const fallbackUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${ipgeoKey.key}`;
          const fallbackResponse = await fetch(fallbackUrl);
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            incrementKeyUsage(ipgeoKey);
            return fallbackData.ip;
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }
    }
    
    return "unknown";
  }
}

/**
 * Get current rotation status (for debugging/monitoring)
 */
export function getRotationStatus(): {
  totalKeys: number;
  currentIndex: number;
  keysStatus: Array<{
    service: string;
    requestCount: number;
    remaining: number;
    isExhausted: boolean;
  }>;
} {
  const config = getConfig();
  
  return {
    totalKeys: config.keys.length,
    currentIndex: config.currentIndex,
    keysStatus: config.keys.map((key) => ({
      service: key.service,
      requestCount: key.requestCount,
      remaining: Math.max(0, MAX_REQUESTS_PER_IP_KEY - key.requestCount),
      isExhausted: key.requestCount >= MAX_REQUESTS_PER_IP_KEY,
    })),
  };
}

/**
 * Manually reset all request counts (admin function)
 */
export function resetAllCounts(): void {
  const config = getConfig();
  config.keys.forEach((key) => {
    key.requestCount = 0;
    key.lastReset = Date.now();
  });
  config.currentIndex = 0;
  saveState(config);
  
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_RESET_KEY, Date.now().toString());
  }
  
  console.log("All IP API request counts have been reset.");
}

/**
 * Manually reset a specific key's count
 */
export function resetKeyCount(service: "ipapi" | "ipgeolocation", keyIndex: number): void {
  const config = getConfig();
  const keys = config.keys.filter((k) => k.service === service);
  
  if (keyIndex >= 0 && keyIndex < keys.length) {
    const key = keys[keyIndex];
    key.requestCount = 0;
    key.lastReset = Date.now();
    saveState(config);
    console.log(`Reset count for ${service} key ${keyIndex + 1}`);
  }
}

