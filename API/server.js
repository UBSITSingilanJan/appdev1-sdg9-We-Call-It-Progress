const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

let db = {
  schedules: [],
  reports: [],
  wasteRoutes: [],
  routes: [],
  energyData: [],
  vehicles: [],
  infrastructureIssues: [],
  maintenanceTeams: []
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      if (raw.trim() !== '') {
        const loaded = JSON.parse(raw);
        db.schedules = loaded.schedules || [];
        db.reports = loaded.reports || [];
        db.wasteRoutes = loaded.wasteRoutes || [];
        db.routes = loaded.routes || [];
        db.energyData = loaded.energyData || [];
        db.vehicles = loaded.vehicles || [];
        db.infrastructureIssues = loaded.infrastructureIssues || [];
        db.maintenanceTeams = loaded.maintenanceTeams || [];
        console.log('✅ Data loaded from file');
        console.log(`📊 Schedules: ${db.schedules.length}`);
        console.log(`📊 Reports: ${db.reports.length}`);
        console.log(`📊 Waste Routes: ${db.wasteRoutes.length}`);
        console.log(`📊 Traffic Routes: ${db.routes.length}`);
      } else {
        saveData();
        console.log('📁 Created new data.json');
      }
    } else {
      saveData();
      console.log('📁 Created new data.json');
    }
  } catch (err) {
    console.error('❌ Error loading data:', err);
    saveData();
  }
}

function saveData() {
  try {
    const dataToSave = {
      schedules: db.schedules,
      reports: db.reports,
      wasteRoutes: db.wasteRoutes,
      routes: db.routes,
      energyData: db.energyData,
      vehicles: db.vehicles,
      infrastructureIssues: db.infrastructureIssues,
      maintenanceTeams: db.maintenanceTeams
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('💾 Data saved to file');
  } catch (err) {
    console.error('❌ Error saving data:', err);
  }
}

function getNextId(array) {
  if (!array || array.length === 0) return 1;
  return Math.max(...array.map(item => item.id || 0)) + 1;
}

loadData();

app.get('/schedules', (req, res) => {
  res.json(db.schedules);
});

app.post('/schedules', (req, res) => {
  const newItem = {
    id: getNextId(db.schedules),
    barangay: req.body.barangay,
    collectionDay: req.body.collectionDay,
    collectionTime: req.body.collectionTime,
    truckNumber: req.body.truckNumber,
    collectorName: req.body.collectorName,
    status: req.body.status || 'Scheduled'
  };
  db.schedules.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.put('/schedules/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = db.schedules.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Schedule not found' });
  }
  db.schedules[index] = { ...db.schedules[index], ...req.body };
  saveData();
  res.json(db.schedules[index]);
});

app.delete('/schedules/:id', (req, res) => {
  const id = Number(req.params.id);
  db.schedules = db.schedules.filter(item => item.id !== id);
  saveData();
  res.json({ message: 'Deleted successfully' });
});

app.get('/reports', (req, res) => {
  res.json(db.reports);
});

app.post('/reports', (req, res) => {
  const newItem = {
    id: getNextId(db.reports),
    residentName: req.body.residentName,
    contactNumber: req.body.contactNumber,
    barangay: req.body.barangay,
    address: req.body.address,
    reason: req.body.reason,
    status: req.body.status || 'Pending',
    reportedAt: new Date().toISOString()
  };
  db.reports.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.put('/reports/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = db.reports.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Report not found' });
  }
  db.reports[index] = { ...db.reports[index], ...req.body };
  saveData();
  res.json(db.reports[index]);
});

app.delete('/reports/:id', (req, res) => {
  const id = Number(req.params.id);
  db.reports = db.reports.filter(item => item.id !== id);
  saveData();
  res.json({ message: 'Deleted successfully' });
});

app.get('/waste-routes', (req, res) => {
  res.json(db.wasteRoutes);
});

app.post('/waste-routes', (req, res) => {
  const newItem = {
    id: getNextId(db.wasteRoutes),
    truckNumber: req.body.truckNumber,
    driverName: req.body.driverName,
    assignedArea: req.body.assignedArea,
    currentLocation: req.body.currentLocation,
    estimatedStartTime: req.body.estimatedStartTime,
    estimatedEndTime: req.body.estimatedEndTime,
    status: req.body.status || 'Not Started',
    routeStops: req.body.routeStops || []
  };
  db.wasteRoutes.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.put('/waste-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = db.wasteRoutes.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Route not found' });
  }
  db.wasteRoutes[index] = { ...db.wasteRoutes[index], ...req.body };
  saveData();
  res.json(db.wasteRoutes[index]);
});

app.delete('/waste-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  db.wasteRoutes = db.wasteRoutes.filter(item => item.id !== id);
  saveData();
  res.json({ message: 'Deleted successfully' });
});

app.get('/routes', (req, res) => {
  console.log('GET /routes - returning', db.routes.length, 'traffic routes');
  res.json(db.routes);
});

