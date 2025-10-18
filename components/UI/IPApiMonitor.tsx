"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, RefreshCw, X, AlertCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { getRotationStatus, resetAllCounts } from "@/lib/ip-rotation";
import { MAX_REQUESTS_PER_IP_KEY, ENABLE_IPGEOLOCATION_FALLBACK } from "@/lib/constants";

/**
 * Developer/Admin component to monitor IP API key rotation status
 * Shows request counts and allows manual resets
 */
export function IPApiMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ReturnType<typeof getRotationStatus> | null>(null);

  useEffect(() => {
    if (isOpen) {
      updateStatus();
    }
  }, [isOpen]);

  const updateStatus = () => {
    setStatus(getRotationStatus());
  };

  const handleResetAll = () => {
    if (confirm("Reset all IP API request counts?")) {
      resetAllCounts();
      updateStatus();
    }
  };

  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_SHOW_IP_MONITOR !== "true") {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 p-3 rounded-full bg-purple-500 text-white shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="IP API Monitor"
      >
        <Activity className="w-5 h-5" />
      </motion.button>

      {/* Monitor Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] overflow-y-auto"
            >
              <GlassCard className="m-4 p-6 min-h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-ice-400" />
                    <h2 className="text-xl font-bold text-white">IP API Monitor</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Status */}
                {status && (
                  <div className="space-y-4">
                    {/* Fallback Status Alert */}
                    <div className={`p-4 rounded-lg border ${
                      ENABLE_IPGEOLOCATION_FALLBACK 
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                          ENABLE_IPGEOLOCATION_FALLBACK ? "text-green-400" : "text-blue-400"
                        }`} />
                        <div>
                          <p className={`font-bold text-sm ${
                            ENABLE_IPGEOLOCATION_FALLBACK ? "text-green-300" : "text-blue-300"
                          }`}>
                            {ENABLE_IPGEOLOCATION_FALLBACK ? "Fallback: ENABLED" : "Fallback: DISABLED"}
                          </p>
                          <p className="text-xs text-white/60 mt-1">
                            {ENABLE_IPGEOLOCATION_FALLBACK 
                              ? "ipgeolocation.io keys will be used if ipapi.co fails"
                              : "Only ipapi.co is used (edit ENABLE_IPGEOLOCATION_FALLBACK in constants.ts to enable)"
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/60 text-sm mb-2">Total Keys Configured</p>
                      <p className="text-2xl font-bold text-white">{status.totalKeys}</p>
                      <p className="text-white/60 text-xs mt-1">
                        Current: Key #{status.currentIndex + 1}
                      </p>
                    </div>

                    {/* Keys Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Keys Status</h3>
                        <button
                          onClick={handleResetAll}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ice-500 hover:bg-ice-600 text-white text-sm transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reset All
                        </button>
                      </div>

                      {status.keysStatus.map((key, index) => {
                        const percentage = (key.requestCount / MAX_REQUESTS_PER_IP_KEY) * 100;
                        const isWarning = percentage >= 80;
                        const isExhausted = key.isExhausted;

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              isExhausted
                                ? "bg-red-500/10 border-red-500/30"
                                : isWarning
                                ? "bg-yellow-500/10 border-yellow-500/30"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    key.service === "ipapi"
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-green-500/20 text-green-300"
                                  }`}
                                >
                                  {key.service}
                                </span>
                                <span className="text-white/60 text-sm">#{index + 1}</span>
                              </div>
                              {isExhausted && (
                                <span className="text-red-400 text-xs font-bold">EXHAUSTED</span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Requests</span>
                                <span className="text-white font-mono">
                                  {key.requestCount} / {MAX_REQUESTS_PER_IP_KEY}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    isExhausted
                                      ? "bg-red-500"
                                      : isWarning
                                      ? "bg-yellow-500"
                                      : "bg-ice-500"
                                  }`}
                                  style={{ width: `${Math.min(100, percentage)}%` }}
                                />
                              </div>

                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">
                                  {key.remaining} remaining
                                </span>
                                <span className="text-white/40">{percentage.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Help Text */}
                    <div className="p-4 rounded-lg bg-ice-500/10 border border-ice-500/30">
                      <p className="text-ice-200 text-xs leading-relaxed">
                        <strong>Primary Service:</strong> ipapi.co is always used first (free per unique IP).
                      </p>
                      <p className="text-ice-200 text-xs mt-2">
                        <strong>Fallback:</strong> {ENABLE_IPGEOLOCATION_FALLBACK ? "Enabled" : "Disabled"}. 
                        Edit <code className="px-1 py-0.5 bg-white/10 rounded">ENABLE_IPGEOLOCATION_FALLBACK</code> in{" "}
                        <code className="px-1 py-0.5 bg-white/10 rounded">lib/constants.ts</code> to change.
                      </p>
                      <p className="text-ice-200 text-xs mt-2">
                        <strong>Counts reset:</strong> Every 24 hours automatically.
                      </p>
                    </div>

                    {/* Refresh Button */}
                    <button
                      onClick={updateStatus}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Status
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

