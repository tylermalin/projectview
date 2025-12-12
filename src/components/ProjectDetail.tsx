import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon, LatLngBounds } from 'leaflet';
import { LifecycleEvent, BlockchainProof } from '../types';
import { mockProjects } from '../data/mockData';
import MapView from './MapView';

// Create custom icons for different event types
const createIcon = (color: string, emoji: string) => {
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="16" y="20" font-size="16" text-anchor="middle" fill="white">${emoji}</text>
  </svg>`;
  
  // Properly encode SVG with emojis
  const encoded = encodeURIComponent(svg);
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encoded}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Create main location icons
const createMainLocationIcon = (color: string, emoji: string, size: number = 40) => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="3"/>
    <text x="${size/2}" y="${size/2 + 8}" font-size="${size/2}" text-anchor="middle" fill="white">${emoji}</text>
  </svg>`;
  
  const encoded = encodeURIComponent(svg);
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encoded}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  });
};

const eventIcons: Record<string, Icon> = {
  feedstock_provisioning: createIcon('#2ecc71', '🌱'),
  feedstock_delivery: createIcon('#3498db', '🚚'),
  feedstock_to_reactor_delivery: createIcon('#3498db', '🚛'),
  pyrolysis: createIcon('#e74c3c', '🔥'),
  biochar_delivery: createIcon('#3498db', '🚚'),
  biochar_application: createIcon('#16a085', '🌾'),
  sensor_reading: createIcon('#9b59b6', '📊'),
  farm_contract: createIcon('#16a085', '📄'),
  farm_report: createIcon('#16a085', '🗺️'),
  baseline_report: createIcon('#9b59b6', '📊'),
  delivery_scheduling: createIcon('#3498db', '📅'),
  biochar_lab_test: createIcon('#e74c3c', '🔬'),
  biochar_bagging: createIcon('#3498db', '📦'),
  farm_selection: createIcon('#16a085', '✅'),
  monitoring_report: createIcon('#9b59b6', '📈'),
  // ERW event types
  rock_characterization: createIcon('#7f8c8d', '🏔️'),
  rock_weighing: createIcon('#95a5a6', '⚖️'),
  transport_logistics: createIcon('#3498db', '🚛'),
  feedstock_intake: createIcon('#e67e22', '⛺'),
  baseline_lab_prep: createIcon('#9b59b6', '🔬'),
  field_mobilization: createIcon('#16a085', '🚜'),
  baseline_establishment: createIcon('#27ae60', '🌾'),
  rock_application: createIcon('#27ae60', '🌾'),
  verification: createIcon('#3498db', '🔍'),
  environmental_monitoring: createIcon('#3498db', '🌧️'),
  net_cdr_calculation: createIcon('#2ecc71', '📈'),
  // ERW shipping/receiving events
  feedstock_delivery_source_to_staging: createIcon('#3498db', '🚛'),
  feedstock_received_staging: createIcon('#16a085', '✅'),
  feedstock_delivery_staging_to_field: createIcon('#3498db', '🚛'),
  feedstock_received_field: createIcon('#16a085', '✅'),
  // Isometric Biochar v1.2 compliance events
  stakeholder_engagement: createIcon('#16a085', '👥'),
  waste_verification: createIcon('#9b59b6', '♻️'),
  reactor_design_validation: createIcon('#e74c3c', '🔧'),
  emissions_monitoring: createIcon('#3498db', '📊'),
  safety_screening: createIcon('#e67e22', '🛡️'),
  carbon_stability_test: createIcon('#9b59b6', '🔬'),
  certified_weigh_in: createIcon('#95a5a6', '⚖️'),
  application_loss_accounting: createIcon('#16a085', '📉'),
  net_credit_minting: createIcon('#2ecc71', '💰'),
};

// Main location icons - Biochar
const biocharLocationIcons = {
  project_prep: createMainLocationIcon('#10b981', '🚀', 48), // Start location
  pyrolysis_plant: createMainLocationIcon('#e74c3c', '⚗️', 48), // Reactor icon
  application_field: createMainLocationIcon('#16a085', '🚜', 48), // Farm icon
};

