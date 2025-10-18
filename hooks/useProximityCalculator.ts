import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { findNearestLocation } from "@/lib/geolocation";
import { createTemperatureState } from "@/lib/temperature";
import { PROXIMITY_UPDATE_INTERVAL_MS } from "@/lib/constants";

/**
 * Hook to calculate proximity to nearest report and update temperature
 */
export function useProximityCalculator() {
  const { location, reports, setTemperature } = useAppStore();

  useEffect(() => {
    if (!location) {
      // No location, set to normal temperature
      setTemperature({
        level: "normal",
        value: 0,
        nearestDistance: null,
      });
      return;
    }

    const calculateProximity = () => {
      if (reports.length === 0) {
        // No reports, set to normal temperature
        setTemperature({
          level: "normal",
          value: 0,
          nearestDistance: null,
        });
        return;
      }

      // Find nearest report
      const nearest = findNearestLocation(
        location,
        reports.map((r) => ({
          id: r.id,
          latitude: r.latitude,
          longitude: r.longitude,
        }))
      );

      if (nearest) {
        // Update temperature based on distance
        const tempState = createTemperatureState(nearest.distance);
        setTemperature(tempState);
      }
    };

    // Calculate immediately
    calculateProximity();

    // Set up interval for periodic updates
    const interval = setInterval(calculateProximity, PROXIMITY_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [location, reports, setTemperature]);
}

