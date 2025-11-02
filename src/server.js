require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Import routes
const clientsRouter = require('./routes/clients.routes');
const patientsRouter = require('./routes/patients.routes');
const appointmentsRouter = require('./routes/appointments.routes');
const itemsRouter = require('./routes/items.routes');
const invoicesRouter = require('./routes/invoices.routes');
const reportsRouter = require('./routes/reports.routes');

// API Routes
app.use('/api/clients', clientsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/reports', reportsRouter);

// Web Routes (for front-end views)
app.get('/', (req, res) => {
  res.render('index', { title: 'Dashboard' });
});

app.get('/clients', (req, res) => {
  res.render('clients', { title: 'Clients' });
});

app.get('/patients', (req, res) => {
  res.render('patients', { title: 'Patients' });
});

app.get('/appointments', (req, res) => {
  res.render('appointments', { title: 'Appointments' });
});

app.get('/inventory', (req, res) => {
  res.render('inventory', { title: 'Inventory' });
});

app.get('/invoices', (req, res) => {
  res.render('invoices', { title: 'Invoices' });
});

app.get('/reports', (req, res) => {
  res.render('reports', { title: 'Reports' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vet Clinic API is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});
