export interface TransportSchedule {
  id: number;
  routeNumber: string;
  departureTime: string;
  arrivalTime: string;
  vehiclePlateNumber: string;
  driverName: string;
  status: 'Scheduled' | 'On Time' | 'Delayed' | 'Cancelled';
}

export interface TransitDelayReport {
  id: number;
  commuterName: string;
  contactNumber: string;
  routeId: number;
  stopLocation: string;
  reportDate: Date;
  issueDescription: string; // e.g., 'Heavy Traffic', 'Mechanical Issue'
  status: 'Reported' | 'Verified' | 'Resolved';
  reportedAt: Date;
}

export interface VehicleLiveRoute {
  id: number;
  plateNumber: string;
  driverName: string;
  assignedRoute: string;
  upcomingStops: string[];
  actualStartTime: string;
  estimatedArrivalNextStop: string;
  currentCoordinates: string; // GPS Latitude/Longitude
  passengerLoad: number; // Current number of passengers
  status: 'In Transit' | 'At Stop' | 'Maintenance' | 'Completed';
}

export interface StationStopStatus {
  id: number;
  stopName: string;
  passengerDensity: number; // How crowded the stop is
  isAccessible: boolean;
  nextVehicleEta: string;
  status: 'Normal' | 'Crowded' | 'Overcrowded';
}

export interface TransitAnalytics {
  totalTripsToday: number;
  averageDelayMinutes: number;
  activeVehicles: number;
  totalPassengersServed: number;
  peakOccupancyRate: number;
}