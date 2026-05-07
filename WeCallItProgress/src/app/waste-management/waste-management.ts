import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Schedule {
  id: number;
  barangay: string;
  collectionDay: string;
  collectionTime: string;
  truckNumber: string;
  collectorName: string;
  status: string;
}

export interface Report {
  id: number;
  residentName: string;
  contactNumber: string;
  barangay: string;
  address: string;
  missedDate: string;
  reason: string;
  status: string;
  reportedAt: string;
}

export interface Route {
  id: number;
  truckNumber: string;
  driverName: string;
  assignedArea: string;
  routeStops: string[];
  estimatedStartTime: string;
  estimatedEndTime: string;
  currentLocation: string;
  status: string;
}

@Component({
  selector: 'app-waste-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waste-management.html',
  styleUrls: ['./waste-management.css']
})
export class WasteManagement implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:3000';
  private refreshInterval: any;

  schedules: Schedule[] = [];
  reports: Report[] = [];
  routes: Route[] = [];

  selectedSchedule: Schedule | null = null;
  selectedReport: Report | null = null;
  selectedRoute: Route | null = null;

  editingSchedule: Schedule | null = null;
  editingReport: Report | null = null;
  editingRoute: Route | null = null;

  showAddSchedule = false;
  showAddReport = false;
  showAddRoute = false;

  newSchedule: Schedule = {
    id: 0,
    barangay: '',
    collectionDay: '',
    collectionTime: '',
    truckNumber: '',
    collectorName: '',
    status: 'Scheduled'
  };

  newReport: Report = {
    id: 0,
    residentName: '',
    contactNumber: '',
    barangay: '',
    address: '',
    missedDate: new Date().toISOString(),
    reason: '',
    status: 'Pending',
    reportedAt: new Date().toISOString()
  };

  newRoute: Route = {
    id: 0,
    truckNumber: '',
    driverName: '',
    assignedArea: '',
    routeStops: [],
    estimatedStartTime: '',
    estimatedEndTime: '',
    currentLocation: '',
    status: 'Not Started'
  };

  loading = {
    schedules: false,
    reports: false,
    routes: false
  };

  error = {
    schedules: '',
    reports: '',
    routes: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
  this.loadAllData();
  this.startAutoRefresh();
}

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadAllData();
    }, 30000);
  }

  loadAllData(): void {
    this.loadSchedules();
    this.loadReports();
    this.loadRoutes();
  }

  loadSchedules(): void {
    this.loading.schedules = true;
    this.http.get<Schedule[]>(`${this.apiUrl}/schedules`).subscribe({
      next: (data) => {
        this.schedules = data;
        this.loading.schedules = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.error.schedules = 'Failed to load schedules';
        this.loading.schedules = false;
      }
    });
  }

  loadReports(): void {
    this.loading.reports = true;
    this.http.get<Report[]>(`${this.apiUrl}/reports`).subscribe({
      next: (data) => {
        this.reports = data;
        this.loading.reports = false;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error.reports = 'Failed to load reports';
        this.loading.reports = false;
      }
    });
  }

  loadRoutes(): void {
    this.loading.routes = true;
    this.http.get<Route[]>(`${this.apiUrl}/routes`).subscribe({
      next: (data) => {
        this.routes = data;
        this.loading.routes = false;
      },
      error: (err) => {
        console.error('Error loading routes:', err);
        this.error.routes = 'Failed to load routes';
        this.loading.routes = false;
      }
    });
  }

  addSchedule(): void {
    if (!this.newSchedule.barangay || !this.newSchedule.collectionDay) {
      alert('Please fill in all required fields');
      return;
    }
    this.http.post(`${this.apiUrl}/schedules`, this.newSchedule).subscribe({
      next: () => {
        this.loadSchedules();
        this.showAddSchedule = false;
        this.resetNewSchedule();
        alert('Schedule added successfully');
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to add schedule');
      }
    });
  }

  addReport(): void {
    if (!this.newReport.residentName || !this.newReport.barangay) {
      alert('Please fill in all required fields');
      return;
    }
    const reportToSend = {
      ...this.newReport,
      missedDate: new Date().toISOString(),
      reportedAt: new Date().toISOString()
    };
    this.http.post(`${this.apiUrl}/reports`, reportToSend).subscribe({
      next: () => {
        this.loadReports();
        this.showAddReport = false;
        this.resetNewReport();
        alert('Report added successfully');
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to add report');
      }
    });
  }

  addRoute(): void {
    if (!this.newRoute.truckNumber || !this.newRoute.driverName) {
      alert('Please fill in all required fields');
      return;
    }
    this.http.post(`${this.apiUrl}/routes`, this.newRoute).subscribe({
      next: () => {
        this.loadRoutes();
        this.showAddRoute = false;
        this.resetNewRoute();
        alert('Route added successfully');
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to add route');
      }
    });
  }

  deleteSchedule(id: number): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.http.delete(`${this.apiUrl}/schedules/${id}`).subscribe({
        next: () => {
          this.loadSchedules();
          alert('Schedule deleted successfully');
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Failed to delete schedule');
        }
      });
    }
  }

  deleteReport(id: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.http.delete(`${this.apiUrl}/reports/${id}`).subscribe({
        next: () => {
          this.loadReports();
          alert('Report deleted successfully');
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Failed to delete report');
        }
      });
    }
  }

  deleteRoute(id: number): void {
    if (confirm('Are you sure you want to delete this route?')) {
      this.http.delete(`${this.apiUrl}/routes/${id}`).subscribe({
        next: () => {
          this.loadRoutes();
          alert('Route deleted successfully');
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Failed to delete route');
        }
      });
    }
  }

  updateScheduleStatus(schedule: Schedule, newStatus: string): void {
    const updated = { ...schedule, status: newStatus };
    this.http.put(`${this.apiUrl}/schedules/${schedule.id}`, updated).subscribe({
      next: () => { this.loadSchedules(); },
      error: (err) => { console.error('Error:', err); }
    });
  }

  updateReportStatus(report: Report, newStatus: string): void {
    const updated = { ...report, status: newStatus };
    this.http.put(`${this.apiUrl}/reports/${report.id}`, updated).subscribe({
      next: () => { this.loadReports(); },
      error: (err) => { console.error('Error:', err); }
    });
  }

  updateRouteStatus(route: Route, newStatus: string): void {
    const updated = { ...route, status: newStatus };
    this.http.put(`${this.apiUrl}/routes/${route.id}`, updated).subscribe({
      next: () => { this.loadRoutes(); },
      error: (err) => { console.error('Error:', err); }
    });
  }

  editSchedule(schedule: Schedule): void {
    this.editingSchedule = { ...schedule };
  }

  saveSchedule(): void {
    if (this.editingSchedule) {
      this.http.put(`${this.apiUrl}/schedules/${this.editingSchedule.id}`, this.editingSchedule).subscribe({
        next: () => {
          this.loadSchedules();
          this.editingSchedule = null;
          alert('Schedule updated successfully');
        },
        error: (err) => { console.error('Error:', err); }
      });
    }
  }

  editReport(report: Report): void {
    this.editingReport = { ...report };
  }

  saveReport(): void {
    if (this.editingReport) {
      this.http.put(`${this.apiUrl}/reports/${this.editingReport.id}`, this.editingReport).subscribe({
        next: () => {
          this.loadReports();
          this.editingReport = null;
          alert('Report updated successfully');
        },
        error: (err) => { console.error('Error:', err); }
      });
    }
  }

  editRoute(route: Route): void {
    this.editingRoute = { ...route };
  }

  saveRoute(): void {
    if (this.editingRoute) {
      this.http.put(`${this.apiUrl}/routes/${this.editingRoute.id}`, this.editingRoute).subscribe({
        next: () => {
          this.loadRoutes();
          this.editingRoute = null;
          alert('Route updated successfully');
        },
        error: (err) => { console.error('Error:', err); }
      });
    }
  }

  viewSchedule(schedule: Schedule): void {
    this.selectedSchedule = schedule;
  }

  viewReport(report: Report): void {
    this.selectedReport = report;
  }

  viewRoute(route: Route): void {
    this.selectedRoute = route;
  }

  resetNewSchedule(): void {
    this.newSchedule = {
      id: 0,
      barangay: '',
      collectionDay: '',
      collectionTime: '',
      truckNumber: '',
      collectorName: '',
      status: 'Scheduled'
    };
  }

  resetNewReport(): void {
    this.newReport = {
      id: 0,
      residentName: '',
      contactNumber: '',
      barangay: '',
      address: '',
      missedDate: new Date().toISOString(),
      reason: '',
      status: 'Pending',
      reportedAt: new Date().toISOString()
    };
  }

  resetNewRoute(): void {
    this.newRoute = {
      id: 0,
      truckNumber: '',
      driverName: '',
      assignedArea: '',
      routeStops: [],
      estimatedStartTime: '',
      estimatedEndTime: '',
      currentLocation: '',
      status: 'Not Started'
    };
  }

  closeModals(): void {
    this.selectedSchedule = null;
    this.selectedReport = null;
    this.selectedRoute = null;
    this.editingSchedule = null;
    this.editingReport = null;
    this.editingRoute = null;
    this.showAddSchedule = false;
    this.showAddReport = false;
    this.showAddRoute = false;
  }

  getPendingReportsCount(): number {
    return this.reports.filter(r => r.status === 'Pending').length;
  }

  getCompletedSchedulesCount(): number {
    return this.schedules.filter(s => s.status === 'Completed').length;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}