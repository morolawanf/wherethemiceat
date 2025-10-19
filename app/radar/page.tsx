"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { GlassCard } from "@/components/UI/GlassCard";
import { ActiveReportsList } from "@/components/Reports/ActiveReportsList";
import { RadarVisualization } from "@/components/Radar/RadarVisualization";
import { AdSpace } from "@/components/UI/AdSpace";
import { useRealtimeReports } from "@/hooks/useRealtimeReports";
import { MapIcon, RadarIcon, RefreshCw, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import NumberFlow from "@number-flow/react";

/**
 * Radar Page - Shows radar visualization of nearby ICE agent reports
 */
export default function RadarPage() {
  const router = useRouter();
  const { reports, location, setLocation, setLocationEnabled, temperature } = useAppStore();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize user identity on mount
  useEffect(() => {
    const initIdentity = async () => {
      const { getUserIdentity } = await import("@/lib/fingerprint");
      const identity = await getUserIdentity();
      useAppStore.getState().setIdentity(identity);
    };
    initIdentity();
  }, []);

  // Initialize real-time reports
  useRealtimeReports();

  // Auto-refresh every 5 seconds (shared with location refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setLastRefresh(new Date());
      
      // Simulate refresh delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get reports within 10 kilometers
  const nearbyReports = reports.filter((report) => {
    if (!location) return false;
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      report.latitude,
      report.longitude
    );
    return distance <= 10000; // 10 kilometers in meters
  });

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

  const handleRequestLocation = async () => {
    try {
      const { getCurrentLocation } = await import("@/lib/geolocation");
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
      setLocationEnabled(true);
    } catch {
      alert("Please enable location access to use this app");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a1e] overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ice-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 lg:gap-3">
          <Link href="/" className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-ice-400 to-ice-600 flex items-center justify-center shadow-lg shadow-ice-500/50">
              <RadarIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-white">
              <span className="hidden sm:inline">Where them ICE at? 🧊</span>
              <span className="sm:hidden">ICE Radar</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Temperature Indicator */}
          <motion.div
            className={`px-4 py-2 rounded-full backdrop-blur-md border hidden md:block ${
              temperature.level === "freeze" || temperature.level === "extreme"
                ? "bg-red-500/20 border-red-500/30"
                : "bg-white/10 border-white/20"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className={`text-sm font-medium ${
                temperature.level === "freeze" || temperature.level === "extreme"
                  ? "text-red-400"
                  : "text-white"
              }`}
              animate={
                temperature.level === "freeze" || temperature.level === "extreme"
                  ? {
                      x: [-2, 2, -2, 2, -2, 2, 0],
                      color: ["#f87171", "#ef4444", "#dc2626", "#ef4444", "#f87171", "#f87171"],
                    }
                  : {}
              }
              transition={
                temperature.level === "freeze" || temperature.level === "extreme"
                  ? {
                      duration: 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : {}
              }
            >
              {temperature.level === "extreme" ? "🚨 EXTREME" :
               temperature.level === "freeze" ? "⚠️ FREEZING" :
               temperature.level === "cold" ? "❄️ COLD" :
               temperature.level === "cool" ? "🌡️ COOL" :
               "✅ NORMAL"}
            </motion.p>
          </motion.div>

          <Link href="/map">
            <button className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Mobile Ad Space - Top */}
      <div className="lg:hidden px-4 py-2">
        <AdSpace size="banner" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pb-20">
        {/* Radar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
          {/* Radar Visualization */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-[600px]"
            >
              {!location ? (
                <GlassCard className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-16 h-16 text-ice-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Location Required
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Enable location access to view radar and nearby reports
                    </p>
                    <button
                      onClick={handleRequestLocation}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-ice-500 to-ice-600 text-white font-semibold hover:from-ice-600 hover:to-ice-700 transition-all"
                    >
                      Enable Location
                    </button>
                  </div>
                </GlassCard>
              ) : (
                <RadarVisualization />
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Refresh Status */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw className={`w-5 h-5 text-ice-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <h3 className="font-semibold text-white">Radar Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-white">
                    {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Range:</span>
                  <span className="text-ice-400">10 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reports:</span>
                  <span className="text-white font-semibold">
                    <NumberFlow value={nearbyReports.length} />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-400">
                    {isRefreshing ? 'Scanning...' : 'Standby'}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Nearby Reports List */}
            <ActiveReportsList
              onReportClick={(report) => {
                router.push(`/map?report=${report.id}`);
              }}
              onNavigateToReport={(report) => {
                router.push(`/map?lat=${report.latitude}&lng=${report.longitude}`);
              }}
            />

            {/* Quick Actions */}
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/map">
                  <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-ice-500 to-ice-600 text-white font-medium hover:from-ice-600 hover:to-ice-700 transition-all flex items-center gap-2">
                    <MapIcon className="w-5 h-5" />
                    View Full Map
                  </button>
                </Link>
                <button
                  onClick={handleRequestLocation}
                  className="mt-2 w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Update Location
                </button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-ice-400 mb-2">
              <NumberFlow value={nearbyReports.length} />
            </div>
            <div className="text-gray-400">Active Reports</div>
            <div className="text-xs text-gray-500 mt-1">Within 10 km</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              <NumberFlow value={reports.length} />
            </div>
            <div className="text-gray-400">Total Reports</div>
            <div className="text-xs text-gray-500 mt-1">All locations</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {location ? "✅" : "❌"}
            </div>
            <div className="text-gray-400">Location Status</div>
            <div className="text-xs text-gray-500 mt-1">
              {location ? "Active" : "Disabled"}
            </div>
          </GlassCard>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              How the Radar Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-ice-500 flex items-center justify-center text-white font-bold text-sm mx-auto md:mx-0">
                  1
                </div>
                <h3 className="font-semibold text-white">Real-time Scanning</h3>
                <p className="text-gray-400 text-sm">
                  The radar scans every 5 seconds for ICE agent reports within a 10-kilometer radius of your location.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-ice-500 flex items-center justify-center text-white font-bold text-sm mx-auto md:mx-0">
                  2
                </div>
                <h3 className="font-semibold text-white">Proximity Alerts</h3>
                <p className="text-gray-400 text-sm">
                  The closer you are to a report, the &quot;colder&quot; the interface becomes with visual temperature indicators.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-ice-500 flex items-center justify-center text-white font-bold text-sm mx-auto md:mx-0">
                  3
                </div>
                <h3 className="font-semibold text-white">Interactive Navigation</h3>
                <p className="text-gray-400 text-sm">
                  Click on any report in the list to navigate to its location on the map view.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Mobile Ad Space - Bottom */}
      <div className="lg:hidden px-4 py-2">
        <AdSpace size="banner" />
      </div>
    </div>
  );
}
