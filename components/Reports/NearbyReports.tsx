"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { ReportCard } from "./ReportCard";
import type { ReportWithDistance } from "@/lib/types";
import { PROXIMITY_RADIUS_METERS } from "@/lib/constants";

interface NearbyReportsProps {
  reports: ReportWithDistance[];
  onSelectReport: (reportId: string) => void;
  onCreateNew: () => void;
  onVote: (reportId: string, voteType: "up" | "down") => Promise<void>;
}

/**
 * Display nearby reports before creating a new one
 */
export function NearbyReports({
  reports,
  onSelectReport,
  onCreateNew,
  onVote,
}: NearbyReportsProps) {
  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-100 font-medium mb-1">
            Similar reports found nearby
          </p>
          <p className="text-yellow-200/80 text-sm">
            There {reports.length === 1 ? "is" : "are"} {reports.length} existing report
            {reports.length !== 1 ? "s" : ""} within {PROXIMITY_RADIUS_METERS} meters.
            Consider upvoting an existing report instead of creating a duplicate.
          </p>
        </div>
      </div>

      {/* Nearby Reports List */}
      <div className="space-y-3">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ReportCard
              report={report}
              onVote={onVote}
              onClick={() => onSelectReport(report.id)}
              showDistance
            />
          </motion.div>
        ))}
      </div>

      {/* Create New Button */}
      <motion.button
        onClick={onCreateNew}
        className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Create New Report Anyway
      </motion.button>
    </div>
  );
}

