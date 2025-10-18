"use client";

import { useAppStore } from "@/store/useAppStore";
import { GlassCard } from "../UI/GlassCard";
import { MapIcon, Clock, ThumbsUp, ThumbsDown, MessageCircle, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import NumberFlow from "@number-flow/react";
import { calculateDistance } from "@/lib/geolocation";

interface ActiveReportsListProps {
  onReportClick?: (report: any) => void;
  onNavigateToReport?: (report: any) => void;
}

/**
 * List of all active reports with real-time updates
 */
export function ActiveReportsList({ onReportClick, onNavigateToReport }: ActiveReportsListProps) {
  const reports = useAppStore((state) => state.reports);
  const location = useAppStore((state) => state.location);

  if (reports.length === 0) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <MapIcon className="w-5 h-5 text-ice-400" />
          <h3 className="font-semibold text-white">Active Reports</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl font-bold text-white mb-2">
            <NumberFlow value={0} />
          </div>
          <div className="text-sm text-gray-400">
            No active reports
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <MapIcon className="w-5 h-5 text-ice-400" />
        <h3 className="font-semibold text-white">Active Reports</h3>
        <div className="ml-auto px-2 py-1 rounded-full bg-ice-500/20 text-ice-400 text-xs font-medium">
          <NumberFlow value={reports.length} />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {reports.map((report, index) => {
          // Calculate distance from user to report
          const distance = location ? calculateDistance(
            location.latitude,
            location.longitude,
            report.latitude,
            report.longitude
          ) : null;
          
          return (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ice-400/30 transition-all cursor-pointer group"
            onClick={() => {
              if (onNavigateToReport) {
                onNavigateToReport(report);
              } else if (onReportClick) {
                onReportClick(report);
              }
            }}
          >
            {/* Report Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ice-400 animate-pulse" />
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">
                  ID: {report.id.slice(0, 8)}...
                </div>
                <div className="text-ice-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MapIcon className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Coordinates and Distance */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-300">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </div>
              {distance !== null && (
                <div className="flex items-center gap-1 text-ice-400">
                  <Navigation className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    <NumberFlow value={Math.round(distance / 1000)} />km
                  </span>
                </div>
              )}
            </div>

            {/* Vote Counts */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <ThumbsUp className="w-3 h-3" />
                <NumberFlow value={report.upvote_count || 0} />
              </div>
              <div className="flex items-center gap-1 text-red-400">
                <ThumbsDown className="w-3 h-3" />
                <NumberFlow value={report.downvote_count || 0} />
              </div>
              {/* <div className="flex items-center gap-1 text-ice-400">
                <MessageCircle className="w-3 h-3" />
                <NumberFlow value={report.comment_count || 0} />
              </div> */}
            </div>

            {/* Validity Status */}
            <div className="mt-2 flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                Expires {formatDistanceToNow(new Date(report.validity_expires_at), { addSuffix: true })}
              </span>
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-500 text-center">
          Click any report to navigate to location on map
        </div>
      </div>
    </GlassCard>
  );
}
