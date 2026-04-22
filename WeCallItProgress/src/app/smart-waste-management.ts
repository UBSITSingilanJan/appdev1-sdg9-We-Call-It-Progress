export interface GarbageCollectionSchedule {
  id: number;
  barangay: string;
  collectionDay: string;
  collectionTime: string;
  truckNumber: string;
  collectorName: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Missed';
}

export interface MissedPickupReport {
  id: number;
  residentName: string;
  contactNumber: string;
  barangay: string;
  address: string;
  missedDate: Date;
  reason: string;
  status: 'Pending' | 'Investigating' | 'Resolved';
  reportedAt: Date;
}

export interface WasteTruckRoute {
  id: number;
  truckNumber: string;
  driverName: string;
  assignedArea: string;
  routeStops: string[];
  estimatedStartTime: string;
  estimatedEndTime: string;
  currentLocation: string;
  fuelLevel: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface WasteBinStatus {
  id: number;
  location: string;
  fillLevel: number;
  wasteType: 'Biodegradable' | 'Non-Biodegradable' | 'Recyclable';
  lastCollected: Date;
  status: 'Normal' | 'Almost Full' | 'Full';
}

export interface WasteCollectionAnalytics {
  totalPickupsToday: number;
  missedPickupsToday: number;
  activeTrucks: number;
  completedRoutes: number;
  totalWasteCollectedKg: number;
}