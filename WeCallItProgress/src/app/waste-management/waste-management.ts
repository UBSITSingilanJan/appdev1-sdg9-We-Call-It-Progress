import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  status: string;
}

export interface MissedPickupReport {
  id: number;
  residentName: string;
  contactNumber: string;
  barangay: string;
  address: string;
  reason: string;
  status: string;
  reportedAt: string;
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
  status: string;
}

@Component({
  selector: 'app-waste-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waste-management.html',
  styleUrls: ['./waste-management.css']
})
export class WasteManagement implements OnInit {

  private apiUrl = 'http://localhost:3000';

  schedules: GarbageCollectionSchedule[] = [];
  missedReports: MissedPickupReport[] = [];
  routes: WasteTruckRoute[] = [];

  selectedSchedule: GarbageCollectionSchedule | null = null;
  selectedReport: MissedPickupReport | null = null;
  selectedRoute: WasteTruckRoute | null = null;

  editingSchedule: GarbageCollectionSchedule | null = null;
  editingReport: MissedPickupReport | null = null;
  editingRoute: WasteTruckRoute | null = null;

  showAddSchedule = false;
  showAddReport = false;
  showAddRoute = false;

  isSubmitting = false;
  showErrorModal = false;
  errorMessageText = '';

  newSchedule = {
    barangay: '',
    collectionDay: '',
    collectionTime: '',
    truckNumber: '',
    collectorName: '',
    status: 'Scheduled'
  };

  newReport = {
    residentName: '',
    contactNumber: '',
    barangay: '',
    address: '',
    reason: '',
    status: 'Pending'
  };

  newRoute = {
    truckNumber: '',
    driverName: '',
    assignedArea: '',
    currentLocation: '',
    estimatedStartTime: '',
    estimatedEndTime: '',
    status: 'Not Started',
    routeStops: [] as string[]
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadSchedules();
    this.loadReports();
    this.loadRoutes();
  }

  loadSchedules(): void {
    this.http.get<GarbageCollectionSchedule[]>(`${this.apiUrl}/schedules`).subscribe({
      next: (data) => {
        this.schedules = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
      }
    });
  }

  loadReports(): void {
    this.http.get<MissedPickupReport[]>(`${this.apiUrl}/reports`).subscribe({
      next: (data) => {
        this.missedReports = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reports:', err);
      }
    });
  }

  loadRoutes(): void {
    this.http.get<WasteTruckRoute[]>(`${this.apiUrl}/waste-routes`).subscribe({
      next: (data) => {
        this.routes = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading routes:', err);
      }
    });
  }

  showError(message: string): void {
    this.errorMessageText = message;
    this.showErrorModal = true;
    if (message.includes('successfully')) {
      setTimeout(() => {
        this.closeErrorModal();
      }, 3000);
    }
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessageText = '';
  }

