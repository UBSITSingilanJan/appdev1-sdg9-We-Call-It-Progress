import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';

interface RouteData {
  id: number;
  name: string;
  status: string;
  congestionLevel: number;
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'app-smart-traffic-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './smart-traffic-management.html',
  styleUrls: ['./smart-traffic-management.css']
})
export class SmartTrafficManagement implements OnInit, AfterViewInit {

  private apiUrl = 'http://localhost:3000/routes';
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private tempMarker: L.Marker | null = null;
  
  routes: RouteData[] = [];
  
  isAddingRoute = false;
  selectedLat: number | null = null;
  selectedLng: number | null = null;

  showSuccessModal = false;
  successMessageText = '';
  showErrorModal = false;
  errorMessageText = '';
  showDeleteModal = false;
  deleteRouteId: number | null = null;
  deleteRouteName: string = '';

  private successTimeout: any = null;
  private errorTimeout: any = null;

  private baguioBounds = {
    north: 16.45,
    south: 16.35,
    east: 120.65,
    west: 120.52
  };

  private locations = [
    { name: 'Session Road', lat: 16.4119, lng: 120.5956 },
    { name: 'Burnham Park', lat: 16.4119, lng: 120.5933 },
    { name: 'Camp John Hay', lat: 16.4017, lng: 120.5967 },
    { name: 'Mines View Park', lat: 16.4114, lng: 120.6128 },
    { name: 'SM City Baguio', lat: 16.4101, lng: 120.5944 },
    { name: 'Baguio Cathedral', lat: 16.4118, lng: 120.5961 },
    { name: 'Wright Park', lat: 16.4039, lng: 120.6083 },
    { name: 'The Mansion', lat: 16.4056, lng: 120.6089 },
    { name: 'Botanical Garden', lat: 16.4083, lng: 120.6033 },
    { name: 'Teachers Camp', lat: 16.4139, lng: 120.5983 },
    { name: 'Leonard Wood Road', lat: 16.4094, lng: 120.5919 },
    { name: 'Kisad Road', lat: 16.4097, lng: 120.5981 }
  ];

  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef<HTMLDivElement>;

