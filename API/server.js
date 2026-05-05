const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Existing data stores
let schedules = [];
let reports = [];
let routes = [];

let energyData = [
  { id: 1, location: 'Building A', consumption: 120, timestamp: new Date() },
  { id: 2, location: 'Building B', consumption: 95, timestamp: new Date() },
  { id: 3, location: 'Street Lights Zone 1', consumption: 60, timestamp: new Date() }
];

// ============= PUBLIC TRANSPORT DATA =============
let vehicles = [
  { 
    id: 1, 
    type: 'Bus', 
    route: 'EDSA Carousel', 
    vehicleNumber: 'BUS-101',
    status: 'active',
    speed: 25,
    occupancy: 65,
    lat: 14.6033, 
    lng: 121.0153,
    lastUpdate: new Date(),
    driver: 'Juan Dela Cruz',
    nextStop: 'Ayala Station',
    eta: '5 mins'
  },
  { 
    id: 2, 
    type: 'Bus', 
    route: 'C5', 
    vehicleNumber: 'BUS-102',
    status: 'active',
    speed: 15,
    occupancy: 85,
    lat: 14.5633, 
    lng: 121.0753,
    lastUpdate: new Date(),
    driver: 'Maria Santos',
    nextStop: 'Market Market',
    eta: '8 mins'
  },
  { 
    id: 3, 
    type: 'Jeepney', 
    route: 'Taft - Baclaran', 
    vehicleNumber: 'JEEP-201',
    status: 'active',
    speed: 20,
    occupancy: 45,
    lat: 14.5533, 
    lng: 120.9953,
    lastUpdate: new Date(),
    driver: 'Ramon Garcia',
    nextStop: 'Taft MRT',
    eta: '3 mins'
  },
  { 
    id: 4, 
    type: 'Train', 
    route: 'MRT Line 3', 
    vehicleNumber: 'TRAIN-301',
    status: 'active',
    speed: 40,
    occupancy: 92,
    lat: 14.6233, 
    lng: 121.0453,
    lastUpdate: new Date(),
    driver: 'Carlos Mendoza',
    nextStop: 'North Avenue',
    eta: '2 mins'
  },
  { 
    id: 5, 
    type: 'Bus', 
    route: 'Commonwealth', 
    vehicleNumber: 'BUS-103',
    status: 'delayed',
    speed: 8,
    occupancy: 70,
    lat: 14.6533, 
    lng: 121.0453,
    lastUpdate: new Date(),
    driver: 'Ana Reyes',
    nextStop: 'Litex',
    eta: '12 mins'
  }
];

let routes_list = [
  { id: 1, name: 'EDSA Carousel', type: 'Bus', stops: 25, frequency: '5 mins', status: 'operational' },
  { id: 2, name: 'C5', type: 'Bus', stops: 18, frequency: '10 mins', status: 'operational' },
  { id: 3, name: 'Taft - Baclaran', type: 'Jeepney', stops: 15, frequency: '8 mins', status: 'operational' },
  { id: 4, name: 'MRT Line 3', type: 'Train', stops: 13, frequency: '4 mins', status: 'operational' },
  { id: 5, name: 'Commonwealth', type: 'Bus', stops: 22, frequency: '12 mins', status: 'partial' }
];

let stops = [
  { id: 1, name: 'Ayala Station', lat: 14.5583, lng: 121.0183, routes: ['EDSA Carousel', 'MRT Line 3'] },
  { id: 2, name: 'Market Market', lat: 14.5483, lng: 121.0653, routes: ['C5'] },
  { id: 3, name: 'Taft MRT', lat: 14.5433, lng: 120.9953, routes: ['Taft - Baclaran'] },
  { id: 4, name: 'North Avenue', lat: 14.6533, lng: 121.0353, routes: ['MRT Line 3'] },
  { id: 5, name: 'Litex', lat: 14.6683, lng: 121.0553, routes: ['Commonwealth'] },
  { id: 6, name: 'Cubao Station', lat: 14.6203, lng: 121.0553, routes: ['MRT Line 3', 'EDSA Carousel'] },
  { id: 7, name: 'Ortigas Station', lat: 14.5833, lng: 121.0653, routes: ['MRT Line 3'] }
];

// ============= EXISTING ENDPOINTS =============
app.get('/schedules', (req, res) => res.json(schedules));
app.post('/schedules', (req, res) => {
  const newSchedule = { id: schedules.length + 1, ...req.body };
  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
});
app.put('/schedules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = schedules.findIndex(s => s.id === id);
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...req.body };
    res.json(schedules[index]);
  } else {
    res.status(404).json({ message: 'Schedule not found' });
  }
});
app.delete('/schedules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  schedules = schedules.filter(s => s.id !== id);
  res.json({ message: 'Schedule deleted successfully' });
});

