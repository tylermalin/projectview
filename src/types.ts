export interface Location {
  lat: number;
  lng: number;
}

export interface SensorReading {
  type: 'biochar_weight' | 'reactor_temp' | 'reactor_runtime' | 'finished_biochar_weight' | 'soil_temp' | 'baseline_carbon' | 'current_sequestration' | 'reactor_feedstock_image' | 'rock_weight' | 'soil_ph' | 'soil_dic' | 'xrf_scan' | 'rainfall' | 'soil_temp_erw';
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
  type: 'feedstock_provisioning' | 'feedstock_delivery' | 'feedstock_to_reactor_delivery' | 'pyrolysis' | 'biochar_delivery' | 'biochar_application' | 'sensor_reading' | 'farm_contract' | 'farm_report' | 'baseline_report' | 'delivery_scheduling' | 'biochar_lab_test' | 'biochar_bagging' | 'farm_selection' | 'monitoring_report' | 'rock_characterization' | 'rock_weighing' | 'transport_logistics' | 'feedstock_intake' | 'baseline_lab_prep' | 'field_mobilization' | 'baseline_establishment' | 'rock_application' | 'verification' | 'environmental_monitoring' | 'net_cdr_calculation' | 'feedstock_delivery_source_to_staging' | 'feedstock_received_staging' | 'feedstock_delivery_staging_to_field' | 'feedstock_received_field' | 'stakeholder_engagement' | 'waste_verification' | 'reactor_design_validation' | 'emissions_monitoring' | 'safety_screening' | 'carbon_stability_test' | 'certified_weigh_in' | 'application_loss_accounting' | 'net_credit_minting';
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
  methodology?: 'biochar' | 'enhanced_rock_weathering';
  protocol?: string;
  projectId?: string;
  projectDesignDocument?: string; // URL to PDF
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