// Main location icons - ERW
const erwLocationIcons = {
  feedstock_source: createMainLocationIcon('#7f8c8d', '🏔️', 48), // Quarry icon
  staging_grounds: createMainLocationIcon('#e67e22', '⛺', 48), // Basecamp icon
  application_field: createMainLocationIcon('#27ae60', '🌾', 48), // Field icon
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set(['project_prep', 'reactor', 'farm'])); // All expanded by default
  
  const project = mockProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Project not found</h1>
          <Link to="/" className="text-blue-600 hover:underline">Back to Projects</Link>
        </div>
      </div>
    );
  }

  // Check if this is an ERW project
  const isERW = project.methodology === 'enhanced_rock_weathering';

  // Get three main locations for initial map display
  const mainLocations = useMemo(() => {
    
    if (isERW) {
      // ERW locations: Feedstock Source, Basecamp, Field
      const feedstockSource = project.events.find(e => 
        Math.abs(e.location.lat - 43.4862) < 0.001 && 
        Math.abs(e.location.lng - (-116.1265)) < 0.001
      );
      
      const basecamp = project.events.find(e => 
        Math.abs(e.location.lat - 43.8055) < 0.001 && 
        Math.abs(e.location.lng - (-115.8672)) < 0.001
      );
      
      const field = project.events.find(e => 
        Math.abs(e.location.lat - 43.8251) < 0.001 && 
        Math.abs(e.location.lng - (-115.8903)) < 0.001
      );
      
      return {
        projectPrep: feedstockSource ? [feedstockSource.location.lat, feedstockSource.location.lng] as [number, number] : null,
        pyrolysisPlant: basecamp ? [basecamp.location.lat, basecamp.location.lng] as [number, number] : null,
        applicationField: field ? [field.location.lat, field.location.lng] as [number, number] : null,
      };
    } else {
      // Biochar locations: Project Prep, Pyrolysis Plant, Application Field
      const projectPrep = project.events.find(e => 
        Math.abs(e.location.lat - 20.9211) < 0.001 && 
        Math.abs(e.location.lng - (-156.3051)) < 0.001
      );
      
      const pyrolysisPlant = project.events.find(e => 
        Math.abs(e.location.lat - 20.9211) < 0.001 && 
        Math.abs(e.location.lng - (-156.3087)) < 0.001
      );
      
      const applicationField = project.events.find(e => 
        Math.abs(e.location.lat - 20.9350) < 0.001 && 
        Math.abs(e.location.lng - (-156.5100)) < 0.001
      );
      
      return {
        projectPrep: projectPrep ? [projectPrep.location.lat, projectPrep.location.lng] as [number, number] : null,
        pyrolysisPlant: pyrolysisPlant ? [pyrolysisPlant.location.lat, pyrolysisPlant.location.lng] as [number, number] : null,
        applicationField: applicationField ? [applicationField.location.lat, applicationField.location.lng] as [number, number] : null,
      };
    }
  }, [project.events, isERW]);


  const visibleEvents = useMemo(() => {
    // Show only the currently selected event
    if (selectedEventIndex === null) {
      return []; // No event markers initially, only main locations
    }
    
    // Return only the selected event
    const event = project.events[selectedEventIndex];
    return event ? [event] : [];
  }, [project.events, selectedEventIndex]);

  // Always show paths between main locations
  const mainLocationPaths = useMemo(() => {
    const paths: Array<Array<[number, number]>> = [];
    
    // Path from Prep to Reactor
    if (mainLocations.projectPrep && mainLocations.pyrolysisPlant) {
      paths.push([mainLocations.projectPrep, mainLocations.pyrolysisPlant]);
    }
    
    // Path from Reactor to Application Field
    if (mainLocations.pyrolysisPlant && mainLocations.applicationField) {
      paths.push([mainLocations.pyrolysisPlant, mainLocations.applicationField]);
    }
    
    return paths;
  }, [mainLocations]);

  // Highlighted path based on selected event
  const highlightedPath = useMemo(() => {
    if (selectedEventIndex === null) {
      return null;
    }
    
    const selectedEvent = project.events[selectedEventIndex];
    if (!selectedEvent) return null;
    
    // Biochar transportation events
    if (selectedEvent.type === 'feedstock_to_reactor_delivery' && mainLocations.projectPrep && mainLocations.pyrolysisPlant) {
      return [mainLocations.projectPrep, mainLocations.pyrolysisPlant];
    }
    
    if (selectedEvent.type === 'feedstock_delivery' && mainLocations.projectPrep && mainLocations.pyrolysisPlant) {
      return [mainLocations.projectPrep, mainLocations.pyrolysisPlant];
    }
    
    if (selectedEvent.type === 'biochar_delivery' && mainLocations.pyrolysisPlant && mainLocations.applicationField) {
      return [mainLocations.pyrolysisPlant, mainLocations.applicationField];
    }
    
    // ERW transportation events
    if (selectedEvent.type === 'feedstock_delivery_source_to_staging' && mainLocations.projectPrep && mainLocations.pyrolysisPlant) {
      return [mainLocations.projectPrep, mainLocations.pyrolysisPlant];
    }
    
    if (selectedEvent.type === 'feedstock_delivery_staging_to_field' && mainLocations.pyrolysisPlant && mainLocations.applicationField) {
      return [mainLocations.pyrolysisPlant, mainLocations.applicationField];
    }
    
    // Legacy ERW transportation events (for backward compatibility)
    if (selectedEvent.type === 'transport_logistics' && mainLocations.projectPrep && mainLocations.pyrolysisPlant) {
      return [mainLocations.projectPrep, mainLocations.pyrolysisPlant];
    }
    
    if (selectedEvent.type === 'field_mobilization' && mainLocations.pyrolysisPlant && mainLocations.applicationField) {
      return [mainLocations.pyrolysisPlant, mainLocations.applicationField];
    }
    
    return null;
  }, [selectedEventIndex, project.events, mainLocations]);

  const handleEventClick = (index: number) => {
    // If clicking the same event, deselect it; otherwise select the new one
    setSelectedEventIndex(prev => prev === index ? null : index);
  };

  // Get selected event location and bounds for zooming
  const selectedEventLocation = useMemo(() => {
    if (selectedEventIndex === null) {
      return null;
    }
    const event = project.events[selectedEventIndex];
    return event ? [event.location.lat, event.location.lng] as [number, number] : null;
  }, [selectedEventIndex, project.events]);

  // Check if the selected event is a transportation event
  const isTransportationEvent = useMemo(() => {
    if (selectedEventIndex === null) {
      return false;
    }
    const event = project.events[selectedEventIndex];
    return event ? (
      event.type === 'feedstock_delivery' || 
      event.type === 'feedstock_to_reactor_delivery' ||
      event.type === 'biochar_delivery' ||
      event.type === 'transport_logistics' ||
      event.type === 'field_mobilization' ||
      event.type === 'feedstock_delivery_source_to_staging' ||
      event.type === 'feedstock_delivery_staging_to_field'
    ) : false;
  }, [selectedEventIndex, project.events]);

  // Calculate bounds for non-transportation events (100 acres = ~0.4 km² = ~632m per side)
  // At Maui's latitude (~20°), 1 degree ≈ 111 km, so 632m ≈ 0.0057 degrees
  const locationBounds = useMemo(() => {
    if (selectedEventIndex === null || isTransportationEvent) {
      return null;
    }
    const event = project.events[selectedEventIndex];
    if (!event) return null;
    
    // Create a square boundary around the location (~100 acres = ~632m radius)
    const radiusDegrees = 0.0057 / 2; // Half the side length in degrees
    const bounds = new LatLngBounds(
      [event.location.lat - radiusDegrees, event.location.lng - radiusDegrees],
      [event.location.lat + radiusDegrees, event.location.lng + radiusDegrees]
    );
    return bounds;
  }, [selectedEventIndex, project.events, isTransportationEvent]);

  const handleImageClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event click from firing
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  // Close on ESC key and prevent background scrolling
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullScreenImage();
      }
    };
    if (fullScreenImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [fullScreenImage]);

  const cardanoExplorerUrl = (hash: string) => `https://cardanoscan.io/transaction/${hash}`;

  const formatBlockchainProofs = (proofs: BlockchainProof[] | undefined) => {
    if (!proofs || proofs.length === 0) return null;

    return (
      <div className="mt-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="text-xs font-semibold text-neutral-700 mb-2">Blockchain Proofs</div>
        <div className="space-y-1">
          {proofs.map((proof, idx) => (
            <a
              key={idx}
              href={cardanoExplorerUrl(proof.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>{proof.label}</span>
              <span className="text-neutral-400 text-xs font-mono">({proof.hash.slice(0, 8)}...)</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const formatFeedstockDetails = (event: LifecycleEvent) => {
    if (!event.feedstockDetails) return null;

    const { feedstockDetails } = event;

    return (
      <div className="mt-2 p-4 bg-sustainability-bg rounded-tile border border-gray-200 shadow-sm">
        <div className="text-xs font-bold text-sustainability-gray uppercase tracking-wide mb-3">Feedstock Details</div>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-sustainability-gray/70 font-medium">Type:</span>
            <span className="font-semibold text-sustainability-gray">{feedstockDetails.type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sustainability-gray/70 font-medium">Supplier:</span>
            <span className="font-semibold text-sustainability-gray">{feedstockDetails.supplier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sustainability-gray/70 font-medium">Volume:</span>
            <span className="font-semibold text-sustainability-green">{feedstockDetails.volume.toLocaleString()} {feedstockDetails.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sustainability-gray/70 font-medium">Carbon Content:</span>
            <span className="font-semibold text-sustainability-teal">{feedstockDetails.carbonContent}</span>
          </div>
          {formatBlockchainProofs(feedstockDetails.proofs)}
        </div>
      </div>
    );
  };

  const formatSensorReading = (event: LifecycleEvent) => {
    if (!event.sensorReading) return null;

    const { sensorReading } = event;
    
    switch (sensorReading.type) {
      case 'biochar_weight':
      case 'finished_biochar_weight':
        return (
          <div className="text-xs text-neutral-600 mt-1">
            Weight: {sensorReading.value} {sensorReading.unit}
          </div>
        );
      case 'reactor_temp':
      case 'soil_temp':
        return (
          <div className="text-xs text-neutral-600 mt-1">
            Temperature: {sensorReading.value} {sensorReading.unit}
          </div>
        );
      case 'reactor_runtime':
        return (
          <div className="text-xs text-neutral-600 mt-1">
            Runtime: {sensorReading.startTime && new Date(sensorReading.startTime).toLocaleString()} - {sensorReading.endTime && new Date(sensorReading.endTime).toLocaleString()}
          </div>
        );
      case 'reactor_feedstock_image':
        return (
          <div className="mt-2">
            <img 
              src={sensorReading.imageUrl} 
              alt="Feedstock" 
              className="rounded-lg max-w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => sensorReading.imageUrl && handleImageClick(sensorReading.imageUrl, e)}
            />
          </div>
        );
      case 'baseline_carbon':
        return (
          <div className="text-xs text-sustainability-gray/80 mt-1 space-y-2 font-medium">
            <div>Total: <span className="font-semibold text-sustainability-green">{sensorReading.value}</span> <span className="text-sustainability-gray/60">{sensorReading.unit}</span></div>
            {sensorReading.breakdown && (
              <div className="pl-3 border-l-2 border-sustainability-teal/30">
                <div>Soil: <span className="font-semibold text-sustainability-gray">{sensorReading.breakdown.soil}</span> kg CO₂e</div>
                <div>Above Ground Biomass: <span className="font-semibold text-sustainability-gray">{sensorReading.breakdown.aboveGroundBiomass}</span> kg CO₂e</div>
              </div>
            )}
            {sensorReading.evidence && (
              <div className="mt-2">
                {sensorReading.evidence.soilReading && (
                  <div className="mb-2">
                    <div className="text-xs font-semibold mb-1">Soil Reading:</div>
                    <img 
                      src={sensorReading.evidence.soilReading} 
                      alt="Soil Reading" 
                      className="rounded max-w-full h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => handleImageClick(sensorReading.evidence!.soilReading!, e)}
                    />
                  </div>
                )}
                {sensorReading.evidence.satelliteImages && sensorReading.evidence.satelliteImages.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1">Satellite Images:</div>
                    <div className="flex gap-1 overflow-x-auto">
                      {sensorReading.evidence.satelliteImages.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`Satellite ${idx + 1}`} 
                          className="rounded h-20 w-20 object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => handleImageClick(img, e)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'current_sequestration':
        return (
          <div className="text-xs text-sustainability-gray/80 mt-1 font-medium">
            Sequestration: <span className="font-semibold text-sustainability-green">{sensorReading.value}</span> <span className="text-sustainability-gray/60">{sensorReading.unit}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sustainability-bg">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <Link to="/" className="text-sustainability-sky hover:text-sustainability-teal transition-colors font-medium inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
      </div>
      
      <div className={`flex flex-col md:flex-row h-[calc(100vh-73px)] ${fullScreenImage ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Left Panel - Timeline */}
        <div className="w-full md:w-1/2 overflow-hidden border border-gray-200 rounded-card shadow-sm m-4 bg-white">
          <div className="flex h-full w-full flex-col">
            <div className="flex shrink-0 flex-col justify-center p-6 bg-gradient-to-br from-sustainability-bg to-white border-b border-gray-200">
              <div className="flex w-full flex-col items-center justify-between gap-4">
                {/* Project Name */}
                <div className="w-full text-center">
                  <h1 className="text-2xl font-bold text-sustainability-gray mb-2">{project.name}</h1>
                  
                  {/* Protocol */}
                  {project.protocol && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-sustainability-gray/60 uppercase tracking-wide mb-1">Protocol</div>
                      <div className="text-sm text-sustainability-gray">{project.protocol}</div>
                    </div>
                  )}
                  
                  {/* Project ID */}
                  {project.projectId && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-sustainability-gray/60 uppercase tracking-wide mb-1">Project ID</div>
                      <div className="text-sm font-mono text-sustainability-gray">{project.projectId}</div>
                    </div>
                  )}
                  
                  {/* Project Design Document Link */}
                  {project.projectDesignDocument && (
                    <div className="mb-3">
                      <a
                        href={project.projectDesignDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-sustainability-teal hover:text-sustainability-green hover:underline font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Project Design Document (PDD)</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
                
                {/* CO2 Quantity */}
                <div className="flex items-baseline gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sustainability-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-4xl font-bold text-sustainability-gray">{project.co2Quantity.toLocaleString()}</span>
                  <span className="text-lg text-sustainability-gray/70 font-medium">kg&nbsp;CO<sub>2</sub>e</span>
                </div>
                
                {/* Location and Date */}
                <div className="flex flex-row justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-sustainability-gray/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 0120 10c0-4.418-3.582-8-8-8S4 5.582 4 10a8 8 0 012.343 6.727L12 22l5.657-5.273z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-sm font-medium">{project.location.lat.toFixed(3)}, {project.location.lng.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sustainability-gray/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span className="text-sm font-medium">{new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full w-full overflow-y-auto">
              <div className="pt-4">
                <div className="flex w-full flex-col gap-6 pb-6">
                  <div className="flex flex-col gap-2 px-4">
                    <span className="text-xs font-semibold text-sustainability-gray/60 uppercase tracking-wide">Project</span>
                    <div className="group relative flex w-full cursor-pointer flex-row items-center rounded-tile border border-gray-200 p-2 hover:border-sustainability-teal/30 hover:bg-sustainability-bg transition-all">
                      <div className="box-border inline-flex items-center gap-2 overflow-x-hidden whitespace-nowrap rounded-tile border-none bg-white px-3 py-2 text-sm text-sustainability-gray group-hover:bg-white">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sustainability-green to-sustainability-teal flex items-center justify-center shadow-sm">
                          <span className="text-xs text-white font-bold">{project.name.charAt(0)}</span>
                        </div>
                        <p className="truncate text-sm font-medium">{project.name}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-gray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 px-4">
                    <span className="text-xs font-semibold text-sustainability-gray/60 uppercase tracking-wide">Batch Information</span>
                    <div className="rounded-tile border border-gray-200 p-4 bg-white shadow-sm">
                      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-2 text-sm">
                        {project.batchInfo.materials.map((material, idx) => (
                          <React.Fragment key={idx}>
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sustainability-gray" title={material.name}>{material.name}</div>
                            <div className="text-end font-semibold text-sustainability-green">{material.percentage}%</div>
                            <div className="text-center text-gray-300">|</div>
                            <div className="text-end font-medium text-sustainability-gray">{material.weight.toLocaleString()}&thinsp;{material.unit}</div>
                          </React.Fragment>
                        ))}
                        <div className="col-span-4 mt-2 border-t border-gray-200 pt-2 text-end font-bold text-sustainability-gray">
                          {project.batchInfo.totalWeight.toLocaleString()}&thinsp;{project.batchInfo.unit}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 px-4">
                    <span className="text-xs font-semibold text-sustainability-gray/60 uppercase tracking-wide">Gross Removals</span>
                    <div className="flex flex-col overflow-hidden border border-gray-200 p-4 rounded-tile bg-white shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-sustainability-gray">Gross Removals</p>
                        </div>
                        <div className="inline-flex items-center justify-center">
                          <div className="flex items-center gap-2 rounded-tile border-2 border-sustainability-green bg-sustainability-green/10 px-3 py-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span className="text-sm font-bold text-sustainability-green">{(project.co2Quantity + 2.47).toFixed(2)}</span>
                            <span className="text-xs mt-0.5 text-sustainability-green/80 font-medium">kg&nbsp;CO<sub>2</sub>e</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <p className="text-neutral-700">Material Amount</p>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1">
                              <span>{project.grossRemovals.materialAmount}</span>
                              <span className="text-neutral-400">kg</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-neutral-700">Stable Carbon Factor</p>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1">
                              <span>{project.grossRemovals.stableCarbonFactor}</span>
                              <span className="text-neutral-400 text-xs">kg CO<sub>2</sub>e / kg</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-neutral-700">Negative Emission Conversion</p>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1">
                              <span>{project.grossRemovals.negativeEmissionConversion}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-neutral-700">CO2 / C Ratio</p>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1">
                              <span>{project.grossRemovals.co2CRatio}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Locations Section */}
                  <div className="relative flex flex-col gap-2">
                    <div className="px-4 text-xs font-semibold text-sustainability-gray/60 uppercase tracking-wide mb-2">Project Locations</div>
                    
                    {/* Group events by location */}
                    {(() => {
                      // Group events by location
                      const projectPrepEvents: Array<{ event: LifecycleEvent; index: number }> = [];
                      const reactorEvents: Array<{ event: LifecycleEvent; index: number }> = [];
                      const farmEvents: Array<{ event: LifecycleEvent; index: number }> = [];
                      
                      project.events.forEach((event, index) => {
                        const lat = event.location.lat;
                        const lng = event.location.lng;
                        
                        if (isERW) {
                          // ERW locations
                          // Feedstock Source: 43.4862, -116.1265
                          if (Math.abs(lat - 43.4862) < 0.001 && Math.abs(lng - (-116.1265)) < 0.001) {
                            projectPrepEvents.push({ event, index });
                          }
                          // Basecamp: 43.8055, -115.8672
                          else if (Math.abs(lat - 43.8055) < 0.001 && Math.abs(lng - (-115.8672)) < 0.001) {
                            reactorEvents.push({ event, index });
                          }
                          // Field: 43.8251, -115.8903
                          else if (Math.abs(lat - 43.8251) < 0.001 && Math.abs(lng - (-115.8903)) < 0.001) {
                            farmEvents.push({ event, index });
                          }
                        } else {
                          // Biochar locations
                          // Project Prep Location: 20.9211, -156.3051
                          if (Math.abs(lat - 20.9211) < 0.001 && Math.abs(lng - (-156.3051)) < 0.001) {
                            projectPrepEvents.push({ event, index });
                          }
                          // Reactor Location: 20.9211, -156.3087
                          else if (Math.abs(lat - 20.9211) < 0.001 && Math.abs(lng - (-156.3087)) < 0.001) {
                            reactorEvents.push({ event, index });
                          }
                          // Farm Location: 20.9350, -156.5100
                          else if (Math.abs(lat - 20.9350) < 0.001 && Math.abs(lng - (-156.5100)) < 0.001) {
                            farmEvents.push({ event, index });
                          }
                        }
                      });
                      
                      // Sort events by timestamp within each location
                      const sortByTime = (a: { event: LifecycleEvent; index: number }, b: { event: LifecycleEvent; index: number }) => 
                        new Date(a.event.timestamp).getTime() - new Date(b.event.timestamp).getTime();
                      
                      projectPrepEvents.sort(sortByTime);
                      reactorEvents.sort(sortByTime);
                      farmEvents.sort(sortByTime);
                      
                      const renderLocationSection = (
                        locationKey: string,
                        locationName: string,
                        locationIcon: string,
                        events: Array<{ event: LifecycleEvent; index: number }>,
                        locationCoords: string
                      ) => {
                        const isExpanded = expandedLocations.has(locationKey);
                        
                        return (
                          <div key={locationKey} className="bg-white border border-gray-200 rounded-tile shadow-sm mb-2">
                            {/* Location Header */}
                            <div
                              onClick={() => {
                                setExpandedLocations(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(locationKey)) {
                                    newSet.delete(locationKey);
                                  } else {
                                    newSet.add(locationKey);
                                  }
                                  return newSet;
                                });
                              }}
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{locationIcon}</div>
                                <div>
                                  <div className="font-semibold text-sustainability-gray">{locationName}</div>
                                  <div className="text-xs text-sustainability-gray/60">{locationCoords}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-sustainability-gray/60">{events.length} events</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-5 w-5 text-sustainability-gray/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Events List */}
                            {isExpanded && (
                              <div className="border-t border-gray-200">
                                {events.map(({ event, index }) => {
                                  const isSelected = selectedEventIndex === index;
                                  
                                  return (
                                    <div
                                      key={event.id}
                                      onClick={() => handleEventClick(index)}
                                      className={`cursor-pointer border-y border-transparent hover:border-sustainability-teal/20 relative bg-white transition-all duration-200 ${
                                        isSelected ? 'bg-sustainability-green/5 border-l-4 border-l-sustainability-green' : ''
                                      } hover:shadow-sm`}
                                    >
                                      <div className="flex items-start gap-4">
                                        <div className="relative flex w-24 shrink-0 justify-center px-3 py-2">
                                          <img
                                            alt={`Image of ${event.title}`}
                                            className="h-24 w-24 object-cover rounded-tile border-2 border-gray-200 cursor-pointer hover:border-sustainability-teal hover:opacity-90 transition-all shadow-sm"
                                            src={event.imageUrl}
                                            onClick={(e) => handleImageClick(event.imageUrl, e)}
                                          />
                                        </div>
                                        <div className="flex flex-1 flex-col gap-3 py-4 pr-4 border-b border-gray-100">
                                          <div className="flex w-full items-center justify-between">
                                            <div className="text-xs font-semibold text-sustainability-gray/70 uppercase tracking-wide">{event.title}</div>
                                            <div className={`flex items-center gap-1.5 rounded-tile border px-2 py-1 ${
                                              event.co2Impact > 0 
                                                ? 'border-sustainability-orange/30 bg-sustainability-orange/10 text-sustainability-orange'
                                                : 'border-gray-200 bg-sustainability-bg text-sustainability-gray/70'
                                            }`}>
                                              {event.co2Impact > 0 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                              )}
                                              <span className="text-xs font-bold">{event.co2Impact.toFixed(2)}</span>
                                              <span className="text-xs mt-0.5 font-medium">kg&nbsp;CO<sub>2</sub>e</span>
                                            </div>
                                          </div>
                                          <div className="flex w-full flex-col gap-3">
                                            <span className="text-sm leading-6 text-sustainability-gray font-medium">{event.description}</span>
                                            {event.metadata && (
                                              <div className="text-xs text-sustainability-gray/60">
                                                <div>Date: {event.metadata.date || new Date(event.timestamp).toLocaleDateString()}</div>
                                                <div>Time: {event.metadata.time || new Date(event.timestamp).toLocaleTimeString()}</div>
                                                {event.locationName && <div>Location: {event.locationName}</div>}
                                                <div>Coordinates: {event.location.lat.toFixed(4)}°N, {event.location.lng.toFixed(4)}°W</div>
                                              </div>
                                            )}
                                            {formatFeedstockDetails(event)}
                                            {formatSensorReading(event)}
                                            {formatBlockchainProofs(event.blockchainProofs)}
                                            <div className="flex justify-between gap-1">
                                              <div className="flex gap-1 overflow-x-scroll max-w-[200px]"></div>
                                              <button className="flex items-center justify-center text-sustainability-gray/40 hover:text-sustainability-teal transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                  <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      };
                      
                      return (
                        <>
                          {renderLocationSection(
                            'project_prep',
                            isERW ? 'Feedstock Source (Premier Aggregates)' : 'Provisioning, Planning and Delivery Location',
                            isERW ? '🏔️' : '🚀',
                            projectPrepEvents,
                            isERW ? '43.4862°N, -116.1265°W' : '20.9211°N, -156.3051°W'
                          )}
                          {renderLocationSection(
                            'reactor',
                            isERW ? 'Malama Basecamp (Idaho City)' : 'Reactor Location',
                            isERW ? '⛺' : '⚗️',
                            reactorEvents,
                            isERW ? '43.8055°N, -115.8672°W' : '20.9211°N, -156.3087°W'
                          )}
                          {renderLocationSection(
                            'farm',
                            isERW ? 'Field Location (Application Site)' : 'Farm Location',
                            isERW ? '🌾' : '🚜',
                            farmEvents,
                            isERW ? '43.8251°N, -115.8903°W' : '20.9350°N, -156.5100°W'
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-full md:w-1/2 m-4 rounded-card border border-gray-200 shadow-sm overflow-hidden bg-white">
          <MapView
            events={visibleEvents}
            center={[project.location.lat, project.location.lng]}
            mainLocationPaths={mainLocationPaths}
            highlightedPath={highlightedPath}
            eventIcons={eventIcons}
            selectedEventLocation={selectedEventLocation}
            locationBounds={locationBounds}
            isTransportationEvent={isTransportationEvent}
            zoomToPath={selectedEventIndex === null}
            mainLocations={mainLocations}
            mainLocationIcons={isERW ? erwLocationIcons : biocharLocationIcons}
            methodology={project.methodology}
          />
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <>
          {/* Overlay to grey out content */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] pointer-events-none" />
          
          {/* Modal with image */}
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={closeFullScreenImage}
          >
            <button
              onClick={closeFullScreenImage}
              className="absolute top-4 right-4 text-white hover:text-neutral-300 transition-colors z-[10000] bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen view"
              className="max-w-full max-h-full object-contain relative z-[10000]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </>
      )}
    </div>
  );
}

