export interface TrafficSignalPhase {
  id: number;
  intersectionName: string;
  currentPhase: 'Green' | 'Yellow' | 'Red' | 'Flashing';
  durationSeconds: number;
  isEmergencyOverride: boolean; // For ambulances/fire trucks
  pedestrianRequestActive: boolean;
  lastChanged: Date;
}

export interface TrafficIncidentReport {
  id: number;
  reporterSource: 'Sensor' | 'CCTV' | 'User' | 'Emergency Services';
  location: string;
  incidentType: 'Accident' | 'Roadworks' | 'Stalled Vehicle' | 'Debris';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  laneClosureCount: number;
  status: 'Active' | 'Under Investigation' | 'Clearing' | 'Resolved';
  reportedAt: Date;
}

export interface RoadSegmentFlow {
  id: number;
  segmentName: string; // e.g., "Session Road Northbound"
  averageSpeedKph: number;
  vehicleCount: number;
  congestionLevel: number; // 0 (Empty) to 100 (Bumper-to-bumper)
  travelTimeIndex: number; // Ratio of current travel time vs free-flow
  weatherConditions: 'Clear' | 'Rainy' | 'Foggy';
  status: 'Fluid' | 'Slow' | 'Heavy' | 'Gridlock';
}

export interface SmartParkingZone {
  id: number;
  zoneName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  hourlyRate: number;
  evChargingAvailable: boolean;
  status: 'Available' | 'Limited' | 'Full';
}

export interface TrafficNetworkAnalytics {
  peakHourVolume: number;
  averageCommuteTimeMinutes: number;
  activeIncidents: number;
  carbonEmissionEstimateKg: number;
  signalEfficiencyRating: number; // Percentage of optimized traffic flow
}