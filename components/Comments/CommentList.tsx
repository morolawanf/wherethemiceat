"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import type { Comment } from "@/lib/types";

interface CommentListProps {
  reportId: string;
  comments: Comment[];
  onLoadMore: () => Promise<void>;
  onAddComment: (content: string) => Promise<void>;
  onReportComment: (commentId: string) => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  reportedComments: Set<string>;
}

/**
 * Comment list with infinite scroll
 */
export function CommentList({
  comments,
  onLoadMore,
  onAddComment,
  onReportComment,
  hasMore,
  isLoading,
  reportedComments,
}: CommentListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <CommentForm onSubmit={onAddComment} />

      {/* Comments List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <CommentItem
                comment={comment}
                onReport={onReportComment}
                isReported={reportedComments.has(comment.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-ice-400 animate-spin" />
          </div>
        )}

        {/* Load More Trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="h-4" />
        )}

        {/* No More Comments */}
        {!hasMore && comments.length > 0 && (
          <p className="text-center text-white/40 text-sm py-4">
            No more comments
          </p>
        )}

        {/* No Comments Yet */}
        {comments.length === 0 && !isLoading && (
          <p className="text-center text-white/40 text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}

