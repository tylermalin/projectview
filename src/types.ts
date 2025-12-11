export interface Location {
  lat: number;
  lng: number;
}

export interface SensorReading {
  type: 'biochar_weight' | 'reactor_temp' | 'reactor_runtime' | 'finished_biochar_weight' | 'soil_temp' | 'baseline_carbon' | 'current_sequestration' | 'reactor_feedstock_image';
  value?: number;
  unit?: string;
  timestamp: string;
  location: Location;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  breakdown?: {
    soil?: number;
    aboveGroundBiomass?: number;
  };
  evidence?: {
    soilReading?: string;
    satelliteImages?: string[];
  };
}

export interface BlockchainProof {
  hash: string;
  label: string;
  type: 'image' | 'document';
}

export interface FeedstockDetails {
  type: string;
  supplier: string;
  volume: number;
  unit: string;
  carbonContent: string;
  proofs: BlockchainProof[];
}

export interface LifecycleEvent {
  id: string;
  type: 'feedstock_provisioning' | 'feedstock_delivery' | 'feedstock_to_reactor_delivery' | 'pyrolysis' | 'biochar_delivery' | 'biochar_application' | 'sensor_reading' | 'farm_contract' | 'farm_report' | 'baseline_report' | 'delivery_scheduling' | 'biochar_lab_test' | 'biochar_bagging' | 'farm_selection' | 'monitoring_report';
  title: string;
  description: string;
  imageUrl: string;
  location: Location;
  locationName?: string; // Human-readable location name
  timestamp: string;
  co2Impact: number;
  sensorReading?: SensorReading;
  feedstockDetails?: FeedstockDetails;
  blockchainProofs?: BlockchainProof[];
  metadata?: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  co2Quantity: number;
  location: Location;
  date: string;
  batchInfo: {
    materials: Array<{
      name: string;
      percentage: number;
      weight: number;
      unit: string;
    }>;
    totalWeight: number;
    unit: string;
  };
  grossRemovals: {
    materialAmount: number;
    stableCarbonFactor: number;
    negativeEmissionConversion: number;
    co2CRatio: string;
  };
  events: LifecycleEvent[];
}

