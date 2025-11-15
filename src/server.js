require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const errorHandler = require('./middlewares/errorHandler');
const { authenticate, redirectIfAuthenticated } = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    },
  })
);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Import routes
const authRouter = require('./routes/auth.routes');
const publicRouter = require('./routes/public.routes');
const clientsRouter = require('./routes/clients.routes');
const patientsRouter = require('./routes/patients.routes');
const appointmentsRouter = require('./routes/appointments.routes');
const itemsRouter = require('./routes/items.routes');
const invoicesRouter = require('./routes/invoices.routes');
const reportsRouter = require('./routes/reports.routes');

// Public routes (no authentication required)
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);

// Protected API Routes
app.use('/api/clients', authenticate, clientsRouter);
app.use('/api/patients', authenticate, patientsRouter);
app.use('/api/appointments', authenticate, appointmentsRouter);
app.use('/api/items', authenticate, itemsRouter);
app.use('/api/invoices', authenticate, invoicesRouter);
app.use('/api/reports', authenticate, reportsRouter);

// Public web routes
app.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { title: 'Login', layout: false });
});

app.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { title: 'Register', layout: false });
});

app.get('/get_appoint', (req, res) => {
  res.render('book-appointment', { title: 'Book Appointment', layout: false });
});

// Protected web routes
app.get('/', authenticate, (req, res) => {
  res.render('index', { title: 'Dashboard', user: req.user });
});

app.get('/clients', authenticate, (req, res) => {
  res.render('clients', { title: 'Clients', user: req.user });
});

app.get('/patients', authenticate, (req, res) => {
  res.render('patients', { title: 'Patients', user: req.user });
});

app.get('/appointments', authenticate, (req, res) => {
  res.render('appointments', { title: 'Appointments', user: req.user });
});

app.get('/inventory', authenticate, (req, res) => {
  res.render('inventory', { title: 'Inventory', user: req.user });
});

app.get('/invoices', authenticate, (req, res) => {
  res.render('invoices', { title: 'Invoices', user: req.user });
});

app.get('/reports', authenticate, (req, res) => {
  res.render('reports', { title: 'Reports', user: req.user });
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
