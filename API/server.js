const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let schedules = [];
let reports = [];
let routes = [];

let energyData = [
  { id: 1, location: 'Building A', consumption: 120, timestamp: new Date() },
  { id: 2, location: 'Building B', consumption: 95, timestamp: new Date() },
  { id: 3, location: 'Street Lights Zone 1', consumption: 60, timestamp: new Date() }
];

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

app.get('/routes', (req, res) => {
  res.json(routes);
});

app.post('/routes', (req, res) => {
  const newRoute = {
    id: routes.length + 1,
    name: req.body.name || 'Unnamed Route',
    status: req.body.status || 'normal',
    congestionLevel: req.body.congestionLevel || 0,
    ...req.body
  };

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

app.get('/energy', (req, res) => {
  res.json(energyData);
});

app.post('/energy', (req, res) => {
  const newData = {
    id: energyData.length + 1,
    ...req.body,
    timestamp: new Date()
  };
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});