import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import type { LifecycleEvent } from '../types';

interface MapViewProps {
  events: LifecycleEvent[];
  center: [number, number];
  mainLocationPaths?: Array<Array<[number, number]>>;
  highlightedPath?: Array<[number, number]> | null;
  eventIcons: Record<string, Icon>;
  selectedEventLocation?: [number, number] | null;
  locationBounds?: LatLngBounds | null;
  isTransportationEvent?: boolean;
  zoomToPath?: boolean;
  mainLocations?: {
    projectPrep: [number, number] | null;
    pyrolysisPlant: [number, number] | null;
    applicationField: [number, number] | null;
  };
  mainLocationIcons?: Record<string, Icon>;
}

// Component to handle map view updates
function MapController({ center, zoom, bounds }: { center?: [number, number]; zoom?: number; bounds?: LatLngBounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      // For location bounds (100 acres), use tighter padding and allow higher zoom
      // For path bounds (transportation), use more padding
      const isLocationBound = bounds.getNorth() - bounds.getSouth() < 0.02; // Small bounds = location
      map.fitBounds(bounds, { 
        padding: isLocationBound ? [100, 100] : [50, 50], 
        maxZoom: isLocationBound ? 18 : 16 
      });
    } else if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, bounds]);

  return null;
}

export default function MapView({ events, center, mainLocationPaths = [], highlightedPath, eventIcons, selectedEventLocation, locationBounds, isTransportationEvent = false, zoomToPath, mainLocations, mainLocationIcons }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate bounds for all paths (main locations + highlighted)
  const allPaths = [...mainLocationPaths];
  if (highlightedPath) {
    allPaths.push(highlightedPath);
  }
  
  const pathBounds = mainLocations
    ? (() => {
        const allCoords: Array<[number, number]> = [];
        // Always include all main locations in bounds
        if (mainLocations.projectPrep) allCoords.push(mainLocations.projectPrep);
        if (mainLocations.pyrolysisPlant) allCoords.push(mainLocations.pyrolysisPlant);
        if (mainLocations.applicationField) allCoords.push(mainLocations.applicationField);
        // Also include path coordinates
        allPaths.forEach(path => {
          path.forEach(coord => allCoords.push(coord));
        });
        return allCoords.length > 0 ? new LatLngBounds(allCoords) : undefined;
      })()
    : undefined;

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <div className="text-neutral-500">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <MapController 
        center={selectedEventLocation || undefined}
        zoom={selectedEventLocation && !isTransportationEvent ? undefined : undefined}
        bounds={
          locationBounds 
            ? locationBounds 
            : (zoomToPath && pathBounds ? pathBounds : undefined)
        }
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Main Location Markers */}
      {mainLocations && mainLocationIcons && (
        <>
          {mainLocations.projectPrep && (
            <Marker
              position={mainLocations.projectPrep}
              icon={mainLocationIcons.project_prep}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-green-600">Project Prep Location</div>
                  <div className="text-xs text-neutral-600 mt-1">Feedstock Delivery & Prep</div>
                </div>
              </Popup>
            </Marker>
          )}
          {mainLocations.pyrolysisPlant && (
            <Marker
              position={mainLocations.pyrolysisPlant}
              icon={mainLocationIcons.pyrolysis_plant}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-red-600">Pyrolysis Plant</div>
                  <div className="text-xs text-neutral-600 mt-1">Reactor Operations</div>
                </div>
              </Popup>
            </Marker>
          )}
          {mainLocations.applicationField && (
            <Marker
              position={mainLocations.applicationField}
              icon={mainLocationIcons.application_field}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-teal-600">Biochar Application Field</div>
                  <div className="text-xs text-neutral-600 mt-1">Farm Field Location</div>
                </div>
              </Popup>
            </Marker>
          )}
        </>
      )}
      
      {/* Event Markers - only shown when events are clicked in timeline */}
      {(() => {
        // Group events by location to arrange them properly
        const eventsByLocation = new Map<string, Array<{ event: LifecycleEvent; index: number }>>();
        
        events.forEach((event, index) => {
          const locationKey = `${event.location.lat.toFixed(4)},${event.location.lng.toFixed(4)}`;
          if (!eventsByLocation.has(locationKey)) {
            eventsByLocation.set(locationKey, []);
          }
          eventsByLocation.get(locationKey)!.push({ event, index });
        });
        
        return Array.from(eventsByLocation.values()).flatMap((locationEvents) => {
          return locationEvents.map(({ event }, localIndex) => {
            let eventLat = event.location.lat;
            let eventLng = event.location.lng;
            
            // Calculate offset to prevent overlap
            // Use a grid pattern: arrange events in rows and columns
            const totalAtLocation = locationEvents.length;
            const cols = Math.ceil(Math.sqrt(totalAtLocation));
            const rows = Math.ceil(totalAtLocation / cols);
            
            // Calculate position in grid
            const row = Math.floor(localIndex / cols);
            const col = localIndex % cols;
            
            // Base offset (~40 meters between markers)
            const baseOffset = 0.0004;
            
            // Center the grid around the location
            const centerRow = (rows - 1) / 2;
            const centerCol = (cols - 1) / 2;
            
            const offsetLat = (row - centerRow) * baseOffset;
            const offsetLng = (col - centerCol) * baseOffset;
            
            eventLat += offsetLat;
            eventLng += offsetLng;
            
            return (
              <Marker
                key={event.id}
                position={[eventLat, eventLng]}
                icon={eventIcons[event.type] || eventIcons.sensor_reading}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs text-neutral-600 mt-1">{event.description}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          });
        });
      })()}
      
      {/* Always show paths between main locations */}
      {mainLocationPaths.map((path, index) => (
        <Polyline
          key={`main-path-${index}`}
          positions={path}
          color="#94a3b8"
          weight={3}
          opacity={0.5}
          dashArray="10, 5"
        />
      ))}
      
      {/* Highlighted path for specific events (Feedstock Delivery, Biochar Delivery) */}
      {highlightedPath && highlightedPath.length > 1 && (
        <Polyline
          positions={highlightedPath}
          color="#10b981"
          weight={5}
          opacity={0.9}
          dashArray="5, 5"
        />
      )}
    </MapContainer>
  );
}

