export interface InfrastructureAsset {
  id: number;
  assetType: 'Road' | 'Bridge' | 'Culvert' | 'Streetlight' | 'Sidewalk';
  location: string;
  installationDate: Date;
  lastInspectionDate: Date;
  structuralIntegrityScore: number; // 0 to 100
  status: 'Operational' | 'Under Repair' | 'Needs Inspection' | 'Decommissioned';
}

export interface HazardReport {
  id: number;
  reporterName: string;
  contactNumber: string;
  hazardType: 'Pothole' | 'Broken Light' | 'Exposed Wiring' | 'Flooding' | 'Cracked Pavement';
  gpsCoordinates: string;
  description: string;
  photoUrl?: string; // Optional field for evidence
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Fixed';
  reportedAt: Date;
}

export interface MaintenanceWorkOrder {
  id: number;
  assetId: number;
  assignedTeam: string;
  contractorName?: string;
  workDescription: string;
  estimatedCost: number;
  startDate: string;
  completionDate: string;
  materialsUsed: string[];
  status: 'Scheduled' | 'On Site' | 'Paused' | 'Completed';
}

export interface InspectionLog {
  id: number;
  assetId: number;
  inspectorName: string;
  findings: string;
  requiredActions: string[];
  vulnerabilityLevel: 'Safe' | 'Minor Wear' | 'Moderate Damage' | 'Critical Failure';
  nextFollowUpDate: Date;
}

export interface InfrastructureAnalytics {
  totalAssetsMonitored: number;
  outstandingHazardReports: number;
  averageRepairTimeDays: number;
  totalMaintenanceExpenditure: number;
  networkHealthPercentage: number; // Overall quality of the city infrastructure
}