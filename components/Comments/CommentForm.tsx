"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { isValidComment, sanitizeComment } from "@/utils/validation";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

/**
 * Comment submission form
 */
export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = isValidComment(content);
    if (!validation.valid) {
      setError(validation.error || "Invalid comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const sanitized = sanitizeComment(content);
      await onSubmit(sanitized);
      setContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post comment";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = MAX_COMMENT_LENGTH - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className={cn(
            "w-full px-4 py-3 rounded-lg resize-none",
            "bg-white/10 backdrop-blur-sm border border-white/20",
            "text-white placeholder:text-white/40",
            "focus:outline-none focus:ring-2 focus:ring-ice-400/50",
            "transition-all"
          )}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          disabled={isSubmitting}
        />

        {/* Character Counter */}
        <div className="absolute bottom-2 right-2 text-xs text-white/40">
          {remainingChars}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-ice-500 hover:bg-ice-600 text-white font-medium",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? "Posting..." : "Post Comment"}
      </motion.button>
    </form>
  );
}

