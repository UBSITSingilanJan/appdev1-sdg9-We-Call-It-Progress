import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface GarbageCollectionSchedule {
  id: number;
  barangay: string;
  collectionDay: string;
  collectionTime: string;
  truckNumber: string;
  collectorName: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Missed';
}

@Component({
  selector: 'app-waste-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waste-management.component.html',
})
export class WasteManagementComponent {
  searchTerm = '';

  schedules: GarbageCollectionSchedule[] = [
    {
      id: 1,
      barangay: 'Muzon',
      collectionDay: 'Monday',
      collectionTime: '8:00 AM',
      truckNumber: 'WM-101',
      collectorName: 'Team A',
      status: 'Scheduled',
    },
    {
      id: 2,
      barangay: 'Sapang Palay',
      collectionDay: 'Tuesday',
      collectionTime: '9:00 AM',
      truckNumber: 'WM-202',
      collectorName: 'Team B',
      status: 'Ongoing',
    },
    {
      id: 3,
      barangay: 'Tungkong Mangga',
      collectionDay: 'Wednesday',
      collectionTime: '7:30 AM',
      truckNumber: 'WM-303',
      collectorName: 'Team C',
      status: 'Completed',
    },
  ];

  get filteredSchedules() {
    return this.schedules.filter((schedule) =>
      schedule.barangay.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}