app.post('/routes', (req, res) => {
  console.log('POST /routes - received:', req.body);
  
  const newItem = {
    id: getNextId(db.routes),
    name: req.body.name,
    status: req.body.status,
    congestionLevel: req.body.congestionLevel,
    lat: req.body.lat,
    lng: req.body.lng
  };
  
  db.routes.push(newItem);
  saveData();
  console.log('✅ Traffic route added, total:', db.routes.length);
  res.status(201).json(newItem);
});

app.put('/routes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = db.routes.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Traffic route not found' });
  }
  db.routes[index] = { ...db.routes[index], ...req.body };
  saveData();
  res.json(db.routes[index]);
});

app.delete('/routes/:id', (req, res) => {
  const id = Number(req.params.id);
  db.routes = db.routes.filter(item => item.id !== id);
  saveData();
  console.log('🗑️ Traffic route deleted, remaining:', db.routes.length);
  res.json({ message: 'Deleted successfully' });
});

app.get('/energy', (req, res) => {
  res.json(db.energyData);
});

app.post('/energy', (req, res) => {
  const newItem = {
    id: getNextId(db.energyData),
    location: req.body.location,
    consumption: req.body.consumption,
    timestamp: new Date().toISOString()
  };
  db.energyData.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.delete('/energy/:id', (req, res) => {
  const id = Number(req.params.id);
  db.energyData = db.energyData.filter(item => item.id !== id);
  saveData();
  res.json({ message: 'Deleted successfully' });
});

app.get('/api/vehicles', (req, res) => {
  res.json(db.vehicles);
});

app.post('/api/vehicles', (req, res) => {
  const newItem = {
    id: getNextId(db.vehicles),
    type: req.body.type,
    route: req.body.route,
    vehicleNumber: req.body.vehicleNumber,
    driver: req.body.driver,
    status: req.body.status || 'active',
    speed: req.body.speed || 0,
    occupancy: req.body.occupancy || 0,
    lat: req.body.lat || 14.5833,
    lng: req.body.lng || 121.0,
    nextStop: req.body.nextStop || 'Starting point',
    eta: req.body.eta || '0 mins',
    lastUpdate: new Date().toISOString()
  };
  db.vehicles.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.put('/api/vehicles/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = db.vehicles.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  db.vehicles[index] = { ...db.vehicles[index], ...req.body, lastUpdate: new Date().toISOString() };
  saveData();
  res.json(db.vehicles[index]);
});

app.delete('/api/vehicles/:id', (req, res) => {
  const id = Number(req.params.id);
  db.vehicles = db.vehicles.filter(item => item.id !== id);
  saveData();
  res.json({ message: 'Deleted successfully' });
});

app.get('/api/routes', (req, res) => {
  res.json([
    { id: 1, name: 'EDSA Carousel', type: 'Bus', stops: 25, frequency: '5 mins', status: 'operational' },
    { id: 2, name: 'C5', type: 'Bus', stops: 18, frequency: '10 mins', status: 'operational' }
  ]);
});

app.get('/api/stops', (req, res) => {
  res.json([
    { id: 1, name: 'Ayala Station', lat: 14.5583, lng: 121.0183, routes: ['EDSA Carousel'] },
    { id: 2, name: 'Market Market', lat: 14.5483, lng: 121.0653, routes: ['C5'] }
  ]);
});

app.get('/infrastructure-issues', (req, res) => {
  res.json(db.infrastructureIssues);
});

app.post('/infrastructure-issues', (req, res) => {
  const newItem = {
    id: getNextId(db.infrastructureIssues),
    title: req.body.title,
    location: req.body.location,
    category: req.body.category,
    description: req.body.description,
    severity: req.body.severity,
    status: req.body.status || 'Reported',
    reportedBy: req.body.reportedBy,
    contactNumber: req.body.contactNumber,
    reportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.infrastructureIssues.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.put('/infrastructure-issues/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = db.infrastructureIssues.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Issue not found' });
  }
  db.infrastructureIssues[index] = { ...db.infrastructureIssues[index], ...req.body, updatedAt: new Date().toISOString() };
  saveData();
  res.json(db.infrastructureIssues[index]);
});

app.delete('/infrastructure-issues/:id', (req, res) => {
  const id = Number(req.params.id);
  db.infrastructureIssues = db.infrastructureIssues.filter(item => item.id !== id);
  saveData();
  res.json({ message: 'Deleted successfully' });
});

app.get('/maintenance-teams', (req, res) => {
  res.json(db.maintenanceTeams);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
  console.log(`📊 Current data loaded:`);
  console.log(`   - Schedules: ${db.schedules.length}`);
  console.log(`   - Reports: ${db.reports.length}`);
  console.log(`   - Waste Routes: ${db.wasteRoutes.length}`);
  console.log(`   - Traffic Routes: ${db.routes.length}`);
  console.log(`   - Energy: ${db.energyData.length}`);
  console.log(`   - Vehicles: ${db.vehicles.length}`);
  console.log(`   - Infrastructure Issues: ${db.infrastructureIssues.length}`);
  console.log(`\n✅ Ready to accept requests\n`);
});