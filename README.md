# Veterinary Clinic Management System

A simplified, user-friendly web application for managing veterinary clinic operations including clients, patients, appointments, inventory, billing, and reporting.

## Features

- **Client & Patient Management**: Manage pet owners and their pets with full CRUD functionality and search capabilities
- **Appointments**: Schedule and manage appointments with calendar interface and filtering
- **Billing & Invoices**: Create invoices for services and products with PDF generation
- **Inventory Management**: Track clinic inventory with low-stock alerts
- **Reports Dashboard**: View key metrics including client/patient counts, appointments, and revenue

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Frontend**: EJS templates with vanilla JavaScript
- **PDF Generation**: PDFKit
- **Styling**: Custom CSS with green and white theme

## Project Structure

```
vet-clinic-app/
├── prisma/
│   ├── schema.prisma          # Database schema definitions
│   ├── migrations/            # Database migration files
│   └── seed.js                # Database seed script
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── clients.controller.js
│   │   ├── patients.controller.js
│   │   ├── appointments.controller.js
│   │   ├── items.controller.js
│   │   ├── invoices.controller.js
│   │   └── reports.controller.js
│   ├── services/              # Business logic layer
│   │   ├── clients.service.js
│   │   ├── patients.service.js
│   │   ├── appointments.service.js
│   │   ├── items.service.js
│   │   ├── invoices.service.js
│   │   └── reports.service.js
│   ├── routes/                # API route definitions
│   │   ├── clients.routes.js
│   │   ├── patients.routes.js
│   │   ├── appointments.routes.js
│   │   ├── items.routes.js
│   │   ├── invoices.routes.js
│   │   └── reports.routes.js
│   ├── middlewares/           # Express middlewares
│   │   └── errorHandler.js
│   ├── utils/                 # Utility functions
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── asyncHandler.js    # Async error handler
│   ├── views/                 # EJS templates
│   │   ├── layout.ejs         # Main layout template
│   │   ├── index.ejs          # Dashboard
│   │   ├── clients.ejs        # Client management
│   │   ├── patients.ejs       # Patient management
│   │   ├── appointments.ejs   # Appointments
│   │   ├── inventory.ejs      # Inventory management
│   │   ├── invoices.ejs       # Invoice management
│   │   └── reports.ejs        # Reports page
│   └── server.js              # Main application entry point
├── public/
│   └── css/
│       └── style.css          # Application styles
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation

### 1. Clone or download the project

```bash
cd "c:\Users\admin\Desktop\Petclinic Sys"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the database connection string:

```env
DATABASE_URL="mysql://username:password@localhost:3306/vet_clinic_db"
PORT=3000
NODE_ENV=development
```

Replace `username` and `password` with your MySQL credentials.

### 4. Create the database

Create a new MySQL database:

```sql
CREATE DATABASE vet_clinic_db;
```

### 5. Run Prisma migrations

Generate Prisma Client and create database tables:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Seed the database (optional)

Populate the database with demo data:

```bash
npm run prisma:seed
```

This will create:
- 4 sample clients
- 6 sample patients (pets)
- 7 inventory items
- 4 appointments
- 3 invoices

### 7. Start the application

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The application will be available at: `http://localhost:3000`

## Usage

### Main Pages

- **Dashboard** (`/`): Overview of clinic statistics and today's appointments
- **Clients** (`/clients`): Manage pet owners
- **Patients** (`/patients`): Manage pets
- **Appointments** (`/appointments`): Schedule and view appointments
- **Inventory** (`/inventory`): Track items and supplies
- **Invoices** (`/invoices`): Create and manage billing
- **Reports** (`/reports`): View detailed statistics and reports

### Key Features

#### Client Management
- Add, edit, and delete clients
- Search clients by name, email, or phone
- View client's pets and invoices

#### Patient Management
- Add, edit, and delete patient records
- Associate patients with clients
- Track species, breed, birth date, and notes

#### Appointments
- Create, update, and delete appointments
- Filter by date range
- View today's appointments
- Track appointment status (Scheduled, Completed, Canceled)

#### Inventory
- Add and manage inventory items
- Track product quantities
- Set minimum stock thresholds
- Get alerts for low-stock items

#### Invoicing
- Create invoices for clients
- Add multiple items/services to invoices
- Generate PDF invoices
- Track payment status (Paid/Unpaid)
- Automatic inventory deduction for products

#### Reports
- View total clients, patients, and revenue
- Appointment statistics
- Top clients by revenue
- Custom date range revenue reports

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients (with optional search)
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Patients
- `GET /api/patients` - Get all patients (with optional search)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/calendar?startDate=&endDate=` - Get appointments by date range
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Inventory Items
- `GET /api/items` - Get all items
- `GET /api/items/low-stock` - Get low stock items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `PATCH /api/items/:id/quantity` - Update item quantity
- `DELETE /api/items/:id` - Delete item

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `GET /api/invoices/:id/pdf` - Download invoice as PDF
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Reports
- `GET /api/reports/summary` - Get dashboard summary
- `GET /api/reports/revenue?startDate=&endDate=` - Get revenue report
- `GET /api/reports/appointments?startDate=&endDate=` - Get appointment statistics
- `GET /api/reports/top-clients?limit=10` - Get top clients by revenue

## Database Schema

### Client
- id, name, phone, email, address
- Relations: patients (one-to-many), invoices (one-to-many)

### Patient
- id, name, species, breed, birthDate, notes, clientId
- Relations: client (many-to-one), appointments (one-to-many)

### Appointment
- id, dateTime, reason, status, notes, patientId, invoiceId
- Relations: patient (many-to-one), invoice (many-to-one)

### Item
- id, name, description, itemType, quantity, minQuantity, price
- Relations: invoiceItems (one-to-many)

### Invoice
- id, invoiceNumber, date, totalAmount, status, notes, clientId
- Relations: client (many-to-one), items (one-to-many through InvoiceItem)

### InvoiceItem
- id, quantity, priceEach, subtotal, invoiceId, itemId
- Relations: invoice (many-to-one), item (many-to-one)

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Prisma Studio

To visualize and edit your database:

```bash
npm run prisma:studio
```

This will open Prisma Studio at `http://localhost:5555`

## Design

### Color Scheme
- Primary Green: `#2d6a4f`
- Light Green: `#52b788`
- Dark Green: `#1b4332`
- Background: White (`#ffffff`)
- Light Background: `#f8f9fa`

### Responsive Design
- Desktop: Full sidebar navigation
- Mobile: Collapsible hamburger menu
- Responsive tables and forms

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL in `.env` file
- Ensure database exists: `CREATE DATABASE vet_clinic_db;`

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 3000

### Prisma Errors
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations

### Missing Dependencies
- Run `npm install` to ensure all dependencies are installed

## Future Enhancements

- User authentication and authorization
- Role-based access control (Admin, Vet, Receptionist)
- Medical records and vaccination logs
- File upload for pet photos and documents
- Email/SMS appointment reminders
- Advanced reporting with charts
- Multi-clinic support
- Payment processing integration

## License

ISC

## Support

For issues or questions, please create an issue in the project repository.
