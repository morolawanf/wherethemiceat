"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GoogleMap } from "@/components/Map/GoogleMap";
import { Header } from "@/components/Header";
import { ReportModal } from "@/components/Reports/ReportModal";
import { NearbyReports } from "@/components/Reports/NearbyReports";
import { ActiveReportsList } from "@/components/Reports/ActiveReportsList";
import { AdSpace } from "@/components/UI/AdSpace";
import { GlassCard } from "@/components/UI/GlassCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRealtimeReports } from "@/hooks/useRealtimeReports";
import { useLocationRefresh } from "@/hooks/useLocationRefresh";
import { useProximityCalculator } from "@/hooks/useProximityCalculator";
import { MapIcon, AlertCircle, RadarIcon, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import Link from "next/link";
import { IPApiMonitor } from "@/components/UI/IPApiMonitor";

/**
 * Map Page - Google Maps view with full functionality
 */
export default function MapPage() {
  const {
    location,
    identity,
    setIdentity,
    reports,
    temperature,
    modal,
    openModal,
    closeModal,
    setLocation,
    setLocationEnabled,
    refetchReports,
  } = useAppStore();

  const [nearbyReports, setNearbyReports] = useState<any[]>([]);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Initialize user identity on mount
  useEffect(() => {
    const initIdentity = async () => {
      const { getUserIdentity } = await import("@/lib/fingerprint");
      const identity = await getUserIdentity();
      setIdentity(identity);
    };

    initIdentity();
  }, [setIdentity]);

  // Initialize geolocation (will request on user interaction)
  useGeolocation({ watch: true, autoRequest: false });

  // Initialize real-time reports
  useRealtimeReports();

  // Start continuous location refresh every 2 seconds
  useLocationRefresh();

  // Calculate proximity
  useProximityCalculator();

  // Handle URL parameters for navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    if (lat && lng && (window as any).navigateToMapLocation) {
      // Small delay to ensure map is ready
      setTimeout(() => {
        (window as any).navigateToMapLocation(parseFloat(lat), parseFloat(lng));
      }, 1000);
    }
  }, []);

  // Apply temperature-based styling
  useEffect(() => {
    const root = document.documentElement;
    if (temperature.level === "freeze") {
      root.style.setProperty("--temperature-gradient", "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)");
    } else if (temperature.level === "cold") {
      root.style.setProperty("--temperature-gradient", "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)");
    } else if (temperature.level === "cool") {
      root.style.setProperty("--temperature-gradient", "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)");
    } else {
      root.style.setProperty("--temperature-gradient", "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)");
    }
  }, [temperature]);

  // Handle create report
  const handleCreateReport = async () => {
    // Request location if not already available
    if (!location) {
      try {
        const userLocation = await import("@/lib/geolocation").then(m => m.getCurrentLocationWithFallback());
        setLocation(userLocation);
        setLocationEnabled(true);
      } catch (err) {
        alert("Unable to determine your location. Please check your location settings or try again.");
        return;
      }
    }
    
    if (!identity) {
      alert("User identity not initialized. Please refresh the page.");
      return;
    }

    // For now, just open the create modal directly
    // TODO: Re-enable nearby reports check if needed
    openModal("create-report", null);
  };

  // Handle report created
  const handleReportCreated = async () => {
    setShowNearbyModal(false);
    closeModal();
    // Refetch reports after creating a new one
    await refetchReports();
  };

  // Handle upvote nearby report
  const handleUpvoteNearby = () => {
    setShowNearbyModal(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a1e] via-[#1a1a3e] to-[#0f0f2a]">

      
      {/* Header */}
      <Header />

      {/* Mobile Ad Space - Top */}
      <div className="lg:hidden px-4 py-2">
        <AdSpace size="banner" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] gap-2 lg:gap-4 p-2 lg:p-4">
        {/* Left Sidebar - Ad Space */}
        <div className="w-full lg:w-64 xl:w-64 flex-shrink-0 space-y-4">
          <AdSpace size="sidebar" />
          
          {/* Temperature Indicator */}
          <motion.div
            className={`p-4 rounded-xl backdrop-blur-md border ${
              temperature.level === "freeze" || temperature.level === "extreme"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-white/5 border-white/10"
            }`}
            animate={
              temperature.level === "freeze" || temperature.level === "extreme"
                ? {
                    x: [-1, 1, -1, 1, -1, 1, 0],
                    scale: [1, 1.02, 1, 1.02, 1, 1.02, 1],
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
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className={`w-5 h-5 ${
                temperature.level === "freeze" || temperature.level === "extreme"
                  ? "text-red-400"
                  : "text-ice-400"
              }`} />
              <h3 className="font-semibold text-white">Proximity Alert</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <motion.span
                  className={`font-semibold ${
                    temperature.level === "extreme" ? "text-red-400" :
                    temperature.level === "freeze" ? "text-red-400" :
                    temperature.level === "cold" ? "text-blue-400" :
                    temperature.level === "cool" ? "text-blue-500" :
                    "text-green-400"
                  }`}
                  animate={
                    temperature.level === "freeze" || temperature.level === "extreme"
                      ? {
                          x: [-1, 1, -1, 1, -1, 1, 0],
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
                </motion.span>
              </div>
              {temperature.nearestDistance && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nearest:</span>
                  <span className="text-white font-semibold">
                    <NumberFlow 
                      value={Math.round(temperature.nearestDistance)} 
                      format={{ notation: "compact" }}
                    />m
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Go to My Location */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard 
              className="p-4 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => {
                if (location && (window as any).navigateToMapLocation) {
                  (window as any).navigateToMapLocation(location.latitude, location.longitude);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-ice-400" />
                <span className="text-white font-medium">Go to my location</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Main Map Area */}
        <div className={`flex-1 relative min-h-[400px] sm:min-h-[500px] lg:min-h-[500px] xl:min-h-[600px] ${isMapFullscreen ? 'hidden' : ''}`}>
          <GoogleMap
            onMarkerClick={(report) => openModal("view-report", report)}
            navigateToLocation={(lat, lng) => {
              // Navigation is handled by the GoogleMap component internally
            }}
            isFullscreen={isMapFullscreen}
            onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
          />

          {/* Floating Action Button */}
          <motion.button
            className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 px-4 py-3 lg:px-8 lg:py-4 rounded-full bg-gradient-to-r from-ice-500 to-ice-600 text-white font-semibold shadow-2xl hover:from-ice-600 hover:to-ice-700 transition-all z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateReport}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline">Report ICE Agent Location</span>
              <span className="sm:hidden">Report</span>
            </div>
          </motion.button>
        </div>

        {/* Right Sidebar - Ad Space */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-4">
          
          {/* Active Reports List */}
          <ActiveReportsList 
            onReportClick={(report) => openModal("view-report", report)}
            onNavigateToReport={(report) => {
              // Navigate to the report location on the map
              if ((window as any).navigateToMapLocation) {
                (window as any).navigateToMapLocation(report.latitude, report.longitude);
              }
            }}
          />
                    <AdSpace size="sidebar" />

        </div>
      </div>

      {/* Mobile Ad Space - Bottom */}
      <div className="lg:hidden px-4 py-2">
        <AdSpace size="banner" />
      </div>


      {/* Modals */}
      {modal.isOpen && modal.type && modal.type !== "nearby-reports" && (
        <ReportModal
          type={modal.type as "create-report" | "view-report"}
          report={modal.data as any}
          onClose={closeModal}
          onReportCreated={handleReportCreated}
        />
      )}

      {showNearbyModal && (
        <NearbyReports
          reports={nearbyReports}
          onSelectReport={(reportId) => {
            setShowNearbyModal(false);
            const report = nearbyReports.find(r => r.id === reportId);
            if (report) openModal("view-report", report);
          }}
          onCreateNew={() => {
            setShowNearbyModal(false);
            openModal("create-report", null);
          }}
          onVote={async (reportId, voteType) => {
            // Handle voting logic here
            console.log("Vote:", reportId, voteType);
          }}
        />
      )}

      {/* Fullscreen Map */}
      {isMapFullscreen && (
        <GoogleMap
          onMarkerClick={(report) => openModal("view-report", report)}
          navigateToLocation={(lat, lng) => {
            // Navigation is handled by the GoogleMap component internally
          }}
          isFullscreen={isMapFullscreen}
          onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
        />
      )}

      {/* IP API Monitor (dev mode only) */}
      <IPApiMonitor />
    </div>
  );
}

