"use client";

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { MapPin, Clock } from "lucide-react";
import { GlassCard } from "../UI/GlassCard";
import { VoteButtons } from "../Votes/VoteButtons";
import { formatTimeRemaining, calculateProbability } from "@/utils/time";
import { formatDistance } from "@/lib/geolocation";
import type { ReportWithDistance } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: ReportWithDistance;
  onVote: (reportId: string, voteType: "up" | "down") => Promise<void>;
  onClick?: () => void;
  userVote?: "up" | "down" | null;
  showDistance?: boolean;
}

/**
 * Report card component with glassmorphism
 */
export function ReportCard({
  report,
  onVote,
  onClick,
  userVote,
  showDistance = true,
}: ReportCardProps) {
  const probability = calculateProbability(report.upvote_count, report.downvote_count);
  const timeRemaining = formatTimeRemaining(report.validity_expires_at);

  return (
    <GlassCard
      className="p-4 space-y-4 hover:border-ice-400/40"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="w-5 h-5 text-ice-400" />
          <div>
            <p className="text-sm font-semibold">ICE Agent Report</p>
            {showDistance && (
              <p className="text-xs text-white/60">
                {formatDistance(report.distance_meters)} away
              </p>
            )}
          </div>
        </div>

        {/* Probability Badge */}
        <motion.div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            probability >= 70
              ? "bg-red-500/30 text-red-100"
              : probability >= 50
              ? "bg-yellow-500/30 text-yellow-100"
              : "bg-green-500/30 text-green-100"
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <NumberFlow value={probability} suffix="%" />
        </motion.div>
      </div>

      {/* Time Remaining */}
      <div className="flex items-center gap-2 text-white/70 text-sm">
        <Clock className="w-4 h-4" />
        <span>Expires {timeRemaining}</span>
      </div>

      {/* Voting */}
      <VoteButtons
        upvotes={report.upvote_count}
        downvotes={report.downvote_count}
        onVote={(voteType) => onVote(report.id, voteType)}
        userVote={userVote}
      />

      {/* Location Coordinates (small text) */}
      <p className="text-xs text-white/40 font-mono">
        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
      </p>
    </GlassCard>
  );
}

