"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { GlassCard } from "@/components/UI/GlassCard";
import { ActiveReportsList } from "@/components/Reports/ActiveReportsList";
import { useRealtimeReports } from "@/hooks/useRealtimeReports";
import { MapIcon, RadarIcon, Navigation, ShieldCheck, AlertTriangle, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import NumberFlow from "@number-flow/react";

/**
 * Homepage - Hero landing page with radar preview
 */
export default function HomePage() {
  const router = useRouter();
  const { reports, location, setLocation, setLocationEnabled } = useAppStore();
  const [nearestReport, setNearestReport] = useState<{
    distance: number;
    bearing: number;
  } | null>(null);

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

  // Calculate nearest report
  useEffect(() => {
    if (!location || reports.length === 0) {
      setNearestReport(null);
      return;
    }

    let nearest: { distance: number; bearing: number } | null = null;
    let minDistance = Infinity;

    reports.forEach((report) => {
      const R = 6371e3;
      const φ1 = (location.latitude * Math.PI) / 180;
      const φ2 = (report.latitude * Math.PI) / 180;
      const Δφ = ((report.latitude - location.latitude) * Math.PI) / 180;
      const Δλ = ((report.longitude - location.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x =
        Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { distance, bearing };
      }
    });

    setNearestReport(nearest);
  }, [location, reports]);

  const handleRequestLocation = async () => {
    try {
      const { getCurrentLocation } = await import("@/lib/geolocation");
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
      setLocationEnabled(true);
    } catch (err) {
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

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ice-400 to-ice-600 flex items-center justify-center shadow-lg shadow-ice-500/50">
            <RadarIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            WTIA
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/radar">
            <button className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2">
              <RadarIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Radar</span>
            </button>
          </Link>
          <Link href="/map">
            <button className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center mb-20">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-8xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Where them{" "}
            <span className="bg-gradient-to-r from-ice-400 to-ice-600 bg-clip-text text-transparent">
              ice
            </span>{" "}
            at?🧊
          </motion.h1>
          
          <motion.p
            className="text-base sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Anonymous, real-time reporting of ICE agent locations. Stay informed, stay safe.
            <br />
            <span className="text-ice-400 font-semibold">No accounts. No tracking. No data collection.</span>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {!location ? (
              <button
                onClick={handleRequestLocation}
                className="px-4 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-ice-500 to-ice-600 text-white font-semibold shadow-2xl hover:from-ice-600 hover:to-ice-700 transition-all flex items-center gap-2 sm:gap-3 text-base sm:text-lg"
              >
                <Navigation className="w-5 h-5" />
                <span className="hidden xs:inline">Enable Location & Start</span>
                <span className="inline xs:hidden">Start</span>
              </button>
            ) : (
              <div className="flex gap-3 sm:gap-4">
                <Link href="/radar">
                  <button className="px-4 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-ice-500 to-ice-600 text-white font-semibold shadow-2xl hover:from-ice-600 hover:to-ice-700 transition-all flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <RadarIcon className="w-5 h-5" />
                    <span className="hidden xs:inline">View Radar</span>
                    <span className="inline xs:hidden">Radar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/map">
                  <button className="px-4 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <MapIcon className="w-5 h-5" />
                    <span className="hidden xs:inline">View Map</span>
                    <span className="inline xs:hidden">Map</span>
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-14 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <GlassCard className="p-5 sm:p-6 md:p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ice-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-ice-500/30 transition-colors">
              <ShieldCheck className="w-8 h-8 text-ice-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">100% Anonymous</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              No accounts, no personal data collection. Your privacy is protected with IP + device fingerprint hashing.
            </p>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 md:p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ice-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-ice-500/30 transition-colors">
              <AlertTriangle className="w-8 h-8 text-ice-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Real-time Alerts</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Get instant proximity alerts as you move. The closer you are, the "colder" the interface becomes.
            </p>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 md:p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ice-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-ice-500/30 transition-colors">
              <Users className="w-8 h-8 text-ice-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Community Driven</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Reports are validated by the community through upvotes and downvotes. Help keep everyone safe.
            </p>
          </GlassCard>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-ice-400 mb-2">
              <NumberFlow value={reports.length} />
            </div>
            <div className="text-gray-400">Active Reports</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {location ? "✅" : "❌"}
            </div>
            <div className="text-gray-400">Location Status</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">10km</div>
            <div className="text-gray-400">Radar Range</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">5s</div>
            <div className="text-gray-400">Update Rate</div>
          </GlassCard>
        </motion.div>

        {/* How It Works */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-ice-500 flex items-center justify-center text-white font-bold text-lg mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-white">Report Location</h3>
              <p className="text-gray-400">
                Spot an ICE agent? Report their location anonymously. No account needed.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-ice-500 flex items-center justify-center text-white font-bold text-lg mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-white">Community Validation</h3>
              <p className="text-gray-400">
                Other users can upvote or downvote reports to increase their validity and accuracy.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-ice-500 flex items-center justify-center text-white font-bold text-lg mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-white">Stay Informed</h3>
              <p className="text-gray-400">
                Get real-time proximity alerts and view reports on radar or map view.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Reports Preview */}
        {reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="max-w-6xl mx-auto mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center lg:text-left">
                  Active Reports in Your Area
                </h2>
                <ActiveReportsList
                  onReportClick={(report) => {
                    router.push(`/map?report=${report.id}`);
                  }}
                  onNavigateToReport={(report) => {
                    router.push(`/map?lat=${report.latitude}&lng=${report.longitude}`);
                  }}
                />
              </div>
              <div className="flex items-center justify-center">
                <Link href="/radar">
                  <motion.button
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-ice-500 to-ice-600 text-white font-semibold shadow-2xl hover:from-ice-600 hover:to-ice-700 transition-all flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RadarIcon className="w-5 h-5" />
                    View Full Radar
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

      <div className="max-w-2xl mx-auto mt-12 mb-20 text-center">
        <div className="bg-ice-500/10 rounded-xl p-8 flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Stay safe and keep warm 🧊</h2>
          <p className="text-gray-300">
            Share this site’s link with others to help keep your community informed—and warm—too! 
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              className="px-5 py-2 rounded-lg bg-ice-500/80 text-white font-medium hover:bg-ice-600 transition-all"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const shareData = {
                    title: "Where them ICE at?",
                    text: "Stay safe and keep warm. See and share active ICE agent reports:",
                    url: window.location.origin,
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    alert("Link copied to clipboard!");
                  }
                }
              }}
            >
              Share This Website
            </button>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}