app.get('/reports', (req, res) => res.json(reports));
app.post('/reports', (req, res) => {
  const newReport = { id: reports.length + 1, ...req.body };
  reports.push(newReport);
  res.status(201).json(newReport);
});
app.put('/reports/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = reports.findIndex(r => r.id === id);
  if (index !== -1) {
    reports[index] = { ...reports[index], ...req.body };
    res.json(reports[index]);
  } else {
    res.status(404).json({ message: 'Report not found' });
  }
});
app.delete('/reports/:id', (req, res) => {
  const id = parseInt(req.params.id);
  reports = reports.filter(r => r.id !== id);
  res.json({ message: 'Report deleted successfully' });
});

app.get('/routes', (req, res) => res.json(routes));
app.post('/routes', (req, res) => {
  const newRoute = { id: routes.length + 1, name: req.body.name || 'Unnamed Route', status: req.body.status || 'normal', congestionLevel: req.body.congestionLevel || 0, ...req.body };
  routes.push(newRoute);
  res.status(201).json(newRoute);
});
app.put('/routes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = routes.findIndex(r => r.id === id);
  if (index !== -1) {
    routes[index] = { ...routes[index], ...req.body };
    res.json(routes[index]);
  } else {
    res.status(404).json({ message: 'Route not found' });
  }
});
app.delete('/routes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  routes = routes.filter(r => r.id !== id);
  res.json({ message: 'Route deleted successfully' });
});

app.get('/energy', (req, res) => res.json(energyData));
app.post('/energy', (req, res) => {
  const newData = { id: energyData.length + 1, ...req.body, timestamp: new Date() };
  energyData.push(newData);
  res.status(201).json(newData);
});
app.put('/energy/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = energyData.findIndex(e => e.id === id);
  if (index !== -1) {
    energyData[index] = { ...energyData[index], ...req.body };
    res.json(energyData[index]);
  } else {
    res.status(404).json({ message: 'Energy data not found' });
  }
});
app.delete('/energy/:id', (req, res) => {
  const id = parseInt(req.params.id);
  energyData = energyData.filter(e => e.id !== id);
  res.json({ message: 'Energy data deleted successfully' });
});

// ============= PUBLIC TRANSPORT ENDPOINTS =============
app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

app.get('/api/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const vehicle = vehicles.find(v => v.id === id);
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).json({ message: 'Vehicle not found' });
  }
});

app.post('/api/vehicles', (req, res) => {
  const newVehicle = {
    id: vehicles.length + 1,
    ...req.body,
    lastUpdate: new Date(),
    speed: req.body.speed || 0,
    occupancy: req.body.occupancy || 0
  };
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

app.put('/api/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    vehicles[index] = { ...vehicles[index], ...req.body, lastUpdate: new Date() };
    res.json(vehicles[index]);
  } else {
    res.status(404).json({ message: 'Vehicle not found' });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  vehicles = vehicles.filter(v => v.id !== id);
  res.json({ message: 'Vehicle deleted successfully' });
});

app.get('/api/routes', (req, res) => {
  res.json(routes_list);
});

app.get('/api/stops', (req, res) => {
  res.json(stops);
});

// Real-time location update endpoint
app.post('/api/vehicles/:id/location', (req, res) => {
  const id = parseInt(req.params.id);
  const index = vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    vehicles[index].lat = req.body.lat;
    vehicles[index].lng = req.body.lng;
    vehicles[index].lastUpdate = new Date();
    vehicles[index].speed = req.body.speed || vehicles[index].speed;
    vehicles[index].occupancy = req.body.occupancy || vehicles[index].occupancy;
    res.json(vehicles[index]);
  } else {
    res.status(404).json({ message: 'Vehicle not found' });
  }
});

// Simulate real-time movement
setInterval(() => {
  vehicles.forEach(vehicle => {
    // Random movement simulation
    const latChange = (Math.random() - 0.5) * 0.002;
    const lngChange = (Math.random() - 0.5) * 0.002;
    vehicle.lat += latChange;
    vehicle.lng += lngChange;
    vehicle.lastUpdate = new Date();
    
    // Random speed and occupancy changes
    vehicle.speed = Math.max(0, Math.min(60, vehicle.speed + (Math.random() - 0.5) * 5));
    vehicle.occupancy = Math.max(0, Math.min(100, vehicle.occupancy + (Math.random() - 0.5) * 10));
    
    // Random status changes
    if (Math.random() < 0.05) {
      const statuses = ['active', 'delayed', 'active', 'active'];
      vehicle.status = statuses[Math.floor(Math.random() * statuses.length)];
    }
  });
}, 5000); // Update every 5 seconds

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});