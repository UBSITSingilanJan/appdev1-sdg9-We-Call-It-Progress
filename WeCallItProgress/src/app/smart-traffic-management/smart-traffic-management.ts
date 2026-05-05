import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
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
  
  routes: RouteData[] = [];
  
  // Predefined locations for major roads in Manila
  private locations = [
    { name: 'EDSA', lat: 14.6033, lng: 121.0153 },
    { name: 'C5', lat: 14.5633, lng: 121.0753 },
    { name: 'Commonwealth', lat: 14.6533, lng: 121.0453 },
    { name: 'Taft Avenue', lat: 14.5633, lng: 120.9953 },
    { name: 'Roxas Blvd', lat: 14.5533, lng: 120.9853 },
    { name: 'Quezon Avenue', lat: 14.6433, lng: 121.0353 },
    { name: 'Marcos Highway', lat: 14.6133, lng: 121.0953 },
    { name: 'Ortigas Avenue', lat: 14.5833, lng: 121.0653 }
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  // ================= MAP INITIALIZATION =================
  initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [14.5833, 121.0],
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Force map to recalculate size
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

  // ================= API CALLS =================
  loadRoutes(): void {
    this.loading = true;
    this.http.get<RouteData[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.routes = data;
        this.renderMarkers();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.errorMessage = 'Failed to load routes. Make sure the server is running on port 3000';
        this.loading = false;
        // Load sample data if API fails
        this.loadSampleRoutes();
      }
    });
  }

  addRoute(): void {
    if (!this.newRoute.name.trim()) {
      alert('Please enter a route name');
      return;
    }

    // Find location for the route name or use random
    const location = this.locations.find(loc => 
      this.newRoute.name.toLowerCase().includes(loc.name.toLowerCase())
    );
    
    const routeToAdd = {
      name: this.newRoute.name,
      status: this.newRoute.status,
      congestionLevel: this.newRoute.congestionLevel,
      lat: location ? location.lat : 14.5833 + (Math.random() * 0.1 - 0.05),
      lng: location ? location.lng : 121.0 + (Math.random() * 0.1 - 0.05)
    };

    this.loading = true;
    this.http.post<RouteData>(this.apiUrl, routeToAdd).subscribe({
      next: (newRoute) => {
        this.routes.push(newRoute);
        this.renderMarkers();
        this.loading = false;
        
        // Reset form
        this.newRoute = {
          id: 0,
          name: '',
          status: 'normal',
          congestionLevel: 20
        };
      },
      error: (error) => {
        console.error('Error adding route:', error);
        this.errorMessage = 'Failed to add route';
        this.loading = false;
      }
    });
  }

  deleteRoute(id: number): void {
    if (confirm('Are you sure you want to delete this route?')) {
      this.loading = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.routes = this.routes.filter(r => r.id !== id);
          this.renderMarkers();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting route:', error);
          this.errorMessage = 'Failed to delete route';
          this.loading = false;
        }
      });
    }
  }

  updateRoute(route: RouteData): void {
    this.http.put(`${this.apiUrl}/${route.id}`, route).subscribe({
      next: (updatedRoute) => {
        const index = this.routes.findIndex(r => r.id === route.id);
        if (index !== -1) {
          this.routes[index] = updatedRoute as RouteData;
          this.renderMarkers();
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

  // ================= SAMPLE DATA (Fallback) =================
  loadSampleRoutes(): void {
    // Only use sample if no routes exist
    if (this.routes.length === 0) {
      this.routes = [
        { id: 1, name: 'EDSA', status: 'heavy', congestionLevel: 75, lat: 14.6033, lng: 121.0153 },
        { id: 2, name: 'C5', status: 'normal', congestionLevel: 35, lat: 14.5633, lng: 121.0753 },
        { id: 3, name: 'Commonwealth', status: 'blocked', congestionLevel: 95, lat: 14.6533, lng: 121.0453 }
      ];
      this.renderMarkers();
    }
  }

  // ================= MARKERS =================
  renderMarkers(): void {
    if (!this.map) return;

    // Clear old markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Add new markers
    this.routes.forEach(route => {
      // If route doesn't have coordinates, assign based on name or random
      if (!route.lat || !route.lng) {
        const location = this.locations.find(loc => 
          route.name.toLowerCase().includes(loc.name.toLowerCase())
        );
        route.lat = location ? location.lat : 14.5833 + (Math.random() * 0.1 - 0.05);
        route.lng = location ? location.lng : 121.0 + (Math.random() * 0.1 - 0.05);
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

      // Create popup content with controls
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
          <button onclick="updateCongestion(${route.id}, 50)" style="background: #f97316; margin: 2px; padding: 4px 8px; border: none; border-radius: 4px; color: white; cursor: pointer;">
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
    if (status === 'heavy') return '#f97316';
    if (level > 70) return '#ef4444';
    if (level > 40) return '#f97316';
    return '#22c55e';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'blocked': return '#ef4444';
      case 'heavy': return '#f97316';
      default: return '#22c55e';
    }
  }

  getCongestionColor(level: number): string {
    if (level > 70) return '#ef4444';
    if (level > 40) return '#f97316';
    return '#22c55e';
  }

  // Helper to get congestion label
  getCongestionLabel(level: number): string {
    if (level > 70) return '🔴 Heavy Traffic';
    if (level > 40) return '🟠 Moderate Traffic';
    return '🟢 Light Traffic';
  }
}