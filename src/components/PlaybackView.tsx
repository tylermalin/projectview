import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import type { Project, LifecycleEvent } from '../types';

interface PlaybackViewProps {
  project: Project;
  events: LifecycleEvent[];
  eventIcons: Record<string, Icon>;
  mainLocations?: {
    projectPrep: [number, number] | null;
    pyrolysisPlant: [number, number] | null;
    applicationField: [number, number] | null;
  };
  mainLocationIcons?: Record<string, Icon>;
  methodology?: 'biochar' | 'enhanced_rock_weathering';
  isTransportationEvent: (event: LifecycleEvent) => boolean;
  locationBounds: (event: LifecycleEvent) => LatLngBounds | null;
  highlightedPath: (event: LifecycleEvent) => Array<[number, number]> | null;
  mainLocationPaths?: Array<Array<[number, number]>>;
  onClose: () => void;
}

// Map controller for playback
function PlaybackMapController({ 
  event, 
  isTransportationEvent, 
  locationBounds, 
  highlightedPath 
}: { 
  event: LifecycleEvent | null;
  isTransportationEvent: (event: LifecycleEvent) => boolean;
  locationBounds: (event: LifecycleEvent) => LatLngBounds | null;
  highlightedPath: (event: LifecycleEvent) => Array<[number, number]> | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!event) return;

    const bounds = locationBounds(event);
    const path = highlightedPath(event);
    const isTransport = isTransportationEvent(event);

    if (bounds && !isTransport) {
      // Zoom to location bounds for non-transportation events
      map.fitBounds(bounds, { 
        padding: [100, 100], 
        maxZoom: 18 
      });
    } else if (path && path.length > 1) {
      // Zoom to path for transportation events
      const pathBounds = new LatLngBounds(path);
      map.fitBounds(pathBounds, { 
        padding: [50, 50], 
        maxZoom: 16 
      });
    } else {
      // Default zoom to event location
      map.setView([event.location.lat, event.location.lng], 15);
    }
  }, [map, event, isTransportationEvent, locationBounds, highlightedPath]);

  return null;
}

export default function PlaybackView({
  project,
  events,
  eventIcons,
  mainLocations,
  mainLocationIcons,
  methodology,
  isTransportationEvent,
  locationBounds,
  highlightedPath,
  mainLocationPaths = [],
  onClose,
}: PlaybackViewProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(3000); // milliseconds per event
  const [isClient, setIsClient] = useState(false);

  const isERW = methodology === 'enhanced_rock_weathering';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentEvent = events[currentEventIndex] || null;
  const currentHighlightedPath = currentEvent ? highlightedPath(currentEvent) : null;

  // Auto-advance events
  useEffect(() => {
    if (!isPaused && currentEventIndex < events.length - 1) {
      const timer = setTimeout(() => {
        setCurrentEventIndex(prev => prev + 1);
      }, playbackSpeed);

      return () => clearTimeout(timer);
    } else if (currentEventIndex >= events.length - 1 && !isPaused) {
      // Auto-close when finished
      const timer = setTimeout(() => {
        onClose();
      }, playbackSpeed);

      return () => clearTimeout(timer);
    }
  }, [currentEventIndex, isPaused, playbackSpeed, events.length, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentEventIndex < events.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
    }
  };

  const handlePlayPause = () => {
    setIsPaused(prev => !prev);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Map */}
      <div className="absolute inset-0">
        <MapContainer
          center={currentEvent ? [currentEvent.location.lat, currentEvent.location.lng] : [project.location.lat, project.location.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <PlaybackMapController
            event={currentEvent}
            isTransportationEvent={isTransportationEvent}
            locationBounds={locationBounds}
            highlightedPath={highlightedPath}
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
                  icon={isERW ? mainLocationIcons.feedstock_source : mainLocationIcons.project_prep}
                />
              )}
              {mainLocations.pyrolysisPlant && (
                <Marker
                  position={mainLocations.pyrolysisPlant}
                  icon={isERW ? mainLocationIcons.staging_grounds : mainLocationIcons.pyrolysis_plant}
                />
              )}
              {mainLocations.applicationField && (
                <Marker
                  position={mainLocations.applicationField}
                  icon={mainLocationIcons.application_field}
                />
              )}
            </>
          )}

          {/* Main Location Paths */}
          {mainLocationPaths.map((path, index) => (
            <Polyline
              key={`main-path-${index}`}
              positions={path}
              color="#94a3b8"
              weight={3}
              opacity={0.3}
              dashArray="10, 5"
            />
          ))}

          {/* Highlighted Path */}
          {currentHighlightedPath && currentHighlightedPath.length > 1 && (
            <Polyline
              positions={currentHighlightedPath}
              color="#10b981"
              weight={5}
              opacity={0.9}
              dashArray="5, 5"
            />
          )}

          {/* Current Event Marker */}
          {currentEvent && (
            <Marker
              position={[currentEvent.location.lat, currentEvent.location.lng]}
              icon={eventIcons[currentEvent.type] || eventIcons.sensor_reading}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{currentEvent.title}</div>
                  <div className="text-xs text-neutral-600 mt-1">{currentEvent.description}</div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Event Info Overlay */}
      {currentEvent && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 z-[10000]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-4">
              {/* Event Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 overflow-hidden">
                  {currentEvent.imageUrl && (
                    <img 
                      src={currentEvent.imageUrl} 
                      alt={currentEvent.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!currentEvent.imageUrl && (
                    <span className="text-2xl">
                      {eventIcons[currentEvent.type] ? '📍' : '📊'}
                    </span>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{currentEvent.title}</h3>
                  <div className="text-sm text-white/70">
                    {currentEventIndex + 1} / {events.length}
                  </div>
                </div>
                <p className="text-white/90 mb-3">{currentEvent.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{new Date(currentEvent.timestamp).toLocaleDateString()}</span>
                  </div>
                  {currentEvent.locationName && (
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 0120 10c0-4.418-3.582-8-8-8S4 5.582 4 10a8 8 0 012.343 6.727L12 22l5.657-5.273z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{currentEvent.locationName}</span>
                    </div>
                  )}
                  {currentEvent.co2Impact !== 0 && (
                    <div className={`flex items-center gap-1 ${currentEvent.co2Impact > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                      <span className="font-semibold">{currentEvent.co2Impact > 0 ? '+' : ''}{currentEvent.co2Impact.toFixed(2)}</span>
                      <span className="text-xs">kg CO₂e</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-sustainability-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentEventIndex + 1) / events.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentEventIndex === 0}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Event"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentEventIndex >= events.length - 1}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Event"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70">Speed:</span>
                <button
                  onClick={() => handleSpeedChange(5000)}
                  className={`px-2 py-1 text-xs rounded ${playbackSpeed === 5000 ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => handleSpeedChange(3000)}
                  className={`px-2 py-1 text-xs rounded ${playbackSpeed === 3000 ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
                >
                  1x
                </button>
                <button
                  onClick={() => handleSpeedChange(1500)}
                  className={`px-2 py-1 text-xs rounded ${playbackSpeed === 1500 ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
                >
                  2x
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-tile text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

