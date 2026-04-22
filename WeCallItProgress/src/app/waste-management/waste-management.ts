import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

@Component({
  selector: 'app-smart-waste-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waste-management.html',
  styleUrl: './waste-management.css'
})
export class WasteManagement implements OnInit {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  schedules: GarbageCollectionSchedule[] = [];
  missedReports: MissedPickupReport[] = [];
  routes: WasteTruckRoute[] = [];
  binStatuses: WasteBinStatus[] = [];
  analytics: WasteCollectionAnalytics | null = null;

  selectedSchedule: GarbageCollectionSchedule | null = null;
  selectedReport: MissedPickupReport | null = null;
  selectedRoute: WasteTruckRoute | null = null;

  editingSchedule: GarbageCollectionSchedule | null = null;
  editingReport: MissedPickupReport | null = null;
  editingRoute: WasteTruckRoute | null = null;

  showAddScheduleModal = false;
  showAddReportModal = false;
  showAddRouteModal = false;

  newSchedule: GarbageCollectionSchedule = {
    id: 0,
    barangay: '',
    collectionDay: '',
    collectionTime: '',
    truckNumber: '',
    collectorName: '',
    status: 'Scheduled'
  };

  newReport: MissedPickupReport = {
    id: 0,
    residentName: '',
    contactNumber: '',
    barangay: '',
    address: '',
    missedDate: new Date(),
    reason: '',
    status: 'Pending',
    reportedAt: new Date()
  };

  newRoute: WasteTruckRoute = {
    id: 0,
    truckNumber: '',
    driverName: '',
    assignedArea: '',
    routeStops: [],
    estimatedStartTime: '',
    estimatedEndTime: '',
    currentLocation: '',
    fuelLevel: 100,
    status: 'Not Started'
  };

  ngOnInit(): void {
    this.loadSchedules();
    this.loadReports();
    this.loadRoutes();
    this.loadBinStatuses();
    this.loadAnalytics();
  }

  loadSchedules(): void {
    this.http.get<GarbageCollectionSchedule[]>(`${this.apiUrl}/schedules`)
      .subscribe(data => {
        this.schedules = data;
      });
  }

  loadReports(): void {
    this.http.get<MissedPickupReport[]>(`${this.apiUrl}/reports`)
      .subscribe(data => {
        this.missedReports = data;
      });
  }

  loadRoutes(): void {
    this.http.get<WasteTruckRoute[]>(`${this.apiUrl}/routes`)
      .subscribe(data => {
        this.routes = data;
      });
  }

  loadBinStatuses(): void {
    this.http.get<WasteBinStatus[]>(`${this.apiUrl}/bins`)
      .subscribe(data => {
        this.binStatuses = data;
      });
  }

  loadAnalytics(): void {
    this.http.get<WasteCollectionAnalytics>(`${this.apiUrl}/analytics`)
      .subscribe(data => {
        this.analytics = data;
      });
  }

  showScheduleDetails(schedule: GarbageCollectionSchedule): void {
    this.selectedSchedule = { ...schedule };
  }

  showReportDetails(report: MissedPickupReport): void {
    this.selectedReport = { ...report };
  }

  showRouteDetails(route: WasteTruckRoute): void {
    this.selectedRoute = { ...route };
  }

  markScheduleCompleted(schedule: GarbageCollectionSchedule): void {
    const updatedSchedule = {
      ...schedule,
      status: 'Completed' as const
    };

    this.http.put(`${this.apiUrl}/schedules/${schedule.id}`, updatedSchedule)
      .subscribe(() => {
        this.loadSchedules();
      });
  }

  resolveReport(report: MissedPickupReport): void {
    const updatedReport = {
      ...report,
      status: 'Resolved' as const
    };

    this.http.put(`${this.apiUrl}/reports/${report.id}`, updatedReport)
      .subscribe(() => {
        this.loadReports();
      });
  }

  markRouteCompleted(route: WasteTruckRoute): void {
    const updatedRoute = {
      ...route,
      status: 'Completed' as const
    };

    this.http.put(`${this.apiUrl}/routes/${route.id}`, updatedRoute)
      .subscribe(() => {
        this.loadRoutes();
      });
  }

  editSchedule(schedule: GarbageCollectionSchedule): void {
    this.editingSchedule = { ...schedule };
  }

  saveSchedule(): void {
    if (!this.editingSchedule) return;

    this.http.put(
      `${this.apiUrl}/schedules/${this.editingSchedule.id}`,
      this.editingSchedule
    ).subscribe(() => {
      this.loadSchedules();
      this.editingSchedule = null;
    });
  }

  editReport(report: MissedPickupReport): void {
    this.editingReport = { ...report };
  }

  saveReport(): void {
    if (!this.editingReport) return;

    this.http.put(
      `${this.apiUrl}/reports/${this.editingReport.id}`,
      this.editingReport
    ).subscribe(() => {
      this.loadReports();
      this.editingReport = null;
    });
  }

  editRoute(route: WasteTruckRoute): void {
    this.editingRoute = { ...route };
  }

  saveRoute(): void {
    if (!this.editingRoute) return;

    this.http.put(
      `${this.apiUrl}/routes/${this.editingRoute.id}`,
      this.editingRoute
    ).subscribe(() => {
      this.loadRoutes();
      this.editingRoute = null;
    });
  }

  addSchedule(): void {
    this.http.post(`${this.apiUrl}/schedules`, this.newSchedule)
      .subscribe(() => {
        this.loadSchedules();

        this.newSchedule = {
          id: 0,
          barangay: '',
          collectionDay: '',
          collectionTime: '',
          truckNumber: '',
          collectorName: '',
          status: 'Scheduled'
        };

        this.showAddScheduleModal = false;
      });
  }

  addReport(): void {
    this.http.post(`${this.apiUrl}/reports`, this.newReport)
      .subscribe(() => {
        this.loadReports();

        this.newReport = {
          id: 0,
          residentName: '',
          contactNumber: '',
          barangay: '',
          address: '',
          missedDate: new Date(),
          reason: '',
          status: 'Pending',
          reportedAt: new Date()
        };

        this.showAddReportModal = false;
      });
  }

  addRoute(): void {
    this.http.post(`${this.apiUrl}/routes`, this.newRoute)
      .subscribe(() => {
        this.loadRoutes();

        this.newRoute = {
          id: 0,
          truckNumber: '',
          driverName: '',
          assignedArea: '',
          routeStops: [],
          estimatedStartTime: '',
          estimatedEndTime: '',
          currentLocation: '',
          fuelLevel: 100,
          status: 'Not Started'
        };

        this.showAddRouteModal = false;
      });
  }

  deleteSchedule(id: number): void {
    this.http.delete(`${this.apiUrl}/schedules/${id}`)
      .subscribe(() => {
        this.loadSchedules();
      });
  }

  deleteReport(id: number): void {
    this.http.delete(`${this.apiUrl}/reports/${id}`)
      .subscribe(() => {
        this.loadReports();
      });
  }

  deleteRoute(id: number): void {
    this.http.delete(`${this.apiUrl}/routes/${id}`)
      .subscribe(() => {
        this.loadRoutes();
      });
  }

  closeModals(): void {
    this.selectedSchedule = null;
    this.selectedReport = null;
    this.selectedRoute = null;
    this.editingSchedule = null;
    this.editingReport = null;
    this.editingRoute = null;
    this.showAddScheduleModal = false;
    this.showAddReportModal = false;
    this.showAddRouteModal = false;
  }
}