"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Red, shaking alert that appears when ICE agents are extremely close
 * Shows when temperature level is "extreme" (within 100m of a report)
 */
export function ExtremeAlert() {
  const temperature = useAppStore((state) => state.temperature);
  const isExtreme = temperature.level === "extreme" || temperature.level === "freeze";

  if (!isExtreme) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 border-b-2 border-red-500 shadow-2xl"
      >
        <div className="relative overflow-hidden">
          {/* Animated background pattern */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          
          {/* Main content */}
          <div className="relative px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-center gap-3">
              {/* Shaking warning icon */}
              <motion.div
                animate={{
                  x: [-2, 2, -2, 2, -2, 2, 0],
                  rotate: [-1, 1, -1, 1, -1, 1, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex-shrink-0"
              >
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* Shaking text */}
              <motion.div
                animate={{
                  x: [-1, 1, -1, 1, -1, 1, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-center"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  ICE AGENTS ARE EXTREMELY CLOSE!
                </h2>
                <p className="text-sm sm:text-base text-red-100 mt-1">
                  Within {temperature.nearestDistance ? Math.round(temperature.nearestDistance) : 0}m of reported location
                </p>
              </motion.div>
            </div>

            {/* Pulsing border effect */}
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 border-2 border-red-400 rounded-lg"
            />
          </div>

          {/* Animated warning stripes */}
          <motion.div
            animate={{
              x: [0, 20, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
