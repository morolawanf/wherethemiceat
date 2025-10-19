"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MAP_STYLES, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { Report } from "@/lib/types";
import { renderToString } from "react-dom/server";
import { BsSnow2 } from "react-icons/bs";

interface GoogleMapProps {
  onMarkerClick?: (report: Report) => void;
  navigateToLocation?: (lat: number, lng: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

/**
 * Google Maps component with custom ice theme
 */
export function GoogleMap({ onMarkerClick, navigateToLocation, isFullscreen = false }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setMapInstance,
    mapInstance,
    location,
    reports,
    addMarker,
    removeMarker,
    setUserMarker,
    markers,
  } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (mapInstance) return; // Already initialized
    
    const initMap = () => {
      if (!mapRef.current) return;
      console.log("Initializing map...");

      // Check if Google Maps is already fully loaded
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      
      if (existingScript && typeof google !== 'undefined' && google.maps && google.maps.Map) {
        // Script already loaded and ready
        try {
          console.log("Creating map with center:", location ? { lat: location.latitude, lng: location.longitude } : { lat: 37.7749, lng: -122.4194 });
          const map = new google.maps.Map(mapRef.current, {
            center: location ? { lat: location.latitude, lng: location.longitude } : { lat: 37.7749, lng: -122.4194 },
            zoom: DEFAULT_MAP_ZOOM,
            styles: MAP_STYLES,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'ice-location-map',
          });

          console.log("Map created successfully");
          setMapInstance(map);
          setIsLoading(false);
        } catch (err) {
          console.error("Error initializing map:", err);
          setError("Failed to load map");
          setIsLoading(false);
        }
        return;
      }

      // Load script if not already present
      if (!existingScript) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error("Google Maps API key not found");
          setError("Google Maps API key not configured");
          setIsLoading(false);
          return;
        }
        
        console.log("Loading Google Maps script...");
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=marker&callback=initGoogleMap`;
        script.async = true;
        script.defer = true;
        
        // Create global callback
        (window as unknown as { initGoogleMap?: () => void }).initGoogleMap = () => {
          if (!mapRef.current) return;
          
          try {
            const map = new google.maps.Map(mapRef.current, {
              center: location ? { lat: location.latitude, lng: location.longitude } : { lat: 37.7749, lng: -122.4194 },
              zoom: DEFAULT_MAP_ZOOM,
              styles: MAP_STYLES,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'ice-location-map',
            });

            setMapInstance(map);
            setIsLoading(false);
          } catch (err) {
            console.error("Error initializing map:", err);
            setError("Failed to load map");
            setIsLoading(false);
          }
        };

        script.onerror = () => {
          console.error("Error loading Google Maps script");
          setError("Failed to load map");
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } else {
        // Script exists but not ready yet, wait for it
        let hasInitialized = false;
        const checkReady = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
            clearInterval(checkReady);
            hasInitialized = true;
            if (!mapRef.current) return;
            
            try {
              const map = new google.maps.Map(mapRef.current, {
                center: location ? { lat: location.latitude, lng: location.longitude } : { lat: 37.7749, lng: -122.4194 },
                zoom: DEFAULT_MAP_ZOOM,
                styles: MAP_STYLES,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'ice-location-map',
              });

              setMapInstance(map);
              setIsLoading(false);
            } catch (err) {
              console.error("Error initializing map:", err);
              setError("Failed to load map");
              setIsLoading(false);
            }
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkReady);
          if (!hasInitialized) {
            setError("Map loading timeout");
            setIsLoading(false);
          }
        }, 10000);
      }
    };

    initMap();
  }, [setMapInstance, mapInstance, isLoading, location]);

  // Note: Removed auto-centering behavior to allow map exploration
  // Users can click "Go to my location" button to center on their location

  // Update user location marker
  useEffect(() => {
    if (!mapInstance || !location) return;

    // Remove old user marker if exists
    const currentMarker = useAppStore.getState().userMarker;
    if (currentMarker) {
      currentMarker.map = null;
    }

    // Create custom icon element for user location
    const userIcon = document.createElement('div');
    userIcon.style.width = '20px';
    userIcon.style.height = '20px';
    userIcon.style.borderRadius = '50%';
    userIcon.style.backgroundColor = '#38bdf8';
    userIcon.style.border = '2px solid #ffffff';
    userIcon.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.8)';

    // Create new user marker with AdvancedMarkerElement
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapInstance,
      title: "Your Location",
      content: userIcon,
    });

    setUserMarker(marker);

    // Note: Removed auto-centering to allow map exploration
    // Users can click "Go to my location" button to center on their location
  }, [mapInstance, location, setUserMarker]);

  // Update report markers
  useEffect(() => {
    if (!mapInstance) return;

    console.log("Updating report markers, reports count:", reports.length);

    // Small delay to ensure map is fully rendered
    const timer = setTimeout(() => {
      // Get current marker IDs
      const currentMarkerIds = new Set(markers.keys());
      const reportIds = new Set(reports.map((r) => r.id));

      // Remove markers for reports that no longer exist
      currentMarkerIds.forEach((id) => {
        if (!reportIds.has(id)) {
          removeMarker(id);
        }
      });

      // Add or update markers for reports
      reports.forEach((report) => {
        if (!markers.has(report.id)) {
          console.log("Creating marker for report:", report.id);
        // Calculate time ago
        const createdAt = new Date(report.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const timeAgo = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

        // Create large frost icon marker
        const markerContainer = document.createElement('div');
        markerContainer.className = 'frost-marker-container';
        markerContainer.style.cssText = `
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        // Large frost icon element
        const frostIconSvg = renderToString(<BsSnow2 size={48} color="#38bdf8" />);
        const iconDiv = document.createElement('div');
        iconDiv.innerHTML = frostIconSvg;
        iconDiv.style.cssText = `
          filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 24px rgba(56, 189, 248, 0.4));
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        markerContainer.appendChild(iconDiv);

        // Tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: rgba(10, 10, 30, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 8px;
          padding: 12px;
          min-width: 200px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1000;
        `;
        // Calculate validity time remaining
        const validityExpires = new Date(report.validity_expires_at);
        const currentTime = new Date();
        const validityMs = validityExpires.getTime() - currentTime.getTime();
        const validityMins = Math.max(0, Math.floor(validityMs / 60000));
        const validityHours = Math.floor(validityMins / 60);
        const validityRemaining = validityHours > 0 ? `${validityHours}h ${validityMins % 60}m` : `${validityMins}m`;

        tooltip.innerHTML = `
          <div style="color: white; font-size: 13px; font-family: system-ui; min-width: 280px;">
            <div style="font-weight: 700; margin-bottom: 12px; color: #38bdf8; font-size: 14px;">
              ❄️ ICE Agent Report
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #94a3b8; font-size: 12px;">⏱️ Reported ${timeAgo}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="color: #10b981; font-weight: 600;">👍 ${report.upvote_count || 0}</span>
                <span style="color: #ef4444; font-weight: 600;">👎 ${report.downvote_count || 0}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #fbbf24; font-size: 12px;">⏰ Expires in ${validityRemaining}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #94a3b8; font-size: 11px;">📍 ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</span>
              </div>
              <div style="color: #38bdf8; border-top: 1px solid rgba(56, 189, 248, 0.3); padding-top: 8px; margin-top: 6px; font-size: 12px; font-weight: 500;">
                🖱️ Click for full details
              </div>
            </div>
          </div>
        `;
        markerContainer.appendChild(tooltip);

        // Hover effects
        markerContainer.addEventListener('mouseenter', () => {
          iconDiv.style.transform = 'scale(1.2)';
          iconDiv.style.filter = 'drop-shadow(0 0 20px rgba(56, 189, 248, 1)) drop-shadow(0 0 40px rgba(56, 189, 248, 0.8))';
          tooltip.style.opacity = '1';
        });
        markerContainer.addEventListener('mouseleave', () => {
          iconDiv.style.transform = 'scale(1)';
          iconDiv.style.filter = 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 24px rgba(56, 189, 248, 0.4))';
          tooltip.style.opacity = '0';
        });

