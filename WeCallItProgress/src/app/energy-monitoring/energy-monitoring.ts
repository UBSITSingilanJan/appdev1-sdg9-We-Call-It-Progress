import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

interface EnergyData {
  id: number;
  location: string;
  consumption: number;
  timestamp: string;
}

@Component({
  selector: 'app-energy-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './energy-monitoring.html',
  styleUrls: ['./energy-monitoring.css']
})
export class EnergyMonitoring implements OnInit, AfterViewInit {

  private apiUrl = 'http://localhost:3000/energy';

  energyData: EnergyData[] = [];
  chart: any;

  showAdd = false;
  private viewReady = false;

  totalConsumption = 0;
  avgConsumption = 0;
  highestLocation = '';

  showDeleteModal = false;
  deleteItemId: number | null = null;
  deleteItemLocation: string = '';

  newEnergy = {
    location: '',
    consumption: 0
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      const container = document.querySelector('.energy-container') as HTMLElement;
      if (container) {
        container.style.minHeight = window.innerHeight + 'px';
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.loadEnergy();
  }

  toggleAdd() {
    this.showAdd = !this.showAdd;
  }

  cancelAdd() {
    this.showAdd = false;
    this.newEnergy = { location: '', consumption: 0 };
  }

  loadEnergy(): void {
    this.http.get<EnergyData[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.energyData = [...data];
        this.calculateStats();
        if (this.viewReady) {
          this.updateChart();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading energy data:', err);
      }
    });
  }

  calculateStats(): void {
    if (this.energyData.length === 0) {
      this.totalConsumption = 0;
      this.avgConsumption = 0;
      this.highestLocation = 'N/A';
      return;
    }

    this.totalConsumption = this.energyData.reduce((sum, item) => sum + item.consumption, 0);
    this.avgConsumption = Math.round(this.totalConsumption / this.energyData.length);
    
    const highest = this.energyData.reduce((max, item) => 
      item.consumption > max.consumption ? item : max, this.energyData[0]);
    this.highestLocation = highest.location;
  }

  confirmDelete(id: number, location: string): void {
    this.deleteItemId = id;
    this.deleteItemLocation = location;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteItemId = null;
    this.deleteItemLocation = '';
    this.cdr.detectChanges();
  }

  deleteEnergy(): void {
    if (this.deleteItemId === null) return;
    
    const idToDelete = this.deleteItemId;
    
    this.http.delete(`${this.apiUrl}/${idToDelete}`)
      .subscribe({
        next: () => {
          this.energyData = this.energyData.filter(item => item.id !== idToDelete);
          this.calculateStats();
          this.updateChart();
          this.showDeleteModal = false;
          this.deleteItemId = null;
          this.deleteItemLocation = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting energy data:', err);
          this.showDeleteModal = false;
          this.deleteItemId = null;
          this.deleteItemLocation = '';
          this.cdr.detectChanges();
        }
      });
  }

  addEnergy(): void {
    if (!this.newEnergy.location || this.newEnergy.consumption <= 0) {
      alert('Please enter valid location and consumption value');
      return;
    }

    this.http.post<EnergyData>(this.apiUrl, this.newEnergy)
      .subscribe((created: any) => {
        const newItem: EnergyData = created?.id ? created : {
          id: Date.now(),
          location: this.newEnergy.location,
          consumption: this.newEnergy.consumption,
          timestamp: new Date().toISOString()
        };

        this.energyData = [...this.energyData, newItem];
        this.calculateStats();
        this.updateChart();

        this.newEnergy = { location: '', consumption: 0 };
        this.showAdd = false;

        this.cdr.detectChanges();
      });
  }

  updateChart() {
    const labels = this.energyData.map(d => d.location);
    const values = this.energyData.map(d => d.consumption);

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('energyChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Energy Consumption (kWh)',
          data: values,
          backgroundColor: '#f97316',
          borderRadius: 8,
          barPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const selectedItem = this.energyData[index];
            this.confirmDelete(selectedItem.id, selectedItem.location);
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f97316',
            bodyColor: '#e2e8f0',
            borderColor: '#f97316',
            borderWidth: 1
          },
          legend: {
            labels: { color: 'white', font: { size: 12 } }
          }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }

  trackById(index: number, item: EnergyData): number {
    return item.id;
  }
}