"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Comment } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: Comment;
  onReport: (commentId: string) => Promise<void>;
  isReported?: boolean;
}

/**
 * Individual comment item
 */
export function CommentItem({ comment, onReport, isReported }: CommentItemProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [showReportCount, setShowReportCount] = useState(false);

  const handleReport = async () => {
    if (isReporting || isReported) return;

    setIsReporting(true);
    try {
      await onReport(comment.id);
    } catch (error) {
      console.error("Report error:", error);
    } finally {
      setIsReporting(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg",
        "bg-white/5 backdrop-blur-sm border border-white/10",
        comment.report_count >= 10 && "border-red-500/50"
      )}
    >
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ice-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {comment.fingerprint_hash.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-white/60">{timeAgo}</p>
          </div>
        </div>

        {/* Report Button */}
        <button
          onClick={handleReport}
          disabled={isReported || isReporting}
          className={cn(
            "p-1.5 rounded hover:bg-white/10 transition-colors",
            isReported && "text-red-400 cursor-not-allowed"
          )}
          onMouseEnter={() => setShowReportCount(true)}
          onMouseLeave={() => setShowReportCount(false)}
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Comment Content */}
      <p className="text-white text-sm leading-relaxed mb-2">
        {comment.content}
      </p>

      {/* Report Count Warning */}
      {comment.report_count >= 10 && (
        <div className="flex items-center gap-2 text-xs text-red-400 mt-2">
          <AlertTriangle className="w-3 h-3" />
          <span>
            This comment has been reported {comment.report_count} times
          </span>
        </div>
      )}

      {/* Show report count on hover */}
      {showReportCount && comment.report_count > 0 && (
        <p className="text-xs text-white/40 mt-1">
          {comment.report_count} report{comment.report_count !== 1 ? "s" : ""}
        </p>
      )}
    </motion.div>
  );
}

