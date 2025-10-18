import { PROXIMITY_RADIUS_METERS } from "./constants";
import type { Location } from "./types";

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

/**
 * Check if a location is within proximity radius of another location
 */
export function isWithinProximity(
  location1: Location,
  location2: Location,
  radiusMeters: number = PROXIMITY_RADIUS_METERS
): boolean {
  const distance = calculateDistance(
    location1.latitude,
    location1.longitude,
    location2.latitude,
    location2.longitude
  );
  return distance <= radiusMeters;
}

/**
 * Find the nearest location from a list of locations
 */
export function findNearestLocation(
  userLocation: Location,
  locations: Array<Location & { id: string }>
): { location: Location & { id: string }; distance: number } | null {
  if (locations.length === 0) return null;

  let nearest = locations[0];
  let minDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    nearest.latitude,
    nearest.longitude
  );

  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      locations[i].latitude,
      locations[i].longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = locations[i];
    }
  }

  return { location: nearest, distance: minDistance };
}

/**
 * Get user's current location using Geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false, // Less accurate but faster
        timeout: 30000, // 30 seconds timeout
        maximumAge: 60000, // Allow cached position up to 1 minute old
      }
    );
  });
}

/**
 * Watch user's location for changes
 */
export function watchLocation(
  onLocationChange: (location: Location) => void,
  onError?: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser");
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationChange({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    onError,
    {
      enableHighAccuracy: false, // Less accurate but more reliable
      timeout: 30000, // 30 seconds timeout
      maximumAge: 60000, // Allow cached position up to 1 minute old
    }
  );
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Get user's location with three-tier IP geolocation fallback
 * 1. Browser geolocation (primary)
 * 2. ip-api.com (first IP fallback)
 * 3. ipapi.co (second IP fallback)
 * 4. ipgeolocation.io (final IP fallback with round robin)
 */
export async function getCurrentLocationWithFallback(): Promise<Location> {
  try {
    // Try browser geolocation first
    return await getCurrentLocation();
  } catch (error) {
    console.warn("Browser geolocation failed, trying IP geolocation fallback:", error);
    
    // Check if IP geolocation fallback is enabled
    const { ENABLE_IPGEOLOCATION_FALLBACK } = await import("./constants");
    
    if (ENABLE_IPGEOLOCATION_FALLBACK) {
      try {
        // Import IP geolocation functions
        const { getUserIPWithRotation } = await import("./ip-rotation");
        
        // Get IP address
        const ip = await getUserIPWithRotation();
        
        if (ip === "unknown") {
          throw new Error("IP geolocation failed - no IP address available");
        }
        
        // Try ip-api.com first (primary IP geolocation)
        try {
          console.log("Trying ip-api.com for IP geolocation...");
          const ipApiResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,lat,lon`);
          
          if (ipApiResponse.ok) {
            const ipApiData = await ipApiResponse.json();
            
            if (ipApiData.status === "success" && ipApiData.lat && ipApiData.lon) {
              console.log("Successfully obtained location via ip-api.com");
              return {
                latitude: parseFloat(ipApiData.lat),
                longitude: parseFloat(ipApiData.lon),
              };
            } else {
              throw new Error(`ip-api.com returned error: ${ipApiData.message || 'Unknown error'}`);
            }
          } else {
            throw new Error(`ip-api.com HTTP error: ${ipApiResponse.statusText}`);
          }
        } catch (ipApiError) {
          console.warn("ip-api.com failed, trying ipapi.co fallback:", ipApiError);
          
          // Try ipapi.co as second fallback
          try {
            console.log("Trying ipapi.co for IP geolocation...");
            const ipApiCoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            
            if (ipApiCoResponse.ok) {
              const ipApiCoData = await ipApiCoResponse.json();
              
              if (ipApiCoData.error) {
                throw new Error(`ipapi.co error: ${ipApiCoData.reason}`);
              }
              
              if (ipApiCoData.latitude && ipApiCoData.longitude) {
                console.log("Successfully obtained location via ipapi.co");
                return {
                  latitude: parseFloat(ipApiCoData.latitude),
                  longitude: parseFloat(ipApiCoData.longitude),
                };
              } else {
                throw new Error("ipapi.co returned invalid coordinates");
              }
            } else {
              throw new Error(`ipapi.co HTTP error: ${ipApiCoResponse.statusText}`);
            }
          } catch (ipApiCoError) {
            console.warn("ipapi.co failed, trying ipgeolocation.io final fallback:", ipApiCoError);
            
            // Try ipgeolocation.io as final fallback (round robin)
            try {
              console.log("Trying ipgeolocation.io for IP geolocation...");
              
              // Get the next available ipgeolocation.io key
              const { getNextIPApiKey } = await import("./ip-rotation");
              const apiKey = getNextIPApiKey();
              
              if (!apiKey || apiKey.service !== "ipgeolocation") {
                throw new Error("No available ipgeolocation.io API keys");
              }
              
              const ipGeolocationResponse = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey.key}&ip=${ip}`);
              
              if (ipGeolocationResponse.ok) {
                const ipGeolocationData = await ipGeolocationResponse.json();
                
                if (ipGeolocationData.latitude && ipGeolocationData.longitude) {
                  console.log("Successfully obtained location via ipgeolocation.io");
                  
                  // Increment the key usage
                  const { incrementKeyUsage } = await import("./ip-rotation");
                  incrementKeyUsage(apiKey);
                  
                  return {
                    latitude: parseFloat(ipGeolocationData.latitude),
                    longitude: parseFloat(ipGeolocationData.longitude),
                  };
                } else {
                  throw new Error("ipgeolocation.io returned invalid coordinates");
                }
              } else {
                throw new Error(`ipgeolocation.io HTTP error: ${ipGeolocationResponse.statusText}`);
              }
            } catch (ipGeolocationError) {
              console.error("All IP geolocation services failed:", ipGeolocationError);
              // Re-throw the original geolocation error
              throw error;
            }
          }
        }
      } catch (ipError) {
        console.error("IP geolocation fallback also failed:", ipError);
        // Re-throw the original geolocation error
        throw error;
      }
    } else {
      // No fallback enabled, re-throw original error
      throw error;
    }
  }
}

