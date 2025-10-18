import { create } from "zustand";
import type {
  AppStore,
  Location,
  Report,
  ReportWithDistance,
  TemperatureState,
  UserIdentity,
  ModalState,
} from "@/lib/types";
import { TEMPERATURE_LEVELS } from "@/lib/constants";

/**
 * Centralized Zustand store for the entire application
 * Combines user, reports, UI, and map state without React Context
 */
export const useAppStore = create<AppStore>((set, get) => ({
  // ============================================
  // USER STATE
  // ============================================
  location: null,
  identity: null,
  isLocationEnabled: false,

  setLocation: (location) => set({ location }),
  setIdentity: (identity) => set({ identity }),
  setLocationEnabled: (enabled) => set({ isLocationEnabled: enabled }),

  // ============================================
  // REPORTS STATE
  // ============================================
  reports: [],
  selectedReport: null,
  nearbyReports: [],
  isLoading: false,
  error: null,

  setReports: (reports) => set({ reports }),

  refetchReports: async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      if (data.success && data.reports) {
        set({ reports: data.reports });
      }
    } catch (error) {
      console.error("Failed to refetch reports:", error);
    }
  },

  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, report],
    })),

  updateReport: (id, updates) =>
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === id ? { ...report, ...updates } : report
      ),
      selectedReport:
        state.selectedReport?.id === id
          ? { ...state.selectedReport, ...updates }
          : state.selectedReport,
    })),

  removeReport: (id) =>
    set((state) => ({
      reports: state.reports.filter((report) => report.id !== id),
      selectedReport:
        state.selectedReport?.id === id ? null : state.selectedReport,
    })),

  setSelectedReport: (report) => set({ selectedReport: report }),
  setNearbyReports: (reports) => set({ nearbyReports: reports }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // ============================================
  // UI STATE
  // ============================================
  temperature: {
    level: "normal",
    value: TEMPERATURE_LEVELS.NORMAL,
    nearestDistance: null,
  },
  modal: {
    isOpen: false,
    type: null,
    data: undefined,
  },
  isSidebarOpen: false,

  setTemperature: (temperature) => set({ temperature }),

  openModal: (type, data) =>
    set({
      modal: {
        isOpen: true,
        type,
        data,
      },
    }),

  closeModal: () =>
    set({
      modal: {
        isOpen: false,
        type: null,
        data: undefined,
      },
    }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // ============================================
  // MAP STATE
  // ============================================
  mapInstance: null,
  markers: new Map(),
  userMarker: null,

  setMapInstance: (map) => set({ mapInstance: map }),

  addMarker: (id, marker) =>
    set((state) => {
      const newMarkers = new Map(state.markers);
      newMarkers.set(id, marker);
      return { markers: newMarkers };
    }),

  removeMarker: (id) =>
    set((state) => {
      const marker = state.markers.get(id);
      if (marker) {
        // AdvancedMarkerElement uses .map property instead of .setMap()
        marker.map = null;
      }
      const newMarkers = new Map(state.markers);
      newMarkers.delete(id);
      return { markers: newMarkers };
    }),

  setUserMarker: (marker) => set({ userMarker: marker }),

  clearMarkers: () =>
    set((state) => {
      state.markers.forEach((marker) => {
        // AdvancedMarkerElement uses .map property instead of .setMap()
        marker.map = null;
      });
      return { markers: new Map() };
    }),
}));

// ============================================
// SELECTORS (for optimized component access)
// ============================================

/** Get user location */
export const useUserLocation = () => useAppStore((state) => state.location);

/** Get user identity */
export const useUserIdentity = () => useAppStore((state) => state.identity);

/** Get all reports */
export const useReports = () => useAppStore((state) => state.reports);

/** Get selected report */
export const useSelectedReport = () =>
  useAppStore((state) => state.selectedReport);

/** Get nearby reports */
export const useNearbyReports = () =>
  useAppStore((state) => state.nearbyReports);

/** Get temperature state */
export const useTemperature = () => useAppStore((state) => state.temperature);

/** Get modal state */
export const useModal = () => useAppStore((state) => state.modal);

/** Get map instance */
export const useMapInstance = () => useAppStore((state) => state.mapInstance);

/** Get loading state */
export const useIsLoading = () => useAppStore((state) => state.isLoading);

/** Get error state */
export const useError = () => useAppStore((state) => state.error);

