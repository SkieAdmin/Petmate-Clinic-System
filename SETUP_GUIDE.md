# Setup Guide - Veterinary Clinic Management System

This guide will walk you through setting up the application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MySQL** (version 8.0 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP/MAMP which includes MySQL
   - Verify installation: `mysql --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

### Optional Tools

- **MySQL Workbench** - Visual database management tool
- **Postman** - For testing API endpoints
- **Git** - For version control

---

## Step-by-Step Installation

### Step 1: Navigate to Project Directory

Open your terminal/command prompt and navigate to the project folder:

```bash
cd "c:\Users\admin\Desktop\Petclinic Sys"
```

### Step 2: Install Node.js Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- Express.js - Web framework
- Prisma - ORM for database
- EJS - Template engine
- PDFKit - PDF generation
- And other dependencies

**Expected output:** A `node_modules` folder will be created with all dependencies.

### Step 3: Set Up MySQL Database

#### Option A: Using MySQL Command Line

1. **Start MySQL Server**
   ```bash
   # On Windows (if MySQL is in PATH)
   mysql.server start

   # Or start MySQL through Services (Windows)
   # Or use XAMPP/WAMP control panel
   ```

2. **Login to MySQL**
   ```bash
   mysql -u root -p
   ```
   Enter your MySQL root password when prompted.

3. **Create Database**
   ```sql
   CREATE DATABASE vet_clinic_db;
   ```

4. **Verify Database Creation**
   ```sql
   SHOW DATABASES;
   ```
   You should see `vet_clinic_db` in the list.

5. **Exit MySQL**
   ```sql
   EXIT;
   ```

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL instance
3. Click "Create a new schema" icon
4. Name it `vet_clinic_db`
5. Click "Apply"

### Step 4: Configure Environment Variables

1. **Copy the example environment file**
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

2. **Edit the `.env` file**

   Open `.env` in a text editor and update:

   ```env
   DATABASE_URL="mysql://root:your_password@localhost:3306/vet_clinic_db"
   PORT=3000
   NODE_ENV=development
   ```

   Replace:
   - `root` - with your MySQL username (usually "root")
   - `your_password` - with your MySQL password
   - `localhost` - with your MySQL host (usually localhost)
   - `3306` - with your MySQL port (default is 3306)

   **Example:**
   ```env
   DATABASE_URL="mysql://root:MyPassword123@localhost:3306/vet_clinic_db"
   ```

### Step 5: Set Up Prisma

1. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

   This creates the Prisma Client based on your schema.

2. **Run Database Migrations**
   ```bash
   npm run prisma:migrate
   ```

   When prompted for a migration name, enter: `init`

   This creates all database tables based on the Prisma schema.

3. **Verify Tables Were Created**

   Login to MySQL and check:
   ```sql
   USE vet_clinic_db;
   SHOW TABLES;
   ```

   You should see:
   - clients
   - patients
   - appointments
   - items
   - invoices
   - invoice_items
   - _prisma_migrations

### Step 6: Seed the Database (Optional but Recommended)

Populate the database with sample data:

```bash
npm run prisma:seed
```

This creates:
- 4 sample clients (pet owners)
- 6 sample patients (pets)
- 7 inventory items (vaccines, services, etc.)
- 4 sample appointments
- 3 sample invoices

**Expected output:**
```
Starting database seed...
Clearing existing data...
Creating clients...
Creating patients...
Creating inventory items...
Creating appointments...
Creating invoices...
Database seed completed successfully!
Summary:
- 4 Clients created
- 6 Patients created
- 7 Inventory items created
- 4 Appointments created
- 3 Invoices created
```

### Step 7: Start the Application

#### Development Mode (Recommended for Testing)

Start with auto-restart on file changes:

```bash
npm run dev
```

**Expected output:**
```
[nodemon] starting `node src/server.js`
Server running on http://localhost:3000
Environment: development
```

#### Production Mode

Start normally:

```bash
npm start
```

### Step 8: Access the Application

1. **Open your web browser**

2. **Navigate to:**
   ```
   http://localhost:3000
   ```

3. **You should see the Dashboard page** with:
   - Client and patient statistics
   - Revenue information
   - Today's appointments
   - Low stock alerts

---

## Verification Checklist

After setup, verify everything works:

- [ ] Application opens at http://localhost:3000
- [ ] Dashboard shows statistics
- [ ] Clients page loads and shows sample clients
- [ ] Patients page shows sample pets
- [ ] Appointments page displays appointments
- [ ] Inventory page shows items with low-stock indicators
- [ ] Invoices page lists invoices
- [ ] Reports page displays metrics
- [ ] Can create a new client
- [ ] Can generate a PDF invoice

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Verify MySQL is running
   ```bash
   # Check MySQL status
   mysqladmin -u root -p status
   ```

2. Check your DATABASE_URL in `.env`
   - Ensure username and password are correct
   - Ensure database name is correct
   - Ensure MySQL is running on specified port

3. Test database connection manually:
   ```bash
   mysql -u root -p vet_clinic_db
   ```

### Issue: "Port 3000 is already in use"

**Solution:**
1. Change the PORT in `.env` file:
   ```env
   PORT=3001
   ```

2. Or stop the process using port 3000:
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F

   # On Mac/Linux
   lsof -ti:3000 | xargs kill
   ```

### Issue: "Prisma Client is not generated"

**Solution:**
```bash
npm run prisma:generate
```

### Issue: "Migration failed"

**Solution:**
1. Reset the database:
   ```bash
   npx prisma migrate reset
   ```
   Warning: This will delete all data!

2. Run migrations again:
   ```bash
   npm run prisma:migrate
   ```

### Issue: "npm install fails"

**Solution:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. Install again:
   ```bash
   npm install
   ```

### Issue: "Module not found"

**Solution:**
```bash
npm install
npm run prisma:generate
```

### Issue: "Seed script fails"

**Solution:**
1. Ensure migrations are run:
   ```bash
   npm run prisma:migrate
   ```

2. Check database connection in `.env`

3. Run seed again:
   ```bash
   npm run prisma:seed
   ```

---

## Development Tools

### Prisma Studio

To view and edit your database visually:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Edit records
- Add new records
- Delete records

### API Testing with Postman

1. Download Postman from https://www.postman.com/

2. Import the following endpoints:
   - Base URL: `http://localhost:3000/api`

3. Test endpoints like:
   - GET `http://localhost:3000/api/clients`
   - POST `http://localhost:3000/api/clients` with JSON body

### Browser DevTools

Press F12 in your browser to:
- View console logs
- Inspect network requests
- Debug JavaScript

---

## Next Steps

After successful setup:

1. **Explore the Application**
   - Navigate through all pages
   - Try creating, editing, and deleting records
   - Generate a PDF invoice

2. **Customize**
   - Update clinic name in `src/views/layout.ejs`
   - Modify colors in `public/css/style.css`
   - Add your clinic logo

3. **Development**
   - Read the API documentation in `API_DOCUMENTATION.md`
   - Explore the codebase structure
   - Make modifications as needed

4. **Deploy** (when ready)
   - Set `NODE_ENV=production` in `.env`
   - Use a production database
   - Deploy to a hosting service (Heroku, DigitalOcean, AWS, etc.)

---

## Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Express.js Guide**: https://expressjs.com/
- **EJS Documentation**: https://ejs.co/
- **MySQL Documentation**: https://dev.mysql.com/doc/

---

## Getting Help

If you encounter issues not covered here:

1. Check the main `README.md` file
2. Review `API_DOCUMENTATION.md` for API details
3. Check Prisma Studio for database state
4. Review server logs in the terminal
5. Check browser console for frontend errors

---

## Success!

If you've completed all steps successfully, your Veterinary Clinic Management System is now running and ready to use!

Access it at: **http://localhost:3000**
