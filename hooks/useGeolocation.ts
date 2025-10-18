import { useEffect, useState } from "react";
import { getCurrentLocationWithFallback, watchLocation, stopWatchingLocation } from "@/lib/geolocation";
import { useAppStore } from "@/store/useAppStore";
import type { Location } from "@/lib/types";

/**
 * Hook to get and watch user's geolocation
 */
export function useGeolocation(options?: { watch?: boolean; autoRequest?: boolean }) {
  const { watch = true, autoRequest = false } = options || {}; // Don't auto-request by default
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setLocation, setLocationEnabled } = useAppStore();

  useEffect(() => {
    let watchId: number | null = null;

    const requestLocation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const location = await getCurrentLocationWithFallback();
        setLocation(location);
        setLocationEnabled(true);

        // Set up watching if enabled
        if (watch) {
          watchId = watchLocation(
            (newLocation) => {
              setLocation(newLocation);
            },
            (err) => {
              console.error("Geolocation watch error:", err);
              setError(err.message);
            }
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to get location");
        setLocationEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (autoRequest) {
      requestLocation();
    }

    return () => {
      if (watchId !== null) {
        stopWatchingLocation(watchId);
      }
    };
  }, [watch, autoRequest, setLocation, setLocationEnabled]);

  return {
    isLoading,
    error,
  };
}

