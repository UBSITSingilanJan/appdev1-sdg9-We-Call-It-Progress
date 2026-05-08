import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
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
  lastUpdate: string;
  driver: string;
  nextStop: string;
  eta: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
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
  private routeLines: Map<number, L.Polyline> = new Map();
  private stopMarkers: L.Marker[] = [];
  private startMarker: L.Marker | null = null;
  private endMarker: L.Marker | null = null;
  private tempLine: L.Polyline | null = null;
  private refreshInterval: any;
  
  vehicles: Vehicle[] = [];
  routes: TransportRoute[] = [];
  stops: Stop[] = [];
  
  selectedVehicle: Vehicle | null = null;
  selectedRoute: string = 'all';
  vehicleTypes = ['all', 'Bus', 'Jeepney', 'Train'];
  
  isAddingVehicle = false;
  isPlacingStart = false;
  isPlacingEnd = false;
  selectedStartLat: number | null = null;
  selectedStartLng: number | null = null;
  selectedEndLat: number | null = null;
  selectedEndLng: number | null = null;

  showErrorModal = false;
  errorMessageText = '';

  loading = false;
  lastUpdated = new Date();
  
  newVehicle: any = {
    type: 'Bus',
    route: '',
    vehicleNumber: '',
    driver: '',
    status: 'active',
    speed: 0,
    occupancy: 0,
    startLat: null,
    startLng: null,
    endLat: null,
    endLng: null
  };

  placementStep: string = '';

  stats = {
    totalVehicles: 0,
    activeVehicles: 0,
    delayedVehicles: 0,
    avgSpeed: 0,
    avgOccupancy: 0
  };

  private baguioLocations = [
    { name: 'Session Road', lat: 16.4119, lng: 120.5956 },
    { name: 'Burnham Park', lat: 16.4119, lng: 120.5933 },
    { name: 'Camp John Hay', lat: 16.4017, lng: 120.5967 },
    { name: 'Mines View Park', lat: 16.4114, lng: 120.6128 },
    { name: 'SM City Baguio', lat: 16.4101, lng: 120.5944 },
    { name: 'Baguio Cathedral', lat: 16.4118, lng: 120.5961 },
    { name: 'Wright Park', lat: 16.4039, lng: 120.6083 },
    { name: 'The Mansion', lat: 16.4056, lng: 120.6089 }
  ];

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

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
      center: [16.4119, 120.5956],
      zoom: 14,
      maxBounds: L.latLngBounds(
        L.latLng(16.35, 120.55),
        L.latLng(16.48, 120.65)
      ),
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 12
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.isPlacingStart) {
        this.placeStartPin(e.latlng);
      } else if (this.isPlacingEnd) {
        this.placeEndPin(e.latlng);
      }
    });

    setTimeout(() => {
      this.map.invalidateSize();
      this.renderVehicles();
      this.renderStops();
    }, 200);
    
    window.addEventListener('resize', () => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    });
  }

  getUniqueRoutes(): string[] {
    const routes = this.vehicles.map(v => v.route).filter(route => route && route.trim() !== '');
    return [...new Set(routes)];
  }

  formatPlateNumber(event: any, obj: any, field: string): void {
    let value = event.target.value;
    obj[field] = value;
    event.target.value = value;
  }

  startAddVehicle(): void {
    this.isAddingVehicle = true;
    this.isPlacingStart = true;
    this.isPlacingEnd = false;
    this.placementStep = 'start';
    this.selectedStartLat = null;
    this.selectedStartLng = null;
    this.selectedEndLat = null;
    this.selectedEndLng = null;
    
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null;
    }
    if (this.tempLine) {
      this.map.removeLayer(this.tempLine);
      this.tempLine = null;
    }
    
    this.newVehicle = {
      type: 'Bus',
      route: '',
      vehicleNumber: '',
      driver: '',
      status: 'active',
      speed: 0,
      occupancy: 0,
      startLat: null,
      startLng: null,
      endLat: null,
      endLng: null
    };
    
    this.map.getContainer().style.cursor = 'crosshair';
    this.cdr.detectChanges();
  }

  placeStartPin(latlng: L.LatLng): void {
    this.selectedStartLat = latlng.lat;
    this.selectedStartLng = latlng.lng;
    
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
    }
    
    const startIcon = L.divIcon({
      html: '<div style="background: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #22c55e;"></div>',
      iconSize: [22, 22],
      popupAnchor: [0, -8]
    });
    
    this.startMarker = L.marker([this.selectedStartLat, this.selectedStartLng], { icon: startIcon }).addTo(this.map);
    this.startMarker.bindPopup('START Point').openPopup();
    
    this.isPlacingStart = false;
    this.isPlacingEnd = true;
    this.placementStep = 'end';
    this.cdr.detectChanges();
  }

  placeEndPin(latlng: L.LatLng): void {
    this.selectedEndLat = latlng.lat;
    this.selectedEndLng = latlng.lng;
    
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
    }
    
    const endIcon = L.divIcon({
      html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #ef4444;"></div>',
      iconSize: [22, 22],
      popupAnchor: [0, -8]
    });
    
    this.endMarker = L.marker([this.selectedEndLat, this.selectedEndLng], { icon: endIcon }).addTo(this.map);
    this.endMarker.bindPopup('END Point').openPopup();
    
    if (this.selectedStartLat && this.selectedStartLng) {
      const startPoint = L.latLng(this.selectedStartLat, this.selectedStartLng);
      const endPoint = L.latLng(this.selectedEndLat, this.selectedEndLng);
      
      if (this.tempLine) {
        this.map.removeLayer(this.tempLine);
      }
      
      this.tempLine = L.polyline([startPoint, endPoint], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(this.map);
    }
    
    this.isPlacingEnd = false;
    this.placementStep = 'done';
    this.cdr.detectChanges();
  }

  cancelAddVehicle(): void {
    this.isAddingVehicle = false;
    this.isPlacingStart = false;
    this.isPlacingEnd = false;
    this.placementStep = '';
    this.selectedStartLat = null;
    this.selectedStartLng = null;
    this.selectedEndLat = null;
    this.selectedEndLng = null;
    
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null;
    }
    if (this.tempLine) {
      this.map.removeLayer(this.tempLine);
      this.tempLine = null;
    }
    
    this.map.getContainer().style.cursor = '';
    this.cdr.detectChanges();
  }

  addVehicle(): void {
    if (!this.newVehicle.vehicleNumber.trim()) {
      this.showError('Please enter a vehicle plate number');
      return;
    }
    
    if (!this.newVehicle.route.trim()) {
      this.showError('Please enter a route name');
      return;
    }
    
    if (!this.selectedStartLat || !this.selectedStartLng) {
      this.showError('Please place the START point on the map');
      return;
    }
    
    if (!this.selectedEndLat || !this.selectedEndLng) {
      this.showError('Please place the END point on the map');
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
      lat: this.selectedStartLat,
      lng: this.selectedStartLng,
      startLat: this.selectedStartLat,
      startLng: this.selectedStartLng,
      endLat: this.selectedEndLat,
      endLng: this.selectedEndLng,
      nextStop: 'Starting point',
      eta: '0 mins'
    };

    this.loading = true;
    this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, vehicleToAdd).subscribe({
      next: () => {
        this.loadVehicles();
        this.loading = false;
        this.cdr.detectChanges();
        this.cancelAddVehicle();
        this.showError('Vehicle added successfully!');
      },
      error: (error) => {
        console.error('Error adding vehicle:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.showError('Failed to add vehicle. Please check if server is running.');
      }
    });
  }

  deleteVehicle(id: number): void {
    this.http.delete(`${this.apiUrl}/vehicles/${id}`).subscribe({
      next: () => {
        this.loadVehicles();
        this.showError('Vehicle deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting vehicle:', error);
        this.showError('Failed to delete vehicle');
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

  loadAllData(): void {
    this.loadVehicles();
    this.loadStops();
  }

  loadVehicles(): void {
    this.loading = true;
    this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`).subscribe({
      next: (data) => {
        this.vehicles = data;
        this.updateStats();
        this.renderVehicles();
        this.updateRoutesFromVehicles();
        this.loading = false;
        this.lastUpdated = new Date();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateRoutesFromVehicles(): void {
    const uniqueRoutes = this.getUniqueRoutes();
    this.routes = uniqueRoutes.map((route, index) => ({
      id: index + 1,
      name: route,
      type: 'Vehicle Route',
      stops: 0,
      frequency: 'N/A',
      status: 'operational'
    }));
    
    if (this.selectedRoute !== 'all' && !uniqueRoutes.includes(this.selectedRoute)) {
      this.selectedRoute = 'all';
    }
    
    this.cdr.detectChanges();
  }

  loadStops(): void {
    this.http.get<Stop[]>(`${this.apiUrl}/stops`).subscribe({
      next: (data) => {
        this.stops = data;
        this.renderStops();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading stops:', error);
      }
    });
  }

  startRealTimeUpdates(): void {
    this.refreshInterval = setInterval(() => {
      this.loadVehicles();
    }, 5000);
  }

  updateStats(): void {
    const activeVehicles = this.vehicles.filter(v => v.status === 'active');
    const avgSpeed = this.vehicles.reduce((sum, v) => sum + v.speed, 0) / (this.vehicles.length || 1);
    const avgOccupancy = this.vehicles.reduce((sum, v) => sum + v.occupancy, 0) / (this.vehicles.length || 1);
    
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
    
    this.vehicleMarkers.forEach((marker, id) => {
      if (!filteredVehicles.find(v => v.id === id)) {
        this.map.removeLayer(marker);
        this.vehicleMarkers.delete(id);
      }
    });
    
    this.routeLines.forEach((line, id) => {
      if (!filteredVehicles.find(v => v.id === id)) {
        this.map.removeLayer(line);
        this.routeLines.delete(id);
      }
    });
    
    filteredVehicles.forEach(vehicle => {
      const color = this.getVehicleColor(vehicle.type, vehicle.status);
      const icon = this.createVehicleIcon(color, vehicle.type);
      
      if (this.vehicleMarkers.has(vehicle.id)) {
        const marker = this.vehicleMarkers.get(vehicle.id)!;
        marker.setLatLng([vehicle.lat, vehicle.lng]);
      } else {
        const marker = L.marker([vehicle.lat, vehicle.lng], { icon }).addTo(this.map);
        marker.bindPopup(this.createPopupContent(vehicle));
        marker.on('click', () => {
          this.selectedVehicle = vehicle;
        });
        this.vehicleMarkers.set(vehicle.id, marker);
      }
      
      if (vehicle.startLat && vehicle.startLng && vehicle.endLat && vehicle.endLng) {
        if (this.routeLines.has(vehicle.id)) {
          const line = this.routeLines.get(vehicle.id)!;
          line.setLatLngs([[vehicle.startLat, vehicle.startLng], [vehicle.endLat, vehicle.endLng]]);
        } else {
          const line = L.polyline([[vehicle.startLat, vehicle.startLng], [vehicle.endLat, vehicle.endLng]], {
            color: '#f97316',
            weight: 3,
            opacity: 0.6,
            dashArray: '5, 5'
          }).addTo(this.map);
          this.routeLines.set(vehicle.id, line);
        }
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
        <div style="margin-bottom: 6px;"><strong>Route:</strong> ${vehicle.route}</div>
        <div style="margin-bottom: 6px;"><strong>Driver:</strong> ${vehicle.driver}</div>
        <div style="margin-bottom: 6px;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${vehicle.status.toUpperCase()}</span></div>
        <div style="margin-bottom: 6px;"><strong>Speed:</strong> ${vehicle.speed} km/h</div>
        <div style="margin-bottom: 6px;"><strong>Occupancy:</strong> <span style="color: ${occupancyColor};">${vehicle.occupancy}%</span></div>
        <div style="margin-bottom: 6px;"><strong>Next Stop:</strong> ${vehicle.nextStop}</div>
        <div style="margin-bottom: 6px;"><strong>ETA:</strong> ${vehicle.eta}</div>
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