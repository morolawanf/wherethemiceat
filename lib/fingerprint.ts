import FingerprintJS from "@fingerprintjs/fingerprintjs";

/**
 * Generate a SHA-256 hash of a string
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Get browser fingerprint
 */
export async function getBrowserFingerprint(): Promise<string> {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("Error generating fingerprint:", error);
    // Fallback to a combination of navigator properties
    const fallback = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
    return await hashString(fallback);
  }
}

/**
 * Get user's IP address using round-robin API rotation
 * Rotates through multiple API keys to maximize free tier usage
 */
export async function getUserIP(): Promise<string> {
  // Import dynamically to avoid circular dependencies
  const { getUserIPWithRotation } = await import("./ip-rotation");
  return getUserIPWithRotation();
}

/**
 * Generate hashed fingerprint
 */
export async function getHashedFingerprint(fingerprint: string): Promise<string> {
  return await hashString(fingerprint);
}

/**
 * Generate hashed IP
 */
export async function getHashedIP(ip: string): Promise<string> {
  return await hashString(ip);
}

// Cache for user identity to avoid repeated IP requests
let cachedIdentity: { fingerprint: string; ip: string; fingerprintHash: string; ipHash: string } | null = null;
let lastIdentityFetch = 0;
const IDENTITY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get complete user identity (fingerprint + IP, both raw and hashed)
 * Cached for 5 minutes to avoid excessive IP API calls
 */
export async function getUserIdentity() {
  const now = Date.now();
  
  // Return cached identity if it's still valid
  if (cachedIdentity && (now - lastIdentityFetch) < IDENTITY_CACHE_DURATION) {
    console.log("Using cached user identity");
    return cachedIdentity;
  }

  console.log("Fetching fresh user identity...");
  
  const fingerprint = await getBrowserFingerprint();
  const ip = await getUserIP();
  const fingerprintHash = await getHashedFingerprint(fingerprint);
  const ipHash = await getHashedIP(ip);

  const identity = {
    fingerprint,
    ip,
    fingerprintHash,
    ipHash,
  };

  // Cache the identity
  cachedIdentity = identity;
  lastIdentityFetch = now;

  return identity;
}

/**
 * Clear the cached user identity (useful for testing or when user changes)
 */
export function clearIdentityCache(): void {
  cachedIdentity = null;
  lastIdentityFetch = 0;
  console.log("User identity cache cleared");
}

