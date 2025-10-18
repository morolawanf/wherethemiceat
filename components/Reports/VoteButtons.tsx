"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

interface VoteButtonsProps {
  reportId: string;
  upvoteCount: number;
  downvoteCount: number;
  onVoteUpdate?: (upvotes: number, downvotes: number) => void;
}

/**
 * Vote buttons component for upvoting and downvoting reports
 */
export function VoteButtons({ reportId, upvoteCount, downvoteCount, onVoteUpdate }: VoteButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const { identity } = useAppStore();

  // Fetch user's current vote on mount
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!identity) return;
      
      try {
        const response = await fetch(`/api/votes?reportId=${reportId}&userIdentityHash=${identity.fingerprintHash}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.vote) {
            setUserVote(data.vote.vote_type === "up" ? "upvote" : "downvote");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user vote:", error);
      }
    };

    fetchUserVote();
  }, [reportId, identity]);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!identity || isLoading) return;

    console.log("Voting with data:", {
      reportId,
      voteType,
      userIdentity: identity,
    });

    setIsLoading(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          voteType,
          userIdentity: identity,
        }),
      });

      const data = await response.json();
      console.log("Vote response:", data);

      if (data.success) {
        // Handle vote removal
        if (data.voteType === "removed") {
          setUserVote(null);
        } else {
          setUserVote(voteType);
        }
        
        if (onVoteUpdate) {
          onVoteUpdate(data.upvoteCount, data.downvoteCount);
        }
      } else {
        console.error("Vote failed:", data.error);
        // Handle error (could show toast notification)
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!identity || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/votes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          userIdentity: identity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserVote(null);
        if (onVoteUpdate) {
          onVoteUpdate(data.upvoteCount, data.downvoteCount);
        }
      } else {
        console.error("Remove vote failed:", data.error);
      }
    } catch (error) {
      console.error("Error removing vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Upvote Button */}
      <motion.button
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          userVote === "upvote"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-white/5 text-gray-400 hover:bg-green-500/10 hover:text-green-400 border border-white/10"
        }`}
        onClick={() => {
          if (userVote === "upvote") {
            handleRemoveVote();
          } else {
            handleVote("upvote");
          }
        }}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm font-medium">{upvoteCount}</span>
      </motion.button>

      {/* Downvote Button */}
      <motion.button
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          userVote === "downvote"
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-white/10"
        }`}
        onClick={() => {
          if (userVote === "downvote") {
            handleRemoveVote();
          } else {
            handleVote("downvote");
          }
        }}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm font-medium">{downvoteCount}</span>
      </motion.button>

      {/* Loading indicator */}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-ice-400 border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
