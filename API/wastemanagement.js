const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let schedules = [
  {
    id: 1,
    barangay: 'Barangay Sto. Cristo',
    collectionDay: 'Monday',
    collectionTime: '8:00 AM',
    truckNumber: 'TRK-101',
    collectorName: 'Juan Dela Cruz',
    status: 'Scheduled'
  },
  {
    id: 2,
    barangay: 'Barangay Muzon',
    collectionDay: 'Wednesday',
    collectionTime: '10:00 AM',
    truckNumber: 'TRK-205',
    collectorName: 'Pedro Santos',
    status: 'Ongoing'
  }
];

let reports = [
  {
    id: 1,
    residentName: 'Maria Reyes',
    contactNumber: '09171234567',
    barangay: 'Barangay Sto. Cristo',
    address: 'Block 5 Lot 10',
    missedDate: '2026-04-20',
    reason: 'Truck did not arrive',
    status: 'Pending',
    reportedAt: '2026-04-21'
  },
  {
    id: 2,
    residentName: 'Jose Cruz',
    contactNumber: '09987654321',
    barangay: 'Barangay Muzon',
    address: 'Purok 3',
    missedDate: '2026-04-19',
    reason: 'Garbage was left behind',
    status: 'Investigating',
    reportedAt: '2026-04-20'
  }
];

let routes = [
  {
    id: 1,
    truckNumber: 'TRK-101',
    driverName: 'Carlos Mendoza',
    assignedArea: 'Barangay Sto. Cristo',
    routeStops: ['Street 1', 'Street 2', 'Street 3'],
    estimatedStartTime: '7:00 AM',
    estimatedEndTime: '1:00 PM',
    currentLocation: 'Street 2',
    fuelLevel: 80,
    status: 'In Progress'
  },
  {
    id: 2,
    truckNumber: 'TRK-205',
    driverName: 'Ana Santos',
    assignedArea: 'Barangay Muzon',
    routeStops: ['Area A', 'Area B', 'Area C'],
    estimatedStartTime: '8:00 AM',
    estimatedEndTime: '2:00 PM',
    currentLocation: 'Area A',
    fuelLevel: 65,
    status: 'Not Started'
  }
];

let bins = [
  {
    id: 1,
    location: 'Barangay Sto. Cristo Plaza',
    fillLevel: 85,
    wasteType: 'Biodegradable',
    lastCollected: '2026-04-21',
    status: 'Almost Full'
  },
  {
    id: 2,
    location: 'Barangay Muzon Market',
    fillLevel: 95,
    wasteType: 'Recyclable',
    lastCollected: '2026-04-20',
    status: 'Full'
  }
];

let analytics = {
  totalPickupsToday: 45,
  missedPickupsToday: 3,
  activeTrucks: 6,
  completedRoutes: 4,
  totalWasteCollectedKg: 1250
};

// SCHEDULES
app.get('/schedules', (req, res) => {
  res.json(schedules);
});

app.post('/schedules', (req, res) => {
  const newSchedule = {
    id: schedules.length + 1,
    ...req.body
  };

  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
});

app.put('/schedules/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const index = schedules.findIndex(schedule => schedule.id === id);

  if (index !== -1) {
    schedules[index] = {
      ...schedules[index],
      ...req.body
    };

    res.json(schedules[index]);
  } else {
    res.status(404).json({ message: 'Schedule not found' });
  }
});

app.delete('/schedules/:id', (req, res) => {
  const id = parseInt(req.params.id);

  schedules = schedules.filter(schedule => schedule.id !== id);

  res.json({ message: 'Schedule deleted successfully' });
});

// REPORTS
app.get('/reports', (req, res) => {
  res.json(reports);
});

app.post('/reports', (req, res) => {
  const newReport = {
    id: reports.length + 1,
    ...req.body
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});

app.put('/reports/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const index = reports.findIndex(report => report.id === id);

  if (index !== -1) {
    reports[index] = {
      ...reports[index],
      ...req.body
    };

    res.json(reports[index]);
  } else {
    res.status(404).json({ message: 'Report not found' });
  }
});

app.delete('/reports/:id', (req, res) => {
  const id = parseInt(req.params.id);

  reports = reports.filter(report => report.id !== id);

  res.json({ message: 'Report deleted successfully' });
});

// ROUTES
app.get('/routes', (req, res) => {
  res.json(routes);
});

app.post('/routes', (req, res) => {
  const newRoute = {
    id: routes.length + 1,
    ...req.body
  };

  routes.push(newRoute);
  res.status(201).json(newRoute);
});

app.put('/routes/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const index = routes.findIndex(route => route.id === id);

  if (index !== -1) {
    routes[index] = {
      ...routes[index],
      ...req.body
    };

    res.json(routes[index]);
  } else {
    res.status(404).json({ message: 'Route not found' });
  }
});

app.delete('/routes/:id', (req, res) => {
  const id = parseInt(req.params.id);

  routes = routes.filter(route => route.id !== id);

  res.json({ message: 'Route deleted successfully' });
});

// BINS
app.get('/bins', (req, res) => {
  res.json(bins);
});

app.post('/bins', (req, res) => {
  const newBin = {
    id: bins.length + 1,
    ...req.body
  };

  bins.push(newBin);
  res.status(201).json(newBin);
});

app.put('/bins/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const index = bins.findIndex(bin => bin.id === id);

  if (index !== -1) {
    bins[index] = {
      ...bins[index],
      ...req.body
    };

    res.json(bins[index]);
  } else {
    res.status(404).json({ message: 'Bin not found' });
  }
});

app.delete('/bins/:id', (req, res) => {
  const id = parseInt(req.params.id);

  bins = bins.filter(bin => bin.id !== id);

  res.json({ message: 'Bin deleted successfully' });
});

// ANALYTICS
app.get('/analytics', (req, res) => {
  res.json(analytics);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});