  formatDate(event: any, obj: any, field: string): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    
    if (value.length >= 2 && value.length < 4) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    } else if (value.length >= 4 && value.length < 6) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
    } else if (value.length >= 6) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
    }
    
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    obj[field] = value;
    event.target.value = value;
  }

  formatContactNumber(event: any, obj: any, field: string): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    
    if (value.length >= 4 && value.length < 7) {
      value = value.slice(0, 4) + ' ' + value.slice(4);
    } else if (value.length >= 7 && value.length < 11) {
      value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
    } else if (value.length >= 11) {
      value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
    }
    
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    
    obj[field] = value;
    event.target.value = value;
  }

  formatPlateNumber(event: any, obj: any, field: string): void {
    let value = event.target.value;
    obj[field] = value;
    event.target.value = value;
  }

  formatTimeOnlyNumbers(event: any, obj: any, field: string): void {
    let value = event.target.value;
    let selectionStart = event.target.selectionStart;
    let oldLength = value.length;
    
    let hasAMPM = value.includes('AM') || value.includes('PM');
    
    let numbersOnly = value.replace(/[^0-9]/g, '');
    
    let timeValue = '';
    if (numbersOnly.length >= 2 && numbersOnly.length < 4) {
      timeValue = numbersOnly.slice(0, 2) + ':' + numbersOnly.slice(2);
    } else if (numbersOnly.length >= 4) {
      timeValue = numbersOnly.slice(0, 2) + ':' + numbersOnly.slice(2, 4);
    } else {
      timeValue = numbersOnly;
    }
    
    let hasNewAMPM = value.toUpperCase().includes('A') || value.toUpperCase().includes('P');
    
    if (hasNewAMPM && !hasAMPM) {
      if (value.toUpperCase().includes('A')) {
        timeValue = timeValue + ' AM';
      } else if (value.toUpperCase().includes('P')) {
        timeValue = timeValue + ' PM';
      }
    } else if (hasAMPM && !hasNewAMPM) {
    } else if (hasAMPM && timeValue.length > 0 && timeValue.length <= 5) {
      if (value.includes('AM')) {
        timeValue = timeValue + ' AM';
      } else if (value.includes('PM')) {
        timeValue = timeValue + ' PM';
      }
    }
    
    if (timeValue.length > 8) {
      timeValue = timeValue.slice(0, 8);
    }
    
    obj[field] = timeValue;
    event.target.value = timeValue;
    
    let newLength = timeValue.length;
    let cursorOffset = newLength - oldLength;
    let newPosition = selectionStart + cursorOffset;
    if (newPosition < 0) newPosition = 0;
    if (newPosition <= timeValue.length) {
      event.target.setSelectionRange(newPosition, newPosition);
    }
  }

  validateDateFormat(date: string): boolean {
    if (!date) return false;
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    return dateRegex.test(date);
  }

  validateTimeFormat(time: string): boolean {
    if (!time) return false;
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    return timeRegex.test(time.trim());
  }

  addSchedule(): void {
    if (this.isSubmitting) return;
    
    if (!this.newSchedule.barangay.trim()) {
      this.showError('Please enter barangay name');
      return;
    }
    if (!this.newSchedule.collectionDay.trim()) {
      this.showError('Please enter collection date');
      return;
    }
    if (!this.validateDateFormat(this.newSchedule.collectionDay)) {
      this.showError('Please enter valid date (MM/DD/YYYY)');
      return;
    }
    if (!this.newSchedule.collectionTime.trim()) {
      this.showError('Please enter collection time');
      return;
    }
    if (!this.validateTimeFormat(this.newSchedule.collectionTime)) {
      this.showError('Please enter valid time (e.g., 9:00 AM or 2:30 PM)');
      return;
    }
    if (!this.newSchedule.truckNumber.trim()) {
      this.showError('Please enter truck plate number');
      return;
    }
    if (!this.newSchedule.collectorName.trim()) {
      this.showError('Please enter collector name');
      return;
    }

    this.isSubmitting = true;

    this.http.post(`${this.apiUrl}/schedules`, this.newSchedule).subscribe({
      next: () => {
        this.loadSchedules();
        this.resetNewSchedule();
        this.showAddSchedule = false;
        this.isSubmitting = false;
        this.showError('Schedule added successfully!');
      },
      error: (err) => {
        console.error('Error adding schedule:', err);
        this.isSubmitting = false;
        this.showError('Failed to add schedule');
      }
    });
  }

  addReport(): void {
    if (this.isSubmitting) return;
    
    if (!this.newReport.residentName.trim()) {
      this.showError('Please enter resident name');
      return;
    }
    
    if (!this.newReport.contactNumber.trim()) {
      this.showError('Please enter contact number');
      return;
    }
    
    const cleanContact = this.newReport.contactNumber.replace(/\s/g, '');
    if (cleanContact.length !== 11) {
      this.showError('Contact number must be exactly 11 digits');
      return;
    }
    
    if (!/^\d+$/.test(cleanContact)) {
      this.showError('Contact number must contain only numbers');
      return;
    }
    
    if (!this.newReport.barangay.trim()) {
      this.showError('Please enter barangay');
      return;
    }
    
    if (!this.newReport.address.trim()) {
      this.showError('Please enter address');
      return;
    }
    
    if (!this.newReport.reason.trim()) {
      this.showError('Please enter reason for missed pickup');
      return;
    }

    this.isSubmitting = true;

    const reportData = {
      ...this.newReport,
      contactNumber: cleanContact,
      reportedAt: new Date().toISOString()
    };

    this.http.post(`${this.apiUrl}/reports`, reportData).subscribe({
      next: () => {
        this.loadReports();
        this.resetNewReport();
        this.showAddReport = false;
        this.isSubmitting = false;
        this.showError('Report added successfully!');
      },
      error: (err) => {
        console.error('Error adding report:', err);
        this.isSubmitting = false;
        this.showError('Failed to add report');
      }
    });
  }

  addRoute(): void {
    if (this.isSubmitting) return;
    
    if (!this.newRoute.truckNumber.trim()) {
      this.showError('Please enter truck plate number');
      return;
    }
    if (!this.newRoute.driverName.trim()) {
      this.showError('Please enter driver name');
      return;
    }
    if (!this.newRoute.assignedArea.trim()) {
      this.showError('Please enter assigned area');
      return;
    }
    if (!this.newRoute.currentLocation.trim()) {
      this.showError('Please enter current location');
      return;
    }
    if (!this.newRoute.estimatedStartTime.trim()) {
      this.showError('Please enter estimated start time');
      return;
    }
    if (!this.validateTimeFormat(this.newRoute.estimatedStartTime)) {
      this.showError('Please enter valid start time (e.g., 9:00 AM or 2:30 PM)');
      return;
    }
    if (!this.newRoute.estimatedEndTime.trim()) {
      this.showError('Please enter estimated end time');
      return;
    }
    if (!this.validateTimeFormat(this.newRoute.estimatedEndTime)) {
      this.showError('Please enter valid end time (e.g., 9:00 AM or 2:30 PM)');
      return;
    }

    this.isSubmitting = true;

    this.http.post(`${this.apiUrl}/waste-routes`, this.newRoute).subscribe({
      next: () => {
        this.loadRoutes();
        this.resetNewRoute();
        this.showAddRoute = false;
        this.isSubmitting = false;
        this.showError('Route added successfully!');
      },
      error: (err) => {
        console.error('Error adding route:', err);
        this.isSubmitting = false;
        this.showError('Failed to add route');
      }
    });
  }

  deleteSchedule(id: number): void {
    this.http.delete(`${this.apiUrl}/schedules/${id}`).subscribe({
      next: () => {
        this.loadSchedules();
        this.showError('Schedule deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting schedule:', err);
        this.showError('Failed to delete schedule');
      }
    });
  }

  deleteReport(id: number): void {
    this.http.delete(`${this.apiUrl}/reports/${id}`).subscribe({
      next: () => {
        this.loadReports();
        this.showError('Report deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting report:', err);
        this.showError('Failed to delete report');
      }
    });
  }

  deleteRoute(id: number): void {
    this.http.delete(`${this.apiUrl}/waste-routes/${id}`).subscribe({
      next: () => {
        this.loadRoutes();
        this.showError('Route deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting route:', err);
        this.showError('Failed to delete route');
      }
    });
  }

  updateScheduleStatus(schedule: GarbageCollectionSchedule, status: string): void {
    const updated = { ...schedule, status };
    this.http.put(`${this.apiUrl}/schedules/${schedule.id}`, updated).subscribe({
      next: () => {
        this.loadSchedules();
        this.showError(`Schedule marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating schedule:', err);
        this.showError('Failed to update schedule');
      }
    });
  }

  updateReportStatus(report: MissedPickupReport, status: string): void {
    const updated = { ...report, status };
    this.http.put(`${this.apiUrl}/reports/${report.id}`, updated).subscribe({
      next: () => {
        this.loadReports();
        this.showError(`Report marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating report:', err);
        this.showError('Failed to update report');
      }
    });
  }

  updateRouteStatus(route: WasteTruckRoute, status: string): void {
    const updated = { ...route, status };
    this.http.put(`${this.apiUrl}/waste-routes/${route.id}`, updated).subscribe({
      next: () => {
        this.loadRoutes();
        this.showError(`Route marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating route:', err);
        this.showError('Failed to update route');
      }
    });
  }

  editSchedule(schedule: GarbageCollectionSchedule): void {
    this.editingSchedule = { ...schedule };
  }

  saveSchedule(): void {
    if (!this.editingSchedule) return;
    
    if (!this.editingSchedule.barangay.trim()) {
      this.showError('Barangay cannot be empty');
      return;
    }
    if (!this.editingSchedule.collectionDay.trim()) {
      this.showError('Collection date cannot be empty');
      return;
    }
    if (!this.validateDateFormat(this.editingSchedule.collectionDay)) {
      this.showError('Please enter valid date (MM/DD/YYYY)');
      return;
    }
    if (!this.editingSchedule.collectionTime.trim()) {
      this.showError('Collection time cannot be empty');
      return;
    }
    if (!this.validateTimeFormat(this.editingSchedule.collectionTime)) {
      this.showError('Please enter valid time (e.g., 9:00 AM or 2:30 PM)');
      return;
    }
    if (!this.editingSchedule.truckNumber.trim()) {
      this.showError('Truck plate number cannot be empty');
      return;
    }
    if (!this.editingSchedule.collectorName.trim()) {
      this.showError('Collector name cannot be empty');
      return;
    }
    
    this.http.put(`${this.apiUrl}/schedules/${this.editingSchedule.id}`, this.editingSchedule).subscribe({
      next: () => {
        this.loadSchedules();
        this.editingSchedule = null;
        this.showError('Schedule updated successfully!');
      },
      error: (err) => {
        console.error('Error saving schedule:', err);
        this.showError('Failed to update schedule');
      }
    });
  }

  editReport(report: MissedPickupReport): void {
    this.editingReport = { ...report };
  }

  saveReport(): void {
    if (!this.editingReport) return;
    
    if (!this.editingReport.residentName.trim()) {
      this.showError('Resident name cannot be empty');
      return;
    }
    
    if (!this.editingReport.contactNumber.trim()) {
      this.showError('Contact number cannot be empty');
      return;
    }
    
    const cleanContact = this.editingReport.contactNumber.replace(/\s/g, '');
    if (cleanContact.length !== 11) {
      this.showError('Contact number must be exactly 11 digits');
      return;
    }
    
    if (!/^\d+$/.test(cleanContact)) {
      this.showError('Contact number must contain only numbers');
      return;
    }
    
    if (!this.editingReport.barangay.trim()) {
      this.showError('Barangay cannot be empty');
      return;
    }
    if (!this.editingReport.address.trim()) {
      this.showError('Address cannot be empty');
      return;
    }
    if (!this.editingReport.reason.trim()) {
      this.showError('Reason cannot be empty');
      return;
    }
    
    const updatedReport = {
      ...this.editingReport,
      contactNumber: cleanContact
    };
    
    this.http.put(`${this.apiUrl}/reports/${this.editingReport.id}`, updatedReport).subscribe({
      next: () => {
        this.loadReports();
        this.editingReport = null;
        this.showError('Report updated successfully!');
      },
      error: (err) => {
        console.error('Error saving report:', err);
        this.showError('Failed to update report');
      }
    });
  }

  editRoute(route: WasteTruckRoute): void {
    this.editingRoute = { ...route };
  }

  saveRoute(): void {
    if (!this.editingRoute) return;
    
    if (!this.editingRoute.truckNumber.trim()) {
      this.showError('Truck plate number cannot be empty');
      return;
    }
    if (!this.editingRoute.driverName.trim()) {
      this.showError('Driver name cannot be empty');
      return;
    }
    if (!this.editingRoute.assignedArea.trim()) {
      this.showError('Assigned area cannot be empty');
      return;
    }
    if (!this.editingRoute.currentLocation.trim()) {
      this.showError('Current location cannot be empty');
      return;
    }
    if (!this.editingRoute.estimatedStartTime.trim()) {
      this.showError('Estimated start time cannot be empty');
      return;
    }
    if (!this.validateTimeFormat(this.editingRoute.estimatedStartTime)) {
      this.showError('Please enter valid start time (e.g., 9:00 AM or 2:30 PM)');
      return;
    }
    if (!this.editingRoute.estimatedEndTime.trim()) {
      this.showError('Estimated end time cannot be empty');
      return;
    }
    if (!this.validateTimeFormat(this.editingRoute.estimatedEndTime)) {
      this.showError('Please enter valid end time (e.g., 9:00 AM or 2:30 PM)');
      return;
    }
    
    this.http.put(`${this.apiUrl}/waste-routes/${this.editingRoute.id}`, this.editingRoute).subscribe({
      next: () => {
        this.loadRoutes();
        this.editingRoute = null;
        this.showError('Route updated successfully!');
      },
      error: (err) => {
        console.error('Error saving route:', err);
        this.showError('Failed to update route');
      }
    });
  }

  viewSchedule(schedule: GarbageCollectionSchedule): void {
    this.selectedSchedule = schedule;
  }

  viewReport(report: MissedPickupReport): void {
    this.selectedReport = report;
  }

  viewRoute(route: WasteTruckRoute): void {
    this.selectedRoute = route;
  }

  resetNewSchedule(): void {
    this.newSchedule = {
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
      residentName: '',
      contactNumber: '',
      barangay: '',
      address: '',
      reason: '',
      status: 'Pending'
    };
  }

  resetNewRoute(): void {
    this.newRoute = {
      truckNumber: '',
      driverName: '',
      assignedArea: '',
      currentLocation: '',
      estimatedStartTime: '',
      estimatedEndTime: '',
      status: 'Not Started',
      routeStops: []
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
    return this.missedReports.filter(r => r.status === 'Pending').length;
  }

  getCompletedSchedulesCount(): number {
    return this.schedules.filter(s => s.status === 'Completed').length;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}