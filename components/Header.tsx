"use client";

import Link from "next/link";
import { RadarIcon, MapIcon } from "lucide-react";

/**
 * Header component with pixel blast background and title
 */
export function Header() {

  return (
    <header className="relative w-full h-20 overflow-hidden bg-gradient-to-b from-[#1e1e2e]/90 to-transparent backdrop-blur-md border-b border-white/10">
      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-between h-full px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-ice-400 to-ice-600 flex items-center justify-center">
            <RadarIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
          </div>
          <span className="text-lg lg:text-2xl font-bold text-white">
            <span className="hidden sm:inline">Where them ICE at? 🧊</span>
            <span className="sm:hidden">ICE Radar</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Temperature Indicator */}
          {/* <motion.div
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
              {getTemperatureDescription(temperature.level)}
            </motion.p>
          </motion.div> */}

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link href="/radar">
              <button className="px-3 py-2 lg:px-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-1 lg:gap-2">
                <RadarIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline text-sm lg:text-base">Radar</span>
              </button>
            </Link>
            <Link href="/map">
              <button className="px-3 py-2 lg:px-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-1 lg:gap-2">
                <MapIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline text-sm lg:text-base">Map</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

