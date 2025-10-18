import { useEffect, useRef } from "react";
import { getCurrentLocationWithFallback } from "@/lib/geolocation";
import { useAppStore } from "@/store/useAppStore";

/**
 * Hook to continuously refresh user location every 2 seconds
 */
export function useLocationRefresh() {
  const { setLocation, setLocationEnabled, location } = useAppStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refreshLocation = async () => {
      try {
        const newLocation = await getCurrentLocationWithFallback();
        setLocation(newLocation);
        setLocationEnabled(true);
        console.log("Location refreshed:", newLocation);
      } catch (error) {
        console.error("Failed to refresh location:", error);
        // Don't disable location on refresh failure, just log the error
      }
    };

    // Start refreshing every 10 seconds to reduce API calls
    intervalRef.current = setInterval(refreshLocation, 10000);

    // Initial refresh
    refreshLocation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setLocation, setLocationEnabled]);

  return {
    isRefreshing: !!intervalRef.current,
  };
}
