import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';

interface Vehicle {
  id: number;
  type: string;
  route: string;
  vehicleNumber: string;
  status: string;
  speed: number;
  occupancy: number;
  lat: number;
  lng: number;
  lastUpdate: Date;
  driver: string;
  nextStop: string;
  eta: string;
}

interface TransportRoute {
  id: number;
  name: string;
  type: string;
  stops: number;
  frequency: string;
  status: string;
}

interface Stop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
}

@Component({
  selector: 'app-public-transport-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './public-transport-tracking.html',
  styleUrls: ['./public-transport-tracking.css']
})
export class PublicTransportTracking implements OnInit, AfterViewInit, OnDestroy {
  
  private apiUrl = 'http://localhost:3000/api';
  private map!: L.Map;
  private vehicleMarkers: Map<number, L.Marker> = new Map();
  private stopMarkers: L.Marker[] = [];
  private refreshInterval: any;
  
  vehicles: Vehicle[] = [];
  routes: TransportRoute[] = [];
  stops: Stop[] = [];
  
  selectedVehicle: Vehicle | null = null;
  selectedRoute: string = 'all';
  vehicleTypes = ['all', 'Bus', 'Jeepney', 'Train'];
  
  loading = false;
  errorMessage = '';
  lastUpdated = new Date();
  
  newVehicle: Partial<Vehicle> = {
    type: 'Bus',
    route: '',
    vehicleNumber: '',
    driver: '',
    status: 'active',
    speed: 0,
    occupancy: 0
  };
  
  stats = {
    totalVehicles: 0,
    activeVehicles: 0,
    delayedVehicles: 0,
    avgSpeed: 0,
    avgOccupancy: 0
  };

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef<HTMLDivElement>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
    this.startRealTimeUpdates();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [14.5833, 121.0],
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
    
