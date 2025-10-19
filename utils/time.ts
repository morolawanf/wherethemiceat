import {
  INITIAL_REPORT_VALIDITY_MINUTES,
  UPVOTE_TIME_EXTENSION_MINUTES,
  MAX_VALIDITY_CAP_MINUTES,
  DOWNVOTES_FOR_TIME_REDUCTION,
  TIME_REDUCED_PER_DOWNVOTE_BATCH_MINUTES,
} from "@/lib/constants";
import { formatDistanceToNow, isPast, differenceInMinutes, addMinutes } from "date-fns";

/**
 * Calculate initial validity expiration time for a new report
 */
export function calculateInitialValidity(): Date {
  return addMinutes(new Date(), INITIAL_REPORT_VALIDITY_MINUTES);
}

/**
 * Calculate new validity time after an upvote
 */
export function calculateValidityAfterUpvote(
  currentExpiry: Date
): Date {
  const now = new Date();
  const newExpiry = addMinutes(currentExpiry, UPVOTE_TIME_EXTENSION_MINUTES);
  
  // Calculate the maximum allowed expiry from now
  const maxExpiry = addMinutes(now, MAX_VALIDITY_CAP_MINUTES);
  
  // Return the earlier of the two dates (respecting the cap)
  return newExpiry > maxExpiry ? maxExpiry : newExpiry;
}

/**
 * Calculate new validity time after downvotes
 */
export function calculateValidityAfterDownvote(
  currentExpiry: Date,
  downvoteCount: number
): Date {
  // Calculate how many complete batches of downvotes
  const batches = Math.floor(downvoteCount / DOWNVOTES_FOR_TIME_REDUCTION);
  const totalMinutesToReduce = batches * TIME_REDUCED_PER_DOWNVOTE_BATCH_MINUTES;
  
  // Subtract minutes from current expiry
  const newExpiry = addMinutes(currentExpiry, -totalMinutesToReduce);
  
  // Don't let it go below current time
  const now = new Date();
  return newExpiry < now ? now : newExpiry;
}

/**
 * Check if a report has expired
 */
export function isReportExpired(expiryDate: Date | string): boolean {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  return isPast(expiry);
}

/**
 * Get time remaining in minutes
 */
export function getTimeRemainingMinutes(expiryDate: Date | string): number {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const minutes = differenceInMinutes(expiry, now);
  return Math.max(0, minutes);
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(expiryDate: Date | string): string {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  
  if (isPast(expiry)) {
    return "Expired";
  }
  
  return formatDistanceToNow(expiry, { addSuffix: true });
}

/**
 * Format time remaining in minutes and seconds
 */
export function formatTimeRemainingDetailed(expiryDate: Date | string): string {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  
  if (isPast(expiry)) {
    return "0:00";
  }
  
  const totalSeconds = Math.floor((expiry.getTime() - now.getTime()) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculate probability percentage based on votes
 */
export function calculateProbability(upvotes: number, downvotes: number): number {
  if (upvotes === 0 && downvotes === 0) {
    return 50; // Neutral
  }
  
  const total = upvotes + downvotes;
  const probability = (upvotes / total) * 100;
  
  return Math.round(probability);
}

/**
 * Get time remaining progress (0-100)
 */
export function getTimeRemainingProgress(expiryDate: Date | string): number {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  
  if (isPast(expiry)) {
    return 0;
  }
  
  const minutesRemaining = getTimeRemainingMinutes(expiry);
  const progress = (minutesRemaining / MAX_VALIDITY_CAP_MINUTES) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

