import { MAX_COMMENT_LENGTH } from "@/lib/constants";

/**
 * Validate latitude value
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === "number" && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude value
 */
export function isValidLongitude(lng: number): boolean {
  return typeof lng === "number" && lng >= -180 && lng <= 180;
}

/**
 * Validate location coordinates
 */
export function isValidLocation(lat: number, lng: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Validate comment content
 */
export function isValidComment(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content || typeof content !== "string") {
    return { valid: false, error: "Comment cannot be empty" };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Comment cannot be empty" };
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      error: `Comment must be less than ${MAX_COMMENT_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize comment content (basic XSS prevention)
 */
export function sanitizeComment(content: string): string {
  return content
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate vote type
 */
export function isValidVoteType(type: string): type is "up" | "down" {
  return type === "up" || type === "down";
}

/**
 * Validate fingerprint hash (SHA-256 hex string)
 */
export function isValidHash(hash: string): boolean {
  return typeof hash === "string" && /^[a-f0-9]{64}$/i.test(hash);
}

