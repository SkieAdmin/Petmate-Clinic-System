# Quick Start Guide

Get the Veterinary Clinic Management System up and running in 5 minutes!

## Prerequisites
- Node.js installed
- MySQL installed and running

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `.env` file:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/vet_clinic_db"
```

### 3. Create Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE vet_clinic_db;
EXIT;
```

### 4. Setup Database Tables
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Add Sample Data (Optional)
```bash
npm run prisma:seed
```

### 6. Start Application
```bash
npm run dev
```

### 7. Open in Browser
```
http://localhost:3000
```

## That's It!

You should now see the dashboard with sample data.

## Next Steps
- Explore all features through the sidebar navigation
- Read [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:seed` | Populate sample data |

## Project Structure

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API endpoints
├── views/          # EJS templates
└── server.js       # Main app file

prisma/
├── schema.prisma   # Database schema
└── seed.js         # Sample data

public/
└── css/
    └── style.css   # Styles (green theme)
```

## Main Features

✅ Client Management - Add/edit pet owners
✅ Patient Management - Track pets
✅ Appointments - Schedule visits
✅ Inventory - Track supplies with low-stock alerts
✅ Invoicing - Bill clients and generate PDFs
✅ Reports - View clinic statistics

## Need Help?

See the full [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions and troubleshooting.
