import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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

  selectedIssue: InfrastructureIssue | null = null;
  editingIssue: InfrastructureIssue | null = null;

  showAddIssue = false;
  showFilters = false;
  showErrorModal = false;
  errorMessageText = '';
  isSuccessMessage: boolean = false;
  showDeleteModal = false;
  deleteIssueId: number | null = null;
  deleteIssueTitle: string = '';

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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.startAutoRefresh();
    this.adjustHeight();
    window.addEventListener('resize', () => this.adjustHeight());
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('resize', () => this.adjustHeight());
  }

  adjustHeight(): void {
    setTimeout(() => {
      const dashboard = document.querySelector('.infrastructure-dashboard') as HTMLElement;
      if (dashboard) {
        dashboard.style.minHeight = window.innerHeight + 'px';
      }
    }, 100);
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadAllData();
    }, 30000);
  }

  loadAllData(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.http.get<InfrastructureIssue[]>(`${this.apiUrl}/infrastructure-issues`).subscribe({
      next: (data) => {
        this.issues = data;
        this.calculateStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading issues:', err);
        this.cdr.detectChanges();
      }
    });
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

  showSuccess(message: string): void {
    this.errorMessageText = message;
    this.isSuccessMessage = true;
    this.showErrorModal = true;
    setTimeout(() => {
      this.closeErrorModal();
    }, 3000);
  }

  showError(message: string): void {
    this.errorMessageText = message;
    this.isSuccessMessage = false;
    this.showErrorModal = true;
    setTimeout(() => {
      this.closeErrorModal();
    }, 3000);
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessageText = '';
    this.isSuccessMessage = false;
  }

  confirmDelete(id: number, title: string): void {
    this.deleteIssueId = id;
    this.deleteIssueTitle = title;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteIssueId = null;
    this.deleteIssueTitle = '';
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

  addIssue(): void {
    if (!this.newIssue.title || !this.newIssue.location || !this.newIssue.reportedBy) {
      this.showError('Please fill in all required fields');
      return;
    }

    if (this.newIssue.contactNumber) {
      const cleanContact = this.newIssue.contactNumber.replace(/\s/g, '');
      if (cleanContact.length !== 0 && cleanContact.length !== 11) {
        this.showError('Contact number must be exactly 11 digits or empty');
        return;
      }
      if (cleanContact.length === 11 && !/^\d+$/.test(cleanContact)) {
        this.showError('Contact number must contain only numbers');
        return;
      }
    }

    const issueToSend = {
      title: this.newIssue.title,
      location: this.newIssue.location,
      category: this.newIssue.category,
      description: this.newIssue.description,
      severity: this.newIssue.severity,
      status: 'Reported' as const,
      reportedBy: this.newIssue.reportedBy,
      contactNumber: this.newIssue.contactNumber ? this.newIssue.contactNumber.replace(/\s/g, '') : '',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.http.post(`${this.apiUrl}/infrastructure-issues`, issueToSend).subscribe({
      next: () => {
        this.loadIssues();
        this.showAddIssue = false;
        this.resetNewIssue();
        this.showSuccess('Issue reported successfully!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.showError('Failed to report issue');
      }
    });
  }

  updateIssueStatus(issue: InfrastructureIssue, newStatus: string): void {
    const statusMap: { [key: string]: 'Reported' | 'In Progress' | 'Resolved' | 'Closed' } = {
      'Reported': 'Reported',
      'In Progress': 'In Progress',
      'Resolved': 'Resolved',
      'Closed': 'Closed'
    };
    
    const typedStatus = statusMap[newStatus] || 'Reported';
    
    const updated = { 
      ...issue, 
      status: typedStatus,
      updatedAt: new Date().toISOString()
    };
    
    const index = this.issues.findIndex(i => i.id === issue.id);
    if (index !== -1) {
      this.issues[index].status = typedStatus;
      this.issues[index].updatedAt = new Date().toISOString();
      this.calculateStats();
      this.cdr.detectChanges();
    }
    
    this.http.put(`${this.apiUrl}/infrastructure-issues/${issue.id}`, updated).subscribe({
      next: () => {
        this.loadIssues();
        this.showSuccess(`Issue marked as ${newStatus}`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Server error but local update applied:', err);
        this.showSuccess(`Issue marked as ${newStatus}`);
        this.cdr.detectChanges();
      }
    });
  }

  deleteIssue(): void {
    if (this.deleteIssueId === null) return;
    
    const idToDelete = this.deleteIssueId;
    this.issues = this.issues.filter(i => i.id !== idToDelete);
    this.calculateStats();
    this.closeDeleteModal();
    this.showSuccess('Issue deleted successfully!');
    this.cdr.detectChanges();
    
    this.http.delete(`${this.apiUrl}/infrastructure-issues/${idToDelete}`).subscribe({
      next: () => {
        this.loadIssues();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Server error but local delete applied:', err);
      }
    });
  }

  editIssue(issue: InfrastructureIssue): void {
    this.editingIssue = { ...issue };
    if (this.editingIssue.contactNumber && this.editingIssue.contactNumber.length === 11) {
      let formatted = this.editingIssue.contactNumber;
      formatted = formatted.slice(0, 4) + ' ' + formatted.slice(4, 7) + ' ' + formatted.slice(7);
      this.editingIssue.contactNumber = formatted;
    }
  }

  saveIssue(): void {
    if (this.editingIssue) {
      if (this.editingIssue.contactNumber) {
        const cleanContact = this.editingIssue.contactNumber.replace(/\s/g, '');
        if (cleanContact.length !== 0 && cleanContact.length !== 11) {
          this.showError('Contact number must be exactly 11 digits or empty');
          return;
        }
        if (cleanContact.length === 11 && !/^\d+$/.test(cleanContact)) {
          this.showError('Contact number must contain only numbers');
          return;
        }
      }

      const index = this.issues.findIndex(i => i.id === this.editingIssue!.id);
      if (index !== -1) {
        this.issues[index] = { ...this.editingIssue! };
        this.calculateStats();
        this.cdr.detectChanges();
      }

      const updated = {
        ...this.editingIssue,
        contactNumber: this.editingIssue.contactNumber ? this.editingIssue.contactNumber.replace(/\s/g, '') : '',
        updatedAt: new Date().toISOString()
      };
      
      this.http.put(`${this.apiUrl}/infrastructure-issues/${this.editingIssue.id}`, updated).subscribe({
        next: () => {
          this.loadIssues();
          this.editingIssue = null;
          this.showSuccess('Issue updated successfully!');
          this.cdr.detectChanges();
        },
        error: (err) => { 
          console.error('Server error but local update applied:', err);
          this.editingIssue = null;
          this.showSuccess('Issue updated successfully!');
          this.cdr.detectChanges();
        }
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