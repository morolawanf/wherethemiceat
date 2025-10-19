/**
 * Application Constants
 * All configurable values for time, distance, and voting mechanics
 */

// ============================================
// PROXIMITY & DISTANCE
// ============================================

/** Radius in meters for showing nearby reports before creating a new one */
export const PROXIMITY_RADIUS_METERS = 50;

/** Default map zoom level */
export const DEFAULT_MAP_ZOOM = 15;

/** Map zoom level when showing user location */
export const USER_LOCATION_ZOOM = 16;

// ============================================
// TIME & VALIDITY
// ============================================

/** Initial validity period for new reports (in minutes) */
export const INITIAL_REPORT_VALIDITY_MINUTES = 60;

/** Time added to report validity for each upvote (in minutes) */
export const UPVOTE_TIME_EXTENSION_MINUTES = 20;

/** Maximum validity cap for any report (in minutes) - 1hr 10min */
export const MAX_VALIDITY_CAP_MINUTES = 70;

// ============================================
// VOTING MECHANICS
// ============================================

/** Number of downvotes required to trigger time reduction */
export const DOWNVOTES_FOR_TIME_REDUCTION = 5;

/** Minutes deducted from validity per batch of downvotes */
export const TIME_REDUCED_PER_DOWNVOTE_BATCH_MINUTES = 2;

// ============================================
// COMMENTS
// ============================================

/** Number of reports needed to auto-delete a comment */
export const COMMENT_AUTO_DELETE_REPORT_THRESHOLD = 15;

/** Maximum comment length in characters */
export const MAX_COMMENT_LENGTH = 500;

/** Number of comments to load per page (infinite scroll) */
export const COMMENTS_PER_PAGE = 20;

// ============================================
// TEMPERATURE THRESHOLDS
// ============================================

/** Temperature levels based on distance from reports */
export const TEMPERATURE_THRESHOLDS = {
  /** Distance in meters where temperature starts to change */
  NORMAL_THRESHOLD: 5000, // 5km - Normal/Warm
  COOL_THRESHOLD: 2000,   // 2km - Cool
  COLD_THRESHOLD: 500,    // 500m - Cold
  FREEZE_THRESHOLD: 100,  // 100m - Freezing
} as const;

/** Temperature level labels */
export const TEMPERATURE_LEVELS = {
  NORMAL: 0,
  COOL: 25,
  COLD: 50,
  FREEZE: 75,
  EXTREME: 100,
} as const;

// ============================================
// MAP STYLING
// ============================================

/** Custom map styles for ice theme */
export const MAP_STYLES = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#1e1e2e" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8b9dc3" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1e1e2e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c4a6e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d2d44" }],
  },
  // Hide all POI (points of interest) labels and icons
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  // Hide business labels
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  // Hide places of worship
  {
    featureType: "poi.place_of_worship",
    stylers: [{ visibility: "off" }],
  },
  // Hide parks
  {
    featureType: "poi.park",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  // Keep road labels but make them subtle
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
];

// ============================================
// REFRESH INTERVALS
// ============================================

/** Interval to clean up expired reports (in milliseconds) */
export const CLEANUP_INTERVAL_MS = 60000; // 1 minute

/** Interval to recalculate proximity/temperature (in milliseconds) */
export const PROXIMITY_UPDATE_INTERVAL_MS = 5000; // 5 seconds

// ============================================
// RATE LIMITING
// ============================================

/** Minimum time between reports from same user (in milliseconds) */
export const REPORT_COOLDOWN_MS = 60000; // 1 minute

/** Minimum time between votes from same user (in milliseconds) */
export const VOTE_COOLDOWN_MS = 1000; // 1 second

/** Minimum time between comments from same user (in milliseconds) */
export const COMMENT_COOLDOWN_MS = 5000; // 5 seconds

// ============================================
// IP GEOLOCATION API
// ============================================

/**
 * IP Geolocation Fallback Hierarchy:
 * 1. ip-api.com (primary, free, no API key needed)
 * 2. ipapi.co (first fallback, free per unique IP)
 * 3. ipgeolocation.io (final fallback, requires API keys, round robin)
 */
export const ENABLE_IPGEOLOCATION_FALLBACK = false;

/** Maximum requests per IP API key before rotating to next one */
export const MAX_REQUESTS_PER_IP_KEY = 900;

/** Reset request counts after this duration (in milliseconds) - 24 hours */
export const IP_KEY_RESET_INTERVAL_MS = 86400000;

// ============================================
// UI CONSTANTS
// ============================================

/** Modal animation duration (in milliseconds) */
export const MODAL_ANIMATION_DURATION = 200;

/** Toast notification duration (in milliseconds) */
export const TOAST_DURATION = 3000;

/** Debounce delay for search/filter inputs (in milliseconds) */
export const SEARCH_DEBOUNCE_MS = 300;

