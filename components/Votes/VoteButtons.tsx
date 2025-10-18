"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  onVote: (voteType: "up" | "down") => Promise<void>;
  userVote?: "up" | "down" | null;
}

/**
 * Vote buttons component with animated counters
 */
export function VoteButtons({
  upvotes,
  downvotes,
  onVote,
  userVote,
}: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: "up" | "down") => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await onVote(voteType);
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Upvote Button */}
      <motion.button
        onClick={() => handleVote("up")}
        disabled={isVoting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
          "backdrop-blur-sm border border-white/20",
          userVote === "up"
            ? "bg-green-500/30 text-green-100"
            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThumbsUp className="w-4 h-4" />
        <NumberFlow
          value={upvotes}
          className="text-sm font-bold"
        />
      </motion.button>

      {/* Downvote Button */}
      <motion.button
        onClick={() => handleVote("down")}
        disabled={isVoting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
          "backdrop-blur-sm border border-white/20",
          userVote === "down"
            ? "bg-red-500/30 text-red-100"
            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThumbsDown className="w-4 h-4" />
        <NumberFlow
          value={downvotes}
          className="text-sm font-bold"
        />
      </motion.button>
    </div>
  );
}

