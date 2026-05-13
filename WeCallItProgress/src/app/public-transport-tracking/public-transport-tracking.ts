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
  private endPointMarkers: Map<number, L.CircleMarker> = new Map();
  private startPointMarkers: Map<number, L.CircleMarker> = new Map();
  private stopMarkers: L.Marker[] = [];
  private tempStartMarker: L.Marker | null = null;
  private tempEndMarker: L.Marker | null = null;
  private tempLine: L.Polyline | null = null;
  private refreshInterval: any;
  
  vehicles: Vehicle[] = [];
  routes: TransportRoute[] = [];
  stops: Stop[] = [];
  
  selectedVehicle: Vehicle | null = null;
  selectedRoute: string = 'all';
  vehicleTypes = ['all', 'Bus', 'Jeepney', 'Taxi', 'Motorcycle', 'Bicycle'];
  
  isAddingVehicle = false;
  isPlacingStart = false;
  isPlacingEnd = false;
  selectedStartLat: number | null = null;
  selectedStartLng: number | null = null;
  selectedEndLat: number | null = null;
  selectedEndLng: number | null = null;

  showSuccessModal = false;
  successMessageText = '';
  showErrorModal = false;
  errorMessageText = '';
  showDeleteModal = false;
  deleteVehicleId: number | null = null;
  deleteVehicleName: string = '';

  private successTimeout: any = null;
  private errorTimeout: any = null;

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

  private baguioBounds = {
    north: 16.45,
    south: 16.35,
    east: 120.65,
    west: 120.52
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
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [16.4119, 120.5956],
      zoom: 15,
      minZoom: 14,
      maxZoom: 18,
      maxBounds: L.latLngBounds(
        L.latLng(this.baguioBounds.south, this.baguioBounds.west),
        L.latLng(this.baguioBounds.north, this.baguioBounds.east)
      ),
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 13
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

  clampToBaguio(lat: number, lng: number): { lat: number; lng: number } {
    return {
      lat: Math.max(this.baguioBounds.south, Math.min(this.baguioBounds.north, lat)),
      lng: Math.max(this.baguioBounds.west, Math.min(this.baguioBounds.east, lng))
    };
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
    
    if (this.tempStartMarker) {
      this.map.removeLayer(this.tempStartMarker);
      this.tempStartMarker = null;
    }
    if (this.tempEndMarker) {
      this.map.removeLayer(this.tempEndMarker);
      this.tempEndMarker = null;
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
    const clamped = this.clampToBaguio(latlng.lat, latlng.lng);
    this.selectedStartLat = clamped.lat;
    this.selectedStartLng = clamped.lng;
    
    if (this.tempStartMarker) {
      this.map.removeLayer(this.tempStartMarker);
    }
    
    const startIcon = L.divIcon({
      html: '<div style="background: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #22c55e; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">S</div>',
      iconSize: [26, 26],
      popupAnchor: [0, -13]
    });
    
    this.tempStartMarker = L.marker([this.selectedStartLat, this.selectedStartLng], { icon: startIcon }).addTo(this.map);
    this.tempStartMarker.bindPopup('<strong>START Point</strong><br>Click END to complete route').openPopup();
    
    this.isPlacingStart = false;
    this.isPlacingEnd = true;
    this.placementStep = 'end';
    this.cdr.detectChanges();
  }

  placeEndPin(latlng: L.LatLng): void {
    const clamped = this.clampToBaguio(latlng.lat, latlng.lng);
    this.selectedEndLat = clamped.lat;
    this.selectedEndLng = clamped.lng;
    
    if (this.tempEndMarker) {
      this.map.removeLayer(this.tempEndMarker);
    }
    
    const endIcon = L.divIcon({
      html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #ef4444; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">E</div>',
      iconSize: [26, 26],
      popupAnchor: [0, -13]
    });
    
    this.tempEndMarker = L.marker([this.selectedEndLat, this.selectedEndLng], { icon: endIcon }).addTo(this.map);
    this.tempEndMarker.bindPopup('<strong>END Point</strong>').openPopup();
    
    if (this.selectedStartLat && this.selectedStartLng) {
      const startPoint = L.latLng(this.selectedStartLat, this.selectedStartLng);
      const endPoint = L.latLng(this.selectedEndLat, this.selectedEndLng);
      
      if (this.tempLine) {
        this.map.removeLayer(this.tempLine);
      }
      
      this.tempLine = L.polyline([startPoint, endPoint], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
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
    
    if (this.tempStartMarker) {
      this.map.removeLayer(this.tempStartMarker);
      this.tempStartMarker = null;
    }
    if (this.tempEndMarker) {
      this.map.removeLayer(this.tempEndMarker);
      this.tempEndMarker = null;
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
        this.showSuccess('Vehicle added successfully!');
      },
      error: (error) => {
        console.error('Error adding vehicle:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.showError('Failed to add vehicle. Please check if server is running.');
      }
    });
  }

  confirmDelete(id: number, name: string): void {
    this.deleteVehicleId = id;
    this.deleteVehicleName = name;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteVehicleId = null;
    this.deleteVehicleName = '';
    this.cdr.detectChanges();
  }

  deleteVehicle(): void {
    if (this.deleteVehicleId === null) return;
    
    const idToDelete = this.deleteVehicleId;
    const nameToDelete = this.deleteVehicleName;
    
    this.closeDeleteModal();
    
    this.http.delete(`${this.apiUrl}/vehicles/${idToDelete}`).subscribe({
      next: () => {
        this.loadVehicles();
        this.showSuccess(`Vehicle "${nameToDelete}" deleted successfully!`);
      },
      error: (error) => {
        console.error('Error deleting vehicle:', error);
        this.showError(`Failed to delete vehicle "${nameToDelete}"`);
      }
    });
  }

  showSuccess(message: string): void {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
      this.successTimeout = null;
    }
    
    this.successMessageText = message;
    this.showSuccessModal = true;
    this.cdr.detectChanges();
    
    this.successTimeout = setTimeout(() => {
      this.closeSuccessModal();
    }, 3000);
  }

  closeSuccessModal(): void {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
      this.successTimeout = null;
    }
    this.showSuccessModal = false;
    this.successMessageText = '';
    this.cdr.detectChanges();
  }

  showError(message: string): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
    
    this.errorMessageText = message;
    this.showErrorModal = true;
    this.cdr.detectChanges();
    
    this.errorTimeout = setTimeout(() => {
      this.closeErrorModal();
    }, 3000);
  }

  closeErrorModal(): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
    this.showErrorModal = false;
    this.errorMessageText = '';
    this.cdr.detectChanges();
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
    
    this.endPointMarkers.forEach((marker, id) => {
      if (!filteredVehicles.find(v => v.id === id)) {
        this.map.removeLayer(marker);
        this.endPointMarkers.delete(id);
      }
    });
    
    this.startPointMarkers.forEach((marker, id) => {
      if (!filteredVehicles.find(v => v.id === id)) {
        this.map.removeLayer(marker);
        this.startPointMarkers.delete(id);
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
      
      if (vehicle.startLat && vehicle.startLng) {
        const startIcon = L.circleMarker([vehicle.startLat, vehicle.startLng], {
          radius: 6,
          fillColor: '#22c55e',
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(this.map);
        startIcon.bindPopup(`<strong>START</strong><br>Route: ${vehicle.route}<br>Vehicle: ${vehicle.vehicleNumber}`);
        this.startPointMarkers.set(vehicle.id, startIcon);
      }
      
      if (vehicle.endLat && vehicle.endLng) {
        const endIcon = L.circleMarker([vehicle.endLat, vehicle.endLng], {
          radius: 6,
          fillColor: '#ef4444',
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(this.map);
        endIcon.bindPopup(`<strong>END POINT</strong><br>Route: ${vehicle.route}<br>Vehicle: ${vehicle.vehicleNumber}<br>Destination reached when vehicle arrives here`);
        this.endPointMarkers.set(vehicle.id, endIcon);
      }
      
      if (vehicle.startLat && vehicle.startLng && vehicle.endLat && vehicle.endLng) {
        const isSelectedRoute = this.selectedRoute === vehicle.route || this.selectedRoute === 'all';
        const lineStyle = {
          color: '#FF6B4A',
          weight: 3,
          opacity: 0.8,
          dashArray: isSelectedRoute ? undefined : '8, 8'
        };
        
        if (this.routeLines.has(vehicle.id)) {
          const line = this.routeLines.get(vehicle.id)!;
          line.setLatLngs([[vehicle.startLat, vehicle.startLng], [vehicle.endLat, vehicle.endLng]]);
          line.setStyle(lineStyle);
        } else {
          const line = L.polyline([[vehicle.startLat, vehicle.startLng], [vehicle.endLat, vehicle.endLng]], lineStyle).addTo(this.map);
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
      'Taxi': '🚕',
      'Motorcycle': '🏍️',
      'Bicycle': '🚲'
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
    const statusColor = vehicle.status === 'active' ? '#22c55e' : '#FF6B4A';
    const occupancyColor = this.getOccupancyColor(vehicle.occupancy);
    
    return `
      <div style="min-width: 250px; font-family: Arial, sans-serif;">
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
        <div style="font-size: 11px; color: #64748b;">
          <div><strong>📍 Start Point:</strong> ${vehicle.startLat?.toFixed(4)}, ${vehicle.startLng?.toFixed(4)}</div>
          <div><strong>🏁 End Point:</strong> ${vehicle.endLat?.toFixed(4)}, ${vehicle.endLng?.toFixed(4)}</div>
          <div><strong>🕐 Last update:</strong> ${new Date(vehicle.lastUpdate).toLocaleTimeString()}</div>
        </div>
      </div>
    `;
  }

  getVehicleColor(type: string, status: string): string {
    if (status === 'delayed') return '#FF6B4A';
    if (status === 'inactive') return '#64748b';
    switch(type) {
      case 'Bus': return '#3b82f6';
      case 'Jeepney': return '#10b981';
      case 'Taxi': return '#f59e0b';
      case 'Motorcycle': return '#8b5cf6';
      case 'Bicycle': return '#06b6d4';
      default: return '#6b7280';
    }
  }

  getOccupancyColor(occupancy: number): string {
    if (occupancy > 80) return '#ef4444';
    if (occupancy > 50) return '#FF6B4A';
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