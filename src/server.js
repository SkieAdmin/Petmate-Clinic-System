require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const errorHandler = require('./middlewares/errorHandler');
const { authenticate, redirectIfAuthenticated, requireRole } = require('./middlewares/auth.middleware');
const { authenticateCustomer, redirectIfCustomerAuthenticated } = require('./middlewares/customer.middleware');
const customerService = require('./services/customer.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Performance Middleware
app.use(compression()); // Compress responses
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Static files with caching
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
}));

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
const treatmentsRouter = require('./routes/treatments.routes');
const prescriptionsRouter = require('./routes/prescriptions.routes');
const auditLogsRouter = require('./routes/auditLog.routes');
const customerRouter = require('./routes/customer.routes');
const consultationsRouter = require('./routes/consultations.routes');
const suppliersRouter = require('./routes/suppliers.routes');
const purchaseOrdersRouter = require('./routes/purchaseOrders.routes');
const receivingReportsRouter = require('./routes/receivingReports.routes');
const expensesRouter = require('./routes/expenses.routes');
const servicesRouter = require('./routes/services.routes');
const employeesRouter = require('./routes/employees.routes');
const admissionsRouter = require('./routes/admissions.routes');
const systemRouter = require('./routes/system.routes');
const walkInInvoicesRouter = require('./routes/walkInInvoices.routes');
const creditDepositsRouter = require('./routes/creditDeposits.routes');

// Public routes (no authentication required)
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/customer', customerRouter);

// Middleware to block doctors from certain routes
const blockDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'Doctor') {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctors do not have permission to access this resource.',
      });
    }
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware to block frontdesk from certain routes
const blockFrontdesk = (req, res, next) => {
  if (req.user && req.user.role === 'Frontdesk') {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Front desk staff do not have permission to access this resource.',
      });
    }
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware to require admin role only
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role !== 'Admin') {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can access this resource.',
      });
    }
    return res.redirect('/dashboard');
  }
  next();
};

// Protected API Routes
app.use('/api/clients', authenticate, blockDoctor, clientsRouter);
app.use('/api/patients', authenticate, blockFrontdesk, patientsRouter);
app.use('/api/appointments', authenticate, appointmentsRouter);
app.use('/api/items', authenticate, blockFrontdesk, itemsRouter);
app.use('/api/invoices', authenticate, requireAdmin, invoicesRouter);
app.use('/api/reports', authenticate, requireAdmin, reportsRouter);
app.use('/api/treatments', authenticate, treatmentsRouter);
app.use('/api/prescriptions', authenticate, prescriptionsRouter);
app.use('/api/audit-logs', authenticate, auditLogsRouter);
app.use('/api/consultations', authenticate, consultationsRouter);
app.use('/api/suppliers', authenticate, requireAdmin, suppliersRouter);
app.use('/api/purchase-orders', authenticate, requireAdmin, purchaseOrdersRouter);
app.use('/api/receiving-reports', authenticate, requireAdmin, receivingReportsRouter);
app.use('/api/expenses', authenticate, requireAdmin, expensesRouter);
app.use('/api/services', authenticate, servicesRouter);
app.use('/api/employees', authenticate, requireAdmin, employeesRouter);
app.use('/api/admissions', authenticate, admissionsRouter);
app.use('/api/system', authenticate, requireAdmin, systemRouter);
app.use('/api/walkin-invoices', authenticate, walkInInvoicesRouter);
app.use('/api/credit-deposits', authenticate, requireAdmin, creditDepositsRouter);

// Public web routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Home', layout: false });
});

app.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { title: 'Login', layout: false });
});

app.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { title: 'Register', layout: false });
});

// Redirect old public booking to customer registration
app.get('/get_appoint', (req, res) => {
  res.redirect('/customer/register');
});

// Customer Portal Web Routes
app.get('/customer/login', redirectIfCustomerAuthenticated, (req, res) => {
  res.render('customer/login', { title: 'Customer Login', layout: false });
});

app.get('/customer/register', redirectIfCustomerAuthenticated, (req, res) => {
  res.render('customer/register', { title: 'Customer Registration', layout: false });
});

app.get('/customer/dashboard', authenticateCustomer, async (req, res) => {
  const customer = await customerService.getProfile(req.customer.clientId);
  res.render('customer/dashboard', { title: 'Dashboard', customer, layout: 'customer/layout' });
});

app.get('/customer/pets', authenticateCustomer, async (req, res) => {
  const customer = await customerService.getProfile(req.customer.clientId);
  res.render('customer/pets', { title: 'My Pets', customer, layout: 'customer/layout' });
});

