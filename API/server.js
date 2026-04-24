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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});