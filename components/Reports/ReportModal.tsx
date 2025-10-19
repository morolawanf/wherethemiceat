"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { GlassCard } from "../UI/GlassCard";
import { VoteButtons } from "./VoteButtons";
import { useState } from "react";
import type { Report } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useAppStore } from "@/store/useAppStore";

function CreateReportForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { location, identity } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      setError("Location not available. Please enable location access.");
      return;
    }

    if (!identity) {
      setError("User identity not initialized. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          action: "create",
          fingerprint_hash: identity.fingerprintHash,
          ip_hash: identity.ipHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create report");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Report Created!</h3>
        <p className="text-gray-400">
          Thank you for helping keep the community safe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Info */}
      <div className="p-6 rounded-xl bg-ice-500/20 border border-ice-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-ice-500/20">
            <MapPin className="w-6 h-6 text-ice-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Report Location
            </h3>
            {location ? (
              <div className="text-sm text-gray-300 space-y-1">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
                <p className="text-ice-400 mt-2">
                  ✓ Using your current location
                </p>
              </div>
            ) : (
              <p className="text-red-400 text-sm">
                Location not available. Please enable location access.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
              <li>Report will be visible to all users in the area</li>
              <li>Report expires after 50 minutes (extendable via upvotes)</li>
              <li>False reports harm community safety</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 rounded-xl bg-white/8 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !location}
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-ice-500 to-ice-600 text-white font-semibold hover:from-ice-600 hover:to-ice-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            "Confirm & Report"
          )}
        </button>
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-gray-300 text-center">
        Your report is anonymous. We only store hashed identifiers to prevent spam.
      </p>
    </form>
  );
}

interface ReportModalProps {
  type: "view-report" | "create-report" | null;
  report?: Report | null;
  onClose: () => void;
  onReportCreated?: () => void;
}

/**
 * Modal for viewing report details and comments
 */
export function ReportModal({ type, report, onClose, onReportCreated }: ReportModalProps) {
  const { reports } = useAppStore();
  
  // Get fresh report data from store
  const currentReport = report ? reports.find(r => r.id === report.id) || report : null;

  if (type === null) return null;

  return (
    <AnimatePresence>
      {type && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {type === "view-report" ? "Report Details" : "Create Report"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[calc(90vh-8rem)] overflow-y-auto custom-scrollbar">
                  {type === "create-report" ? (
                    <CreateReportForm 
                      onSuccess={() => {
                        onClose();
                        if (onReportCreated) onReportCreated();
                      }}
                      onCancel={onClose}
                    />
                        ) : type === "view-report" && currentReport ? (
                    <div className="space-y-6">
                      {/* Report Info */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              Reported {formatDistanceToNow(new Date(currentReport.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Vote Section */}
                        <div className="flex items-center justify-center gap-8 p-6 rounded-xl bg-white/5 border border-white/10">
                          <VoteButtons
                            reportId={currentReport.id}
                            upvoteCount={currentReport.upvote_count || 0}
                            downvoteCount={currentReport.downvote_count || 0}
                            onVoteUpdate={(upvotes, downvotes) => {
                              // Update the report in the store
                              useAppStore.getState().updateReport(currentReport.id, {
                                ...currentReport,
                                upvote_count: upvotes,
                                downvote_count: downvotes,
                              });
                            }}
                          />
                        </div>

                        {/* Validity Info */}
                        <div className="p-4 rounded-xl bg-ice-500/10 border border-ice-500/20">
                          <div className="text-sm text-ice-400">
                            This report expires {formatDistanceToNow(new Date(currentReport.validity_expires_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : null}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
