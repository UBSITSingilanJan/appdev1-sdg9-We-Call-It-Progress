import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface WasteCollectionSchedule {
  id: number;
  zone: string;
  collectionDay: string;
  collectionTime: string;
  wasteType: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface MissedPickupReport {
  id: number;
  residentName: string;
  address: string;
  zone: string;
  missedDate: string;
  issue: string;
  status: 'Pending' | 'Investigating' | 'Resolved';
}

export interface WasteTruckRoute {
  id: number;
  truckNumber: string;
  driverName: string;
  assignedZone: string;
  currentStatus: 'Active' | 'Delayed' | 'Completed';
  estimatedCompletion: string;
}

export interface RecyclingStatistic {
  id: number;
  category: string;
  amountCollected: number;
  targetAmount: number;
}

@Component({
  selector: 'app-smart-waste-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waste-management.html',
  styleUrl: './waste-management.css'
})
export class WasteManagement {
  schedules: WasteCollectionSchedule[] = [
    {
      id: 1,
      zone: 'Zone A',
      collectionDay: 'Monday',
      collectionTime: '8:00 AM',
      wasteType: 'Biodegradable',
      status: 'Scheduled'
    },
    {
      id: 2,
      zone: 'Zone B',
      collectionDay: 'Wednesday',
      collectionTime: '10:00 AM',
      wasteType: 'Recyclable',
      status: 'In Progress'
    }
  ];

  missedReports: MissedPickupReport[] = [
    {
      id: 1,
      residentName: 'Juan Dela Cruz',
      address: 'Block 12 Lot 4',
      zone: 'Zone C',
      missedDate: '2026-04-20',
      issue: 'Truck did not arrive',
      status: 'Pending'
    },
    {
      id: 2,
      residentName: 'Maria Santos',
      address: 'Purok 5',
      zone: 'Zone A',
      missedDate: '2026-04-21',
      issue: 'Garbage left behind',
      status: 'Resolved'
    }
  ];

  routes: WasteTruckRoute[] = [
    {
      id: 1,
      truckNumber: 'WT-101',
      driverName: 'Pedro Reyes',
      assignedZone: 'Zone A',
      currentStatus: 'Active',
      estimatedCompletion: '2:00 PM'
    },
    {
      id: 2,
      truckNumber: 'WT-205',
      driverName: 'Ana Cruz',
      assignedZone: 'Zone B',
      currentStatus: 'Delayed',
      estimatedCompletion: '4:30 PM'
    }
  ];

  recyclingStats: RecyclingStatistic[] = [
    {
      id: 1,
      category: 'Plastic',
      amountCollected: 120,
      targetAmount: 150
    },
    {
      id: 2,
      category: 'Paper',
      amountCollected: 90,
      targetAmount: 100
    },
    {
      id: 3,
      category: 'Metal',
      amountCollected: 60,
      targetAmount: 80
    }
  ];

  selectedSchedule: WasteCollectionSchedule | null = null;
  selectedReport: MissedPickupReport | null = null;
  selectedRoute: WasteTruckRoute | null = null;

  editingSchedule: WasteCollectionSchedule | null = null;
  editingReport: MissedPickupReport | null = null;
  editingRoute: WasteTruckRoute | null = null;

  showAddScheduleModal = false;
  showAddReportModal = false;
  showAddRouteModal = false;

  newSchedule: WasteCollectionSchedule = {
    id: 0,
    zone: '',
    collectionDay: '',
    collectionTime: '',
    wasteType: '',
    status: 'Scheduled'
  };

  newReport: MissedPickupReport = {
    id: 0,
    residentName: '',
    address: '',
    zone: '',
    missedDate: '',
    issue: '',
    status: 'Pending'
  };

  newRoute: WasteTruckRoute = {
    id: 0,
    truckNumber: '',
    driverName: '',
    assignedZone: '',
    currentStatus: 'Active',
    estimatedCompletion: ''
  };

  showScheduleDetails(schedule: WasteCollectionSchedule) {
    this.selectedSchedule = schedule;
  }

  showReportDetails(report: MissedPickupReport) {
    this.selectedReport = report;
  }

  showRouteDetails(route: WasteTruckRoute) {
    this.selectedRoute = route;
  }

  markScheduleCompleted(schedule: WasteCollectionSchedule) {
    schedule.status = 'Completed';
  }

  resolveReport(report: MissedPickupReport) {
    report.status = 'Resolved';
  }

  markRouteCompleted(route: WasteTruckRoute) {
    route.currentStatus = 'Completed';
  }

  editSchedule(schedule: WasteCollectionSchedule) {
    this.editingSchedule = { ...schedule };
  }

  saveSchedule() {
    if (this.editingSchedule) {
      const index = this.schedules.findIndex(
        s => s.id === this.editingSchedule!.id
      );

      if (index !== -1) {
        this.schedules[index] = { ...this.editingSchedule };
      }

      this.editingSchedule = null;
    }
  }

  editReport(report: MissedPickupReport) {
    this.editingReport = { ...report };
  }

  saveReport() {
    if (this.editingReport) {
      const index = this.missedReports.findIndex(
        r => r.id === this.editingReport!.id
      );

      if (index !== -1) {
        this.missedReports[index] = { ...this.editingReport };
      }

      this.editingReport = null;
    }
  }

  editRoute(route: WasteTruckRoute) {
    this.editingRoute = { ...route };
  }

  saveRoute() {
    if (this.editingRoute) {
      const index = this.routes.findIndex(
        r => r.id === this.editingRoute!.id
      );

      if (index !== -1) {
        this.routes[index] = { ...this.editingRoute };
      }

      this.editingRoute = null;
    }
  }

  addSchedule() {
    this.schedules.push({
      ...this.newSchedule,
      id: this.schedules.length + 1
    });

    this.newSchedule = {
      id: 0,
      zone: '',
      collectionDay: '',
      collectionTime: '',
      wasteType: '',
      status: 'Scheduled'
    };

    this.showAddScheduleModal = false;
  }

  addReport() {
    this.missedReports.push({
      ...this.newReport,
      id: this.missedReports.length + 1
    });

    this.newReport = {
      id: 0,
      residentName: '',
      address: '',
      zone: '',
      missedDate: '',
      issue: '',
      status: 'Pending'
    };

    this.showAddReportModal = false;
  }

  addRoute() {
    this.routes.push({
      ...this.newRoute,
      id: this.routes.length + 1
    });

    this.newRoute = {
      id: 0,
      truckNumber: '',
      driverName: '',
      assignedZone: '',
      currentStatus: 'Active',
      estimatedCompletion: ''
    };

    this.showAddRouteModal = false;
  }
}