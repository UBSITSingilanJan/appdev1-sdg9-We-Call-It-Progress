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

  newEnergy = {
    location: '',
    consumption: 0
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

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
    this.http.get<EnergyData[]>(this.apiUrl)
      .subscribe(data => {
        this.energyData = [...data];

        if (this.viewReady) {
          this.updateChart();
        }

        this.cdr.detectChanges();
      });
  }

  addEnergy(): void {
    this.http.post<EnergyData>(this.apiUrl, this.newEnergy)
      .subscribe((created: any) => {

        const newItem: EnergyData = created?.id ? created : {
          id: Date.now(),
          location: this.newEnergy.location,
          consumption: this.newEnergy.consumption,
          timestamp: new Date().toISOString()
        };

        this.energyData = [...this.energyData, newItem];
        this.updateChart();

        this.newEnergy = { location: '', consumption: 0 };
        this.showAdd = false;

        this.cdr.detectChanges();
      });
  }

  deleteEnergy(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe(() => {

        this.energyData = this.energyData.filter(item => item.id !== id);
        this.updateChart();

        this.cdr.detectChanges();
      });
  }

  updateChart() {
    const labels = this.energyData.map(d => d.location);
    const values = this.energyData.map(d => d.consumption);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('energyChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Energy Consumption (kWh)',
          data: values,
          backgroundColor: '#4cafef'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 🔥 prevents squashing

        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const selectedItem = this.energyData[index];

            if (confirm(`Delete ${selectedItem.location}?`)) {
              this.deleteEnergy(selectedItem.id);
            }
          }
        },

        plugins: {
          tooltip: { enabled: false },
          legend: {
            labels: { color: 'white' }
          }
        },

        scales: {
          x: {
            ticks: { color: 'white' }
          },
          y: {
            ticks: { color: 'white' }
          }
        }
      }
    });
  }

  trackById(index: number, item: EnergyData): number {
    return item.id;
  }
}