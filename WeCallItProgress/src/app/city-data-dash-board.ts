export interface CityOverviewMetric {
  id: number;
  department: 'Utilities' | 'Transport' | 'Public Safety' | 'Environment' | 'Health';
  indicatorName: string; // e.g., "Air Quality Index", "Grid Stability"
  currentValue: number | string;
  unit: string; // e.g., "AQI", "%", "MW", "BPM"
  trend: 'Improving' | 'Stable' | 'Declining';
  lastUpdated: Date;
}

export interface CityAlert {
  id: number;
  severity: 'Info' | 'Warning' | 'Critical' | 'Emergency';
  category: 'Traffic' | 'Weather' | 'Power' | 'Security' | 'Maintenance';
  title: string;
  message: string;
  locationArea: string;
  isPubliclyVisible: boolean;
  activeStatus: 'Active' | 'Acknowledged' | 'Resolved';
  timestamp: Date;
}

export interface DistrictPerformance {
  id: number;
  districtName: string; // e.g., "Baguio Central", "Bakakeng"
  populationDensity: number;
  resourceConsumptionLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  infrastructureHealthScore: number; // 0-100
  activeServiceRequests: number; // Number of open reports (Hazard/Waste/Power)
  status: 'Operational' | 'Alert' | 'Service Interruption';
}

export interface BudgetAllocation {
  id: number;
  projectTitle: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  completionPercentage: number;
  fundingStatus: 'Approved' | 'Pending' | 'Ongoing' | 'Completed';
  fiscalYear: number;
}

export interface UnifiedCityAnalytics {
  overallCitySafetyRating: number; // 1-10
  liveCitizenEngagementCount: number; // Number of people using city apps
  totalCarbonFootprintTonnes: number;
  averageResponseTimeMinutes: number; // For emergency/maintenance services
  sustainabilityIndex: number; // 0-100
}