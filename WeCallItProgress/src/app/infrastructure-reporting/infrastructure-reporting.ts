import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface InfrastructureIssue {
  id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'In Progress' | 'Resolved' | 'Closed';
  reportedBy: string;
  contactNumber: string;
  reportedAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface MaintenanceTeam {
  id: number;
  teamName: string;
  assignedArea: string;
  members: number;
  status: 'Available' | 'Busy' | 'Off Duty';
}

@Component({
  selector: 'app-infrastructure-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './infrastructure-reporting.html',
  styleUrls: ['./infrastructure-reporting.css']
})
export class InfrastructureReporting implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:3000';
  private refreshInterval: any;

  issues: InfrastructureIssue[] = [];
  teams: MaintenanceTeam[] = [];

  selectedIssue: InfrastructureIssue | null = null;
  editingIssue: InfrastructureIssue | null = null;

  showAddIssue = false;
  showFilters = false;

  newIssue: InfrastructureIssue = {
    id: 0,
    title: '',
    location: '',
    category: 'Road',
    description: '',
    severity: 'Medium',
    status: 'Reported',
    reportedBy: '',
    contactNumber: '',
    reportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  filters = {
    category: 'all',
    severity: 'all',
    status: 'all'
  };

  categories = ['Road', 'Bridge', 'Building', 'Water Supply', 'Electricity', 'Drainage', 'Street Light', 'Other'];
  severities = ['Low', 'Medium', 'High', 'Critical'];
  statuses = ['Reported', 'In Progress', 'Resolved', 'Closed'];

  stats = {
    total: 0,
    reported: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
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
    this.loadIssues();
    this.loadTeams();
  }

  loadIssues(): void {
    this.http.get<InfrastructureIssue[]>(`${this.apiUrl}/infrastructure-issues`).subscribe({
      next: (data) => {
        this.issues = data;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error loading issues:', err);
        if (err.status === 404) {
          this.loadSampleIssues();
        }
      }
    });
  }

  loadTeams(): void {
    this.http.get<MaintenanceTeam[]>(`${this.apiUrl}/maintenance-teams`).subscribe({
      next: (data) => {
        this.teams = data;
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        if (err.status === 404) {
          this.loadSampleTeams();
        }
      }
    });
  }

  loadSampleIssues(): void {
    this.issues = [
      {
        id: 1,
        title: 'Pothole on Main Street',
        location: 'Main Street, Barangay Central',
        category: 'Road',
        description: 'Large pothole causing traffic congestion',
        severity: 'High',
        status: 'In Progress',
        reportedBy: 'Juan Dela Cruz',
        contactNumber: '09123456789',
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Broken Street Light',
        location: 'Corner of 5th Ave and Rizal St',
        category: 'Street Light',
        description: 'Street light not working for 3 days',
        severity: 'Medium',
        status: 'Reported',
        reportedBy: 'Maria Santos',
        contactNumber: '09123456780',
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Flooded Drainage',
        location: 'Barangay San Lorenzo',
        category: 'Drainage',
        description: 'Clogged drainage causing flooding',
        severity: 'Critical',
        status: 'In Progress',
        reportedBy: 'Ramon Garcia',
        contactNumber: '09123456781',
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.calculateStats();
  }

  loadSampleTeams(): void {
    this.teams = [
      { id: 1, teamName: 'Road Maintenance Unit', assignedArea: 'North District', members: 8, status: 'Available' },
      { id: 2, teamName: 'Electrical Team', assignedArea: 'All Districts', members: 5, status: 'Busy' },
      { id: 3, teamName: 'Drainage & Flood Control', assignedArea: 'South District', members: 6, status: 'Available' }
    ];
  }

  calculateStats(): void {
    this.stats.total = this.issues.length;
    this.stats.reported = this.issues.filter(i => i.status === 'Reported').length;
    this.stats.inProgress = this.issues.filter(i => i.status === 'In Progress').length;
    this.stats.resolved = this.issues.filter(i => i.status === 'Resolved').length;
    this.stats.critical = this.issues.filter(i => i.severity === 'Critical').length;
  }

  getFilteredIssues(): InfrastructureIssue[] {
    let filtered = this.issues;
    
    if (this.filters.category !== 'all') {
      filtered = filtered.filter(i => i.category === this.filters.category);
    }
    if (this.filters.severity !== 'all') {
      filtered = filtered.filter(i => i.severity === this.filters.severity);
    }
    if (this.filters.status !== 'all') {
      filtered = filtered.filter(i => i.status === this.filters.status);
    }
    
    return filtered;
  }

  addIssue(): void {
    if (!this.newIssue.title || !this.newIssue.location || !this.newIssue.reportedBy) {
      alert('Please fill in all required fields');
      return;
    }

    const issueToSend = {
      ...this.newIssue,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.http.post(`${this.apiUrl}/infrastructure-issues`, issueToSend).subscribe({
      next: () => {
        this.loadIssues();
        this.showAddIssue = false;
        this.resetNewIssue();
        alert('Issue reported successfully');
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to report issue');
      }
    });
  }

  updateIssueStatus(issue: InfrastructureIssue, newStatus: string): void {
    const updated = { 
      ...issue, 
      status: newStatus as any,
      updatedAt: new Date().toISOString()
    };
    this.http.put(`${this.apiUrl}/infrastructure-issues/${issue.id}`, updated).subscribe({
      next: () => { 
        this.loadIssues();
        alert(`Issue marked as ${newStatus}`);
      },
      error: (err) => { console.error('Error:', err); }
    });
  }

  editIssue(issue: InfrastructureIssue): void {
    this.editingIssue = { ...issue };
  }

  saveIssue(): void {
    if (this.editingIssue) {
      const updated = {
        ...this.editingIssue,
        updatedAt: new Date().toISOString()
      };
      this.http.put(`${this.apiUrl}/infrastructure-issues/${this.editingIssue.id}`, updated).subscribe({
        next: () => {
          this.loadIssues();
          this.editingIssue = null;
          alert('Issue updated successfully');
        },
        error: (err) => { console.error('Error:', err); }
      });
    }
  }

  deleteIssue(id: number): void {
    if (confirm('Are you sure you want to delete this issue?')) {
      this.http.delete(`${this.apiUrl}/infrastructure-issues/${id}`).subscribe({
        next: () => {
          this.loadIssues();
          alert('Issue deleted successfully');
        },
        error: (err) => { console.error('Error:', err); }
      });
    }
  }

  viewIssue(issue: InfrastructureIssue): void {
    this.selectedIssue = issue;
  }

  getSeverityColor(severity: string): string {
    switch(severity) {
      case 'Low': return '#22c55e';
      case 'Medium': return '#f97316';
      case 'High': return '#ef4444';
      case 'Critical': return '#7c2d12';
      default: return '#94a3b8';
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Reported': return '#ef4444';
      case 'In Progress': return '#f97316';
      case 'Resolved': return '#22c55e';
      case 'Closed': return '#6b7280';
      default: return '#94a3b8';
    }
  }

  getTeamStatusColor(status: string): string {
    switch(status) {
      case 'Available': return '#22c55e';
      case 'Busy': return '#ef4444';
      case 'Off Duty': return '#6b7280';
      default: return '#94a3b8';
    }
  }

  resetNewIssue(): void {
    this.newIssue = {
      id: 0,
      title: '',
      location: '',
      category: 'Road',
      description: '',
      severity: 'Medium',
      status: 'Reported',
      reportedBy: '',
      contactNumber: '',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  resetFilters(): void {
    this.filters = {
      category: 'all',
      severity: 'all',
      status: 'all'
    };
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}