  newRoute: RouteData = {
    id: 0,
    name: '',
    status: 'normal',
    congestionLevel: 20
  };

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
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
      if (this.isAddingRoute) {
        this.placePin(e.latlng);
      }
    });

    setTimeout(() => {
      this.map.invalidateSize();
      this.renderMarkers();
    }, 200);
    
    window.addEventListener('resize', () => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    });
  }

  startAddRoute(): void {
    this.isAddingRoute = true;
    this.selectedLat = null;
    this.selectedLng = null;
    this.newRoute = {
      id: 0,
      name: '',
      status: 'normal',
      congestionLevel: 20
    };
    
    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
      this.tempMarker = null;
    }
    
    this.map.getContainer().style.cursor = 'crosshair';
    this.cdr.detectChanges();
  }

  cancelAddRoute(): void {
    this.isAddingRoute = false;
    this.selectedLat = null;
    this.selectedLng = null;
    
    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
      this.tempMarker = null;
    }
    
    this.map.getContainer().style.cursor = '';
    this.cdr.detectChanges();
  }

  placePin(latlng: L.LatLng): void {
    let lat = latlng.lat;
    let lng = latlng.lng;
    
    if (lat < this.baguioBounds.south) lat = this.baguioBounds.south;
    if (lat > this.baguioBounds.north) lat = this.baguioBounds.north;
    if (lng < this.baguioBounds.west) lng = this.baguioBounds.west;
    if (lng > this.baguioBounds.east) lng = this.baguioBounds.east;
    
    this.selectedLat = lat;
    this.selectedLng = lng;
    
    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
    }
    
    const customIcon = L.divIcon({
      html: '<div style="background: #FF6B4A; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #FF6B4A;"></div>',
      iconSize: [22, 22],
      popupAnchor: [0, -8]
    });
    
    this.tempMarker = L.marker([this.selectedLat, this.selectedLng], { icon: customIcon }).addTo(this.map);
    this.tempMarker.bindPopup('Selected location for new route').openPopup();
    this.cdr.detectChanges();
  }

  addRoute(): void {
    if (!this.newRoute.name.trim()) {
      this.showError('Please enter a route name');
      return;
    }
    
    if (!this.selectedLat || !this.selectedLng) {
      this.showError('Please click on the map to select a location for this route');
      return;
    }
    
    const routeToAdd = {
      name: this.newRoute.name,
      status: this.newRoute.status,
      congestionLevel: this.newRoute.congestionLevel,
      lat: this.selectedLat,
      lng: this.selectedLng
    };

    this.loading = true;
    this.http.post<RouteData>(this.apiUrl, routeToAdd).subscribe({
      next: (newRoute) => {
        this.routes.push(newRoute);
        this.renderMarkers();
        this.loading = false;
        
        this.newRoute = {
          id: 0,
          name: '',
          status: 'normal',
          congestionLevel: 20
        };
        
        this.cancelAddRoute();
        
        setTimeout(() => {
          this.showSuccess('Route added successfully!');
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error adding route:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.showError('Failed to add route. Please check if server is running.');
      }
    });
  }

  confirmDelete(id: number, name: string): void {
    this.deleteRouteId = id;
    this.deleteRouteName = name;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteRouteId = null;
    this.deleteRouteName = '';
    this.cdr.detectChanges();
  }

  deleteRoute(): void {
    if (this.deleteRouteId === null) return;
    
    const idToDelete = this.deleteRouteId;
    const nameToDelete = this.deleteRouteName;
    
    this.closeDeleteModal();
    
    this.http.delete(`${this.apiUrl}/${idToDelete}`).subscribe({
      next: () => {
        this.routes = this.routes.filter(r => r.id !== idToDelete);
        this.renderMarkers();
        this.cdr.detectChanges();
        this.showSuccess(`Route "${nameToDelete}" deleted successfully!`);
      },
      error: (error) => {
        console.error('Error deleting route:', error);
        this.showError(`Failed to delete route "${nameToDelete}"`);
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

  loadRoutes(): void {
    this.loading = true;
    this.http.get<RouteData[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.routes = data;
        this.renderMarkers();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateRoute(route: RouteData): void {
    this.http.put(`${this.apiUrl}/${route.id}`, route).subscribe({
      next: (updatedRoute) => {
        const index = this.routes.findIndex(r => r.id === route.id);
        if (index !== -1) {
          this.routes[index] = updatedRoute as RouteData;
          this.renderMarkers();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error updating route:', error);
      }
    });
  }

  updateCongestion(route: RouteData, newLevel: number): void {
    route.congestionLevel = newLevel;
    this.updateRoute(route);
  }

  renderMarkers(): void {
    if (!this.map) return;

    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    this.routes.forEach(route => {
      if (!route.lat || !route.lng) {
        const location = this.locations.find(loc => 
          route.name.toLowerCase().includes(loc.name.toLowerCase())
        );
        let lat = location ? location.lat : 16.4119 + (Math.random() * 0.03 - 0.015);
        let lng = location ? location.lng : 120.5956 + (Math.random() * 0.03 - 0.015);
        
        if (lat < this.baguioBounds.south) lat = this.baguioBounds.south;
        if (lat > this.baguioBounds.north) lat = this.baguioBounds.north;
        if (lng < this.baguioBounds.west) lng = this.baguioBounds.west;
        if (lng > this.baguioBounds.east) lng = this.baguioBounds.east;
        
        route.lat = lat;
        route.lng = lng;
      }

      const color = this.getColor(route.congestionLevel, route.status);
      
      const marker = L.circleMarker([route.lat, route.lng], {
        radius: 12,
        fillColor: color,
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(this.map);

      const popupContent = this.createPopupContent(route);
      marker.bindPopup(popupContent);

      this.markers.push(marker as any);
    });
  }

  createPopupContent(route: RouteData): string {
    return `
      <div style="min-width: 200px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b;">${route.name}</h3>
        <div style="margin-bottom: 8px;">
          <strong>Status:</strong> 
          <span style="color: ${this.getStatusColor(route.status)}; font-weight: bold;">
            ${route.status.toUpperCase()}
          </span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Congestion:</strong> 
          <span style="color: ${this.getCongestionColor(route.congestionLevel)};">
            ${route.congestionLevel}%
          </span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Quick Update:</strong><br>
          <button onclick="updateCongestion(${route.id}, 20)" style="background: #22c55e; margin: 2px; padding: 4px 8px; border: none; border-radius: 4px; color: white; cursor: pointer;">
            Light (20%)
          </button>
          <button onclick="updateCongestion(${route.id}, 50)" style="background: #FF6B4A; margin: 2px; padding: 4px 8px; border: none; border-radius: 4px; color: white; cursor: pointer;">
            Medium (50%)
          </button>
          <button onclick="updateCongestion(${route.id}, 80)" style="background: #ef4444; margin: 2px; padding: 4px 8px; border: none; border-radius: 4px; color: white; cursor: pointer;">
            Heavy (80%)
          </button>
        </div>
        <hr style="margin: 8px 0;">
        <small>Click outside to close | Last updated: ${new Date().toLocaleTimeString()}</small>
      </div>
    `;
  }

  getColor(level: number, status: string): string {
    if (status === 'blocked') return '#ef4444';
    if (status === 'heavy') return '#FF6B4A';
    if (level > 70) return '#ef4444';
    if (level > 40) return '#FF6B4A';
    return '#22c55e';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'blocked': return '#ef4444';
      case 'heavy': return '#FF6B4A';
      default: return '#22c55e';
    }
  }

  getCongestionColor(level: number): string {
    if (level > 70) return '#ef4444';
    if (level > 40) return '#FF6B4A';
    return '#22c55e';
  }

  getCongestionLabel(level: number): string {
    if (level > 70) return '🔴 Heavy Traffic';
    if (level > 40) return '🟠 Moderate Traffic';
    return '🟢 Light Traffic';
  }
}