        // Create new marker with AdvancedMarkerElement
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: report.latitude, lng: report.longitude },
          map: mapInstance,
          title: `ICE Report (${report.upvote_count} upvotes)`,
          content: markerContainer,
        });

        // Add click listener
        marker.addListener("click", () => {
          if (onMarkerClick) {
            onMarkerClick(report);
          }
        });

        addMarker(report.id, marker);
      }
    });
    }, 100); // Small delay to ensure map is fully rendered

    return () => clearTimeout(timer);
  }, [mapInstance, reports, markers, addMarker, removeMarker, onMarkerClick]);

  // Handle navigation to specific location
  useEffect(() => {
    if (navigateToLocation && mapInstance) {
      const handleNavigate = (lat: number, lng: number) => {
        mapInstance.panTo({ lat, lng });
        mapInstance.setZoom(18); // Zoom in close to the location
      };
      
      // Store the navigation function globally so it can be called from parent
      (window as unknown as { navigateToMapLocation?: (lat: number, lng: number) => void }).navigateToMapLocation = handleNavigate;
    }
  }, [mapInstance, navigateToLocation]);

  // Auto-navigate to user's location only once on initial load
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);
  
  useEffect(() => {
    if (mapInstance && location && !isLoading && !hasAutoNavigated) {
      // Small delay to ensure map is fully rendered
      const timer = setTimeout(() => {
        console.log("Auto-navigating to user location on initial load:", location);
        mapInstance.panTo({ lat: location.latitude, lng: location.longitude });
        mapInstance.setZoom(18); // Zoom in close to the location
        setHasAutoNavigated(true); // Mark as navigated so it doesn't happen again
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mapInstance, location, isLoading, hasAutoNavigated]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div ref={mapRef} className="map-container w-full h-full" />
      
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-ice-400 animate-spin" />
            <p className="text-white text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

