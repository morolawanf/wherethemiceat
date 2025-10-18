/**
 * TypeScript type definitions for the application
 */

// ============================================
// DATABASE TYPES
// ============================================

export interface Report {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  validity_expires_at: string;
  upvote_count: number;
  downvote_count: number;
}

export interface Vote {
  id: string;
  report_id: string;
  fingerprint_hash: string;
  ip_hash: string;
  vote_type: "up" | "down";
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  content: string;
  fingerprint_hash: string;
  ip_hash: string;
  created_at: string;
  report_count: number;
}

export interface CommentReport {
  id: string;
  comment_id: string;
  fingerprint_hash: string;
  ip_hash: string;
  created_at: string;
}

// ============================================
// COMPUTED TYPES
// ============================================

export interface ReportWithDistance extends Report {
  distance_meters: number;
  probability: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface UserIdentity {
  fingerprint: string;
  ip: string;
  fingerprintHash: string;
  ipHash: string;
}

// ============================================
// UI TYPES
// ============================================

export type TemperatureLevel = "normal" | "cool" | "cold" | "freeze" | "extreme";

export interface TemperatureState {
  level: TemperatureLevel;
  value: number; // 0-100
  nearestDistance: number | null;
}

export interface ModalState {
  isOpen: boolean;
  type: "create-report" | "view-report" | "nearby-reports" | null;
  data?: unknown;
}

// ============================================
// ZUSTAND STORE TYPES
// ============================================

export interface UserState {
  location: Location | null;
  identity: UserIdentity | null;
  isLocationEnabled: boolean;
  setLocation: (location: Location | null) => void;
  setIdentity: (identity: UserIdentity) => void;
  setLocationEnabled: (enabled: boolean) => void;
}

export interface ReportsState {
  reports: Report[];
  selectedReport: Report | null;
  nearbyReports: ReportWithDistance[];
  isLoading: boolean;
  error: string | null;
  setReports: (reports: Report[]) => void;
  refetchReports: () => Promise<void>;
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  removeReport: (id: string) => void;
  setSelectedReport: (report: Report | null) => void;
  setNearbyReports: (reports: ReportWithDistance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface UIState {
  temperature: TemperatureState;
  modal: ModalState;
  isSidebarOpen: boolean;
  setTemperature: (temperature: TemperatureState) => void;
  openModal: (type: ModalState["type"], data?: unknown) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export interface MapState {
  mapInstance: google.maps.Map | null;
  markers: Map<string, google.maps.marker.AdvancedMarkerElement>;
  userMarker: google.maps.marker.AdvancedMarkerElement | null;
  setMapInstance: (map: google.maps.Map | null) => void;
  addMarker: (id: string, marker: google.maps.marker.AdvancedMarkerElement) => void;
  removeMarker: (id: string) => void;
  setUserMarker: (marker: google.maps.marker.AdvancedMarkerElement | null) => void;
  clearMarkers: () => void;
}

export interface AppStore extends UserState, ReportsState, UIState, MapState {}

// ============================================
// API TYPES
// ============================================

export interface CreateReportRequest {
  latitude: number;
  longitude: number;
  fingerprint_hash: string;
  ip_hash: string;
}

export interface CreateReportResponse {
  success: boolean;
  report?: Report;
  error?: string;
}

export interface VoteRequest {
  report_id: string;
  vote_type: "up" | "down";
  fingerprint_hash: string;
  ip_hash: string;
}

export interface VoteResponse {
  success: boolean;
  report?: Report;
  error?: string;
}

export interface CreateCommentRequest {
  report_id: string;
  content: string;
  fingerprint_hash: string;
  ip_hash: string;
}

export interface CreateCommentResponse {
  success: boolean;
  comment?: Comment;
  error?: string;
}

export interface NearbyReportsRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface NearbyReportsResponse {
  success: boolean;
  reports?: ReportWithDistance[];
  error?: string;
}

