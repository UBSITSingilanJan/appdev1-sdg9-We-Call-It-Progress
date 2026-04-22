export interface EnergyMeter {
  id: number;
  meterNumber: string;
  consumerType: 'Residential' | 'Commercial' | 'Industrial';
  location: string;
  installationDate: Date;
  currentVoltage: number; // e.g., 230V
  currentAmperage: number;
  status: 'Active' | 'Disconnected' | 'Tampered' | 'Maintenance';
}

export interface PowerOutageReport {
  id: number;
  affectedArea: string;
  outageType: 'Planned' | 'Unscheduled' | 'Emergency';
  estimatedRestorationTime: Date;
  reason: 'Grid Overload' | 'Maintenance' | 'Equipment Failure' | 'Weather';
  reportedBy: 'System' | 'Customer' | 'Sensor';
  status: 'Detected' | 'Crew Dispatched' | 'Restoring' | 'Resolved';
  startedAt: Date;
}

export interface ConsumptionData {
  id: number;
  meterId: number;
  realTimeLoadKw: number;
  dailyTotalKwh: number;
  peakDemandKw: number;
  powerFactor: number; // Measure of electrical efficiency (0.0 to 1.0)
  lastReadingTimestamp: Date;
  billingCycleStatus: 'Current' | 'Overdue' | 'Estimated';
}

export interface RenewableSourceStatus {
  id: number;
  sourceType: 'Solar' | 'Wind' | 'Hydro';
  generationCapacityKw: number;
  currentOutputKw: number;
  storageLevelPercentage: number; // For battery systems
  gridContributionKw: number; // Amount fed back into the main grid
  status: 'Generating' | 'Idle' | 'Full Battery' | 'Fault';
}

export interface GridAnalytics {
  totalGridLoadMw: number;
  renewableEnergyRatio: number; // Percentage of total power from green sources
  activeOutages: number;
  averageConsumerEfficiency: number;
  estimatedCarbonOffsetKg: number;
}