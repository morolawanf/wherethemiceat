"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Report } from "@/lib/types";
import { motion } from "framer-motion";

interface RadarPoint {
  id: string;
  distance: number;
  bearing: number;
  report: Report;
  x: number;
  y: number;
}

/**
 * Radar visualization component showing reports within 10-mile radius
 */
export function RadarVisualization() {
  const { location, reports } = useAppStore();
  const [radarPoints, setRadarPoints] = useState<RadarPoint[]>([]);
  const [, setIsScanning] = useState(false);
  const scanLineRef = useRef<HTMLDivElement>(null);

  // Convert kilometers to meters (10 km = 10000 meters)
  const RADAR_RADIUS_KM = 10;
  const RADAR_RADIUS_METERS = RADAR_RADIUS_KM * 1000;

  // Calculate radar points from reports
  useEffect(() => {
    if (!location || reports.length === 0) {
      setRadarPoints([]);
      return;
    }

    const points: RadarPoint[] = [];
    
    reports.forEach((report) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        report.latitude,
        report.longitude
      );

      // Only include reports within 10 kilometers
      if (distance <= RADAR_RADIUS_METERS) {
        const bearing = calculateBearing(
          location.latitude,
          location.longitude,
          report.latitude,
          report.longitude
        );

        // Convert to radar coordinates (0-1 range)
        const radarDistance = distance / RADAR_RADIUS_METERS;
        const radarBearing = (bearing + 90) % 360; // Adjust for radar orientation

        const x = 0.5 + (radarDistance * Math.cos((radarBearing * Math.PI) / 180)) * 0.4;
        const y = 0.5 + (radarDistance * Math.sin((radarBearing * Math.PI) / 180)) * 0.4;

        points.push({
          id: report.id,
          distance,
          bearing,
          report,
          x: Math.max(0.1, Math.min(0.9, x)),
          y: Math.max(0.1, Math.min(0.9, y)),
        });
      }
    });

    setRadarPoints(points);
  }, [location, reports, RADAR_RADIUS_METERS]);

  // Scanning animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate distance between two points in meters
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate bearing between two points
  function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }

  if (!location) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ice-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Waiting for location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black/20 rounded-2xl overflow-hidden">
      {/* Square aspect ratio container */}
      <div className="relative w-full h-full" style={{ aspectRatio: '1 / 1' }}>
        {/* Radar Background */}
        <div className="absolute inset-0 bg-gradient-radial from-ice-500/10 via-transparent to-transparent" />
        
        {/* Radar Grid */}
        <div className="absolute inset-0">
        {/* Concentric circles - 1km steps from 1km to 10km */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((km, index) => {
          const radius = km / 10; // Convert km to radius (1km = 0.1, 10km = 1.0)
          return (
            <div
              key={index}
              className="absolute border border-ice-400/15 rounded-full"
              style={{
                left: `${50 - radius * 40}%`,
                top: `${50 - radius * 40}%`,
                width: `${radius * 80}%`,
                height: `${radius * 80}%`,
              }}
            />
          );
        })}
        
        {/* Crosshairs */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 w-px h-full bg-ice-400/15 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-ice-400/15 transform -translate-y-1/2" />
        </div>
      </div>

        {/* Distance Labels - Every 1km from 1km to 10km */}
        <div className="absolute inset-0 pointer-events-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((km) => {
            const radius = km / 10; // Convert km to radius
            return (
              <div
                key={km}
                className="absolute text-ice-400/5 text-xs font-mono"
                style={{
                  left: `${50 - radius * 40}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {km}km
              </div>
            );
          })}
        </div>

        {/* Scanning Line */}
        <motion.div
          ref={scanLineRef}
          className="absolute w-px h-1/2 bg-gradient-to-b from-ice-400/80 to-transparent"
          style={{ 
            left: "50%", 
            top: "50%",
            transform: "translate(-50%, 50%)",
            transformOrigin: "center top"
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 5,
            ease: "linear",
            repeat: Infinity
          }}
        />

        {/* Radar Points */}
        {radarPoints.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute w-2 h-2 bg-ice-400 rounded-full shadow-lg shadow-ice-400/50 cursor-pointer"
            style={{
              left: `${point.x * 100}%`,
              top: `${point.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.3 }}
            title={`Report ${point.id.slice(0, 8)} - ${(point.distance / 1000).toFixed(1)} km away`}
          >
            {/* Pulsing effect */}
            <motion.div
              className="absolute inset-0 bg-ice-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          </motion.div>
        ))}

        {/* Center Point */}
        <div className="absolute w-2 h-2 bg-white rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />

        {/* Reports List */}
        {radarPoints.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
            <div className="text-sm font-semibold text-ice-400 mb-2">Nearby Reports</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {radarPoints
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 5)
                .map((point) => (
                  <div key={point.id} className="text-xs flex justify-between">
                    <span className="truncate">{point.id.slice(0, 8)}...</span>
                    <span className="text-ice-400">
                      {(point.distance / 1000).toFixed(1)}km
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