app.get('/customer/appointments', authenticateCustomer, async (req, res) => {
  const customer = await customerService.getProfile(req.customer.clientId);
  res.render('customer/appointments', { title: 'Appointments', customer, layout: 'customer/layout' });
});

app.get('/customer/invoices', authenticateCustomer, async (req, res) => {
  const customer = await customerService.getProfile(req.customer.clientId);
  res.render('customer/invoices', { title: 'Invoices', customer, layout: 'customer/layout' });
});

app.get('/customer/profile', authenticateCustomer, async (req, res) => {
  const customer = await customerService.getProfile(req.customer.clientId);
  res.render('customer/profile', { title: 'Profile', customer, layout: 'customer/layout' });
});

// Protected web routes
app.get('/dashboard', authenticate, (req, res) => {
  res.render('index', { title: 'Dashboard', user: req.user });
});

app.get('/clients', authenticate, blockDoctor, (req, res) => {
  res.render('clients', { title: 'Clients', user: req.user });
});

app.get('/patients', authenticate, blockFrontdesk, (req, res) => {
  res.render('patients', { title: 'Patients', user: req.user });
});

app.get('/appointments', authenticate, (req, res) => {
  res.render('appointments', { title: 'Appointments', user: req.user });
});

app.get('/inventory', authenticate, blockFrontdesk, (req, res) => {
  res.render('inventory', { title: 'Inventory', user: req.user });
});

app.get('/invoices', authenticate, requireAdmin, (req, res) => {
  res.render('invoices', { title: 'Invoices', user: req.user });
});

app.get('/reports', authenticate, requireAdmin, (req, res) => {
  res.render('reports', { title: 'Reports', user: req.user });
});

app.get('/audit-logs', authenticate, (req, res) => {
  res.render('audit-logs', { title: 'Audit Logs', user: req.user });
});

// Doctor consultation routes
app.get('/consultations', authenticate, (req, res) => {
  res.render('consultations', { title: 'Consultations', user: req.user });
});

app.get('/consultation-form', authenticate, (req, res) => {
  res.render('consultation-form', { title: 'Consultation Form', user: req.user });
});

app.get('/consultation-detail', authenticate, (req, res) => {
  res.render('consultation-detail', { title: 'Consultation Details', user: req.user });
});

// Admin module routes
app.get('/calendar', authenticate, (req, res) => {
  res.render('calendar', { title: 'Clinic Calendar', user: req.user });
});

app.get('/daily-schedule', authenticate, (req, res) => {
  res.render('daily-schedule', { title: 'Daily Schedule', user: req.user });
});

app.get('/admissions', authenticate, (req, res) => {
  res.render('admissions', { title: 'Admissions', user: req.user });
});

// Inventory module routes
app.get('/suppliers', authenticate, requireAdmin, (req, res) => {
  res.render('suppliers', { title: 'Suppliers', user: req.user });
});

app.get('/purchase-orders', authenticate, requireAdmin, (req, res) => {
  res.render('purchase-orders', { title: 'Purchase Orders', user: req.user });
});

app.get('/receiving-reports', authenticate, requireAdmin, (req, res) => {
  res.render('receiving-reports', { title: 'Receiving Reports', user: req.user });
});

app.get('/services', authenticate, (req, res) => {
  res.render('services', { title: 'Services', user: req.user });
});

// Sales module routes
app.get('/walkin-invoices', authenticate, (req, res) => {
  res.render('walkin-invoices', { title: 'Walk-in Invoices', user: req.user });
});

app.get('/expenses', authenticate, requireAdmin, (req, res) => {
  res.render('expenses', { title: 'Expenses', user: req.user });
});

app.get('/credit-deposits', authenticate, requireAdmin, (req, res) => {
  res.render('credit-deposits', { title: 'Credit Deposits', user: req.user });
});

app.get('/payment-transactions', authenticate, requireAdmin, (req, res) => {
  res.render('payment-transactions', { title: 'Payment Transactions', user: req.user });
});

// HR module routes
app.get('/employees', authenticate, requireAdmin, (req, res) => {
  res.render('employees', { title: 'Employees', user: req.user });
});

// System module routes
app.get('/company-info', authenticate, requireAdmin, (req, res) => {
  res.render('company-info', { title: 'Company Information', user: req.user });
});

app.get('/import-data', authenticate, requireAdmin, (req, res) => {
  res.render('import-data', { title: 'Import Data', user: req.user });
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
