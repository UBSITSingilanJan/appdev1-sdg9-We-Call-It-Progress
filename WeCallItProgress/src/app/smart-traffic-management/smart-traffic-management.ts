import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface RouteData {
  id: number;
  name: string;
  status: string;
  congestionLevel: number;
}

@Component({
  selector: 'app-smart-traffic-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './smart-traffic-management.html',
  styleUrls: ['./smart-traffic-management.css']
})
export class SmartTrafficManagement implements OnInit, AfterViewInit {

  private apiUrl = 'http://localhost:3000/routes';

  routes: RouteData[] = [];
  private map!: L.Map;

  newRoute = {
    name: '',
    status: 'normal',
    congestionLevel: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  // ================= MAP =================
  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = L.map(mapElement).setView([14.8133, 121.0453], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);
  }

  // ================= LOAD =================
  loadRoutes() {
    this.http.get<RouteData[]>(this.apiUrl)
      .subscribe(data => {
        this.routes = data;
        this.renderMarkers();
      });
  }

  // ================= MARKERS =================
  renderMarkers() {
    if (!this.map) return;

    this.map.eachLayer(layer => {
      if ((layer as any)._latlng) {
        this.map.removeLayer(layer);
      }
    });

    this.routes.forEach((r, i) => {

      const lat = 14.8133 + i * 0.002;
      const lng = 121.0453 + i * 0.002;

      const color =
        r.congestionLevel > 70 ? '#ef4444' :
        r.congestionLevel > 40 ? '#f97316' : '#22c55e';

      L.circleMarker([lat, lng], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8
      })
      .addTo(this.map)
      .bindPopup(`
        <b>${r.name}</b><br>
        Status: ${r.status}<br>
      `);
    });
  }

  // ================= ACTIONS =================
  addRoute() {
    this.http.post(this.apiUrl, this.newRoute)
      .subscribe(() => {
        this.loadRoutes();
        this.newRoute = { name: '', status: 'normal', congestionLevel: 0 };
      });
  }

  deleteRoute(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe(() => this.loadRoutes());
  }

  trackById(index: number, item: RouteData): number {
    return item.id;
  }
}