    window.addEventListener('resize', () => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    });
  }

  loadAllData(): void {
    this.loadVehicles();
    this.loadRoutes();
    this.loadStops();
  }

  loadVehicles(): void {
    this.loading = true;
    this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`).subscribe({
      next: (data) => {
        this.vehicles = data;
        this.updateStats();
        this.renderVehicles();
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.errorMessage = 'Failed to load vehicles. Make sure server is running on port 3000';
        this.loading = false;
      }
    });
  }

  loadRoutes(): void {
    this.http.get<TransportRoute[]>(`${this.apiUrl}/routes`).subscribe({
      next: (data) => {
        this.routes = data;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
      }
    });
  }

  loadStops(): void {
    this.http.get<Stop[]>(`${this.apiUrl}/stops`).subscribe({
      next: (data) => {
        this.stops = data;
        this.renderStops();
      },
      error: (error) => {
        console.error('Error loading stops:', error);
      }
    });
  }

  startRealTimeUpdates(): void {
    this.refreshInterval = setInterval(() => {
      this.loadVehicles();
    }, 5000); // Update every 5 seconds
  }

  updateStats(): void {
    const activeVehicles = this.vehicles.filter(v => v.status === 'active');
    const avgSpeed = this.vehicles.reduce((sum, v) => sum + v.speed, 0) / this.vehicles.length;
    const avgOccupancy = this.vehicles.reduce((sum, v) => sum + v.occupancy, 0) / this.vehicles.length;
    
    this.stats = {
      totalVehicles: this.vehicles.length,
      activeVehicles: activeVehicles.length,
      delayedVehicles: this.vehicles.filter(v => v.status === 'delayed').length,
      avgSpeed: Math.round(avgSpeed),
      avgOccupancy: Math.round(avgOccupancy)
    };
  }

  renderVehicles(): void {
    if (!this.map) return;
    
    const filteredVehicles = this.selectedRoute === 'all' 
      ? this.vehicles 
      : this.vehicles.filter(v => v.route === this.selectedRoute);
    
    // Update existing markers or create new ones
    filteredVehicles.forEach(vehicle => {
      const color = this.getVehicleColor(vehicle.type, vehicle.status);
      const icon = this.createVehicleIcon(color, vehicle.type);
      
      if (this.vehicleMarkers.has(vehicle.id)) {
        // Update existing marker
        const marker = this.vehicleMarkers.get(vehicle.id)!;
        marker.setLatLng([vehicle.lat, vehicle.lng]);
        marker.setIcon(icon);
        marker.getPopup()?.setContent(this.createPopupContent(vehicle));
      } else {
        // Create new marker
        const marker = L.marker([vehicle.lat, vehicle.lng], { icon }).addTo(this.map);
        marker.bindPopup(this.createPopupContent(vehicle));
        marker.on('click', () => {
          this.selectedVehicle = vehicle;
        });
        this.vehicleMarkers.set(vehicle.id, marker);
      }
    });
    
    // Remove markers for vehicles that no longer exist in filter
    this.vehicleMarkers.forEach((marker, id) => {
      if (!filteredVehicles.find(v => v.id === id)) {
        this.map.removeLayer(marker);
        this.vehicleMarkers.delete(id);
      }
    });
  }

  renderStops(): void {
    if (!this.map) return;
    
    this.stopMarkers.forEach(marker => this.map.removeLayer(marker));
    this.stopMarkers = [];
    
    this.stops.forEach(stop => {
      const icon = L.divIcon({
        className: 'stop-marker',
        html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #1e40af;"></div>',
        iconSize: [16, 16],
        popupAnchor: [0, -8]
      });
      
      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(this.map);
      marker.bindPopup(`
        <div style="min-width: 150px;">
          <h4>🚏 ${stop.name}</h4>
          <strong>Routes:</strong><br>
          ${stop.routes.map(r => `• ${r}`).join('<br>')}
        </div>
      `);
      this.stopMarkers.push(marker);
    });
  }

  createVehicleIcon(color: string, type: string): L.DivIcon {
    const icons: { [key: string]: string } = {
      'Bus': '🚌',
      'Jeepney': '🚐',
      'Train': '🚆'
    };
    
    return L.divIcon({
      className: 'vehicle-marker',
      html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        ${icons[type] || '🚍'}
      </div>`,
      iconSize: [32, 32],
      popupAnchor: [0, -16]
    });
  }

  createPopupContent(vehicle: Vehicle): string {
    const statusColor = vehicle.status === 'active' ? '#22c55e' : '#f97316';
    const occupancyColor = this.getOccupancyColor(vehicle.occupancy);
    
    return `
      <div style="min-width: 220px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b;">
          ${vehicle.type} ${vehicle.vehicleNumber}
        </h3>
        <div style="margin-bottom: 6px;">
          <strong>Route:</strong> ${vehicle.route}
        </div>
        <div style="margin-bottom: 6px;">
          <strong>Driver:</strong> ${vehicle.driver}
        </div>
        <div style="margin-bottom: 6px;">
          <strong>Status:</strong> 
          <span style="color: ${statusColor}; font-weight: bold;">${vehicle.status.toUpperCase()}</span>
        </div>
        <div style="margin-bottom: 6px;">
          <strong>Speed:</strong> ${vehicle.speed} km/h
        </div>
        <div style="margin-bottom: 6px;">
          <strong>Occupancy:</strong> 
          <span style="color: ${occupancyColor};">${vehicle.occupancy}%</span>
        </div>
        <div style="margin-bottom: 6px;">
          <strong>Next Stop:</strong> ${vehicle.nextStop}
        </div>
        <div style="margin-bottom: 6px;">
          <strong>ETA:</strong> ${vehicle.eta}
        </div>
        <hr style="margin: 8px 0;">
        <small>Last update: ${new Date(vehicle.lastUpdate).toLocaleTimeString()}</small>
      </div>
    `;
  }

  getVehicleColor(type: string, status: string): string {
    if (status === 'delayed') return '#f97316';
    if (status === 'inactive') return '#64748b';
    
    switch(type) {
      case 'Bus': return '#3b82f6';
      case 'Jeepney': return '#10b981';
      case 'Train': return '#8b5cf6';
      default: return '#6b7280';
    }
  }

  getOccupancyColor(occupancy: number): string {
    if (occupancy > 80) return '#ef4444';
    if (occupancy > 50) return '#f97316';
    return '#22c55e';
  }

  addVehicle(): void {
    if (!this.newVehicle.route || !this.newVehicle.vehicleNumber) {
      alert('Please enter route and vehicle number');
      return;
    }
    
    const vehicleToAdd = {
      type: this.newVehicle.type,
      route: this.newVehicle.route,
      vehicleNumber: this.newVehicle.vehicleNumber,
      driver: this.newVehicle.driver || 'TBD',
      status: 'active',
      speed: 0,
      occupancy: 0,
      lat: 14.5833 + (Math.random() * 0.1 - 0.05),
      lng: 121.0 + (Math.random() * 0.1 - 0.05),
      nextStop: 'Starting point',
      eta: '0 mins'
    };
    
    this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, vehicleToAdd).subscribe({
      next: () => {
        this.loadVehicles();
        this.newVehicle = {
          type: 'Bus',
          route: '',
          vehicleNumber: '',
          driver: '',
          status: 'active',
          speed: 0,
          occupancy: 0
        };
      },
      error: (error) => {
        console.error('Error adding vehicle:', error);
        alert('Failed to add vehicle');
      }
    });
  }

  deleteVehicle(id: number): void {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      this.http.delete(`${this.apiUrl}/vehicles/${id}`).subscribe({
        next: () => {
          this.loadVehicles();
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          alert('Failed to delete vehicle');
        }
      });
    }
  }

  filterByRoute(route: string): void {
    this.selectedRoute = route;
    this.renderVehicles();
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'active': return '🟢';
      case 'delayed': return '🟠';
      default: return '⚪';
    }
  }
}