# Veterinary Clinic System - Extension Implementation Plan

## Overview
This document outlines the extension of the existing Veterinary Clinic Management System with advanced features including user authentication, diagnosis management, laboratory tests, treatments, admissions, grooming services, and enhanced billing.

---

## ✅ Completed: Database Schema Extension

### New Prisma Models Added (10 models)

1. **Role** - User role definitions (Admin, Doctor, Frontdesk, Employee)
2. **User** - System users with authentication and role assignment
3. **Diagnosis** - Medical diagnosis records linked to patients and appointments
4. **Laboratory** - Lab test results linked to diagnoses
5. **Treatment** - Treatment records (CVC) linked to diagnoses
6. **Prescription** - Printable prescriptions (Recita) linked to diagnoses
7. **Admission** - Patient admission records (Infectious/Non-Infectious)
8. **Confinement** - Daily confinement status tracking
9. **Grooming** - Grooming service records with pricing
10. **Payment** - Enhanced payment tracking (Cash, GCash, Mixed)

### Enhanced Existing Models

- **Patient**: Added `weight`, `qrCode`, relations to diagnoses, admissions, groomings
- **Appointment**: Added `queueNumber`, `arrivedAt`, `confirmationInterval`, `doctorId`, enhanced status (Pending, Approved, Arrived, Completed, Canceled)
- **Invoice**: Added `preparedById` (staff member), `payment` relation

---

## Implementation Status

### Phase 1: Core Infrastructure ✅ COMPLETED

- [x] Extended Prisma schema with 10 new models
- [x] Updated package.json with new dependencies:
  - bcryptjs (password hashing)
  - jsonwebtoken (JWT auth)
  - express-session (session management)
  - qrcode (QR code generation)
  - twilio (SMS notifications)

### Phase 2: Authentication & Authorization 🔄 IN PROGRESS

#### Files to Create:

**Utilities:**
- `src/utils/auth.js` - Password hashing, JWT generation/verification
- `src/utils/qrcode.js` - QR code generation utilities
- `src/utils/sms.js` - SMS notification service (Twilio integration)

**Middlewares:**
- `src/middlewares/auth.js` - Authentication middleware (JWT verification)
- `src/middlewares/rbac.js` - Role-based access control middleware

**Services:**
- `src/services/auth.service.js` - Login, logout, token refresh
- `src/services/users.service.js` - User CRUD operations
- `src/services/roles.service.js` - Role management

**Controllers:**
- `src/controllers/auth.controller.js` - Authentication endpoints
- `src/controllers/users.controller.js` - User management endpoints
- `src/controllers/roles.controller.js` - Role management endpoints

**Routes:**
- `src/routes/auth.routes.js` - /api/auth/* endpoints
- `src/routes/users.routes.js` - /api/users/* endpoints
- `src/routes/roles.routes.js` - /api/roles/* endpoints

### Phase 3: Medical Modules 📋 PENDING

#### 3.1 Diagnosis Module
- `src/services/diagnosis.service.js`
- `src/controllers/diagnosis.controller.js`
- `src/routes/diagnosis.routes.js`
- `src/views/diagnosis.ejs`

#### 3.2 Laboratory Module
- `src/services/laboratory.service.js`
- `src/controllers/laboratory.controller.js`
- `src/routes/laboratory.routes.js`
- `src/views/laboratory.ejs`

#### 3.3 Treatment Module
- `src/services/treatment.service.js`
- `src/controllers/treatment.controller.js`
- `src/routes/treatment.routes.js`
- `src/views/treatment.ejs`

#### 3.4 Prescription Module
- `src/services/prescription.service.js`
- `src/controllers/prescription.controller.js`
- `src/routes/prescription.routes.js`
- PDF generation for prescriptions

### Phase 4: Admission & Confinement 📋 PENDING

- `src/services/admission.service.js`
- `src/services/confinement.service.js`
- `src/controllers/admission.controller.js`
- `src/controllers/confinement.controller.js`
- `src/routes/admission.routes.js`
- `src/routes/confinement.routes.js`
- `src/views/admission.ejs`
- `src/views/confinement.ejs`

### Phase 5: Grooming Module 📋 PENDING

- `src/services/grooming.service.js`
- `src/controllers/grooming.controller.js`
- `src/routes/grooming.routes.js`
- `src/views/grooming.ejs`
- Admin settings for grooming prices

### Phase 6: Enhanced Features 📋 PENDING

#### 6.1 Appointment Enhancements
- Update `appointments.service.js` with queue logic
- Add QR code scanning for check-in
- Implement confirmation interval logic

#### 6.2 Billing Enhancements
- Create `payment.service.js` for payment processing
- Update `invoices.controller.js` for multiple payment methods
- Add "Prepared By" field to receipts
- Generate Statement of Account

#### 6.3 QR Code Integration
- QR generation for patients
- QR generation for receipts/invoices
- QR scanning interface on dashboard

#### 6.4 Patient History
- Create comprehensive medical timeline view
- Include all visits, diagnosis, treatments, labs, admissions
- Filter by date range

#### 6.5 SMS Notifications
- Appointment reminders
- Payment confirmations
- Discharge notifications

### Phase 7: Frontend Updates 📋 PENDING

#### 7.1 Authentication Views
- `src/views/login.ejs` - Login page
- `src/views/register.ejs` - Registration (admin only)
- `src/views/profile.ejs` - User profile editing

#### 7.2 Navigation Updates
- Update `src/views/layout.ejs` with role-based navigation
- Add new modules to sidebar:
  - Diagnosis/Labs
  - Admissions
  - Grooming
  - User Management (Admin only)

#### 7.3 Dashboard Enhancements
- Update `src/views/index.ejs` with:
  - Confinement status cards
  - QR code scanner box
  - Enhanced metrics
  - Charts for appointments and income

#### 7.4 Module Views
- Create views for all new modules
- Add role-based visibility

### Phase 8: Testing & Documentation 📋 PENDING

- Update seed script with new sample data
- Test all RBAC permissions
- Update API documentation
- Create user guides for each role
- Update README with new features

---

## API Endpoints to Create

### Authentication (8 endpoints)
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/change-password
```

### Users (5 endpoints)
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Roles (5 endpoints)
```
GET    /api/roles
GET    /api/roles/:id
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id
```

### Diagnosis (5 endpoints)
```
GET    /api/diagnosis
GET    /api/diagnosis/:id
GET    /api/diagnosis/patient/:patientId
POST   /api/diagnosis
PUT    /api/diagnosis/:id
DELETE /api/diagnosis/:id
```

### Laboratory (Similar pattern for each module)
- Laboratory: 6 endpoints
- Treatment: 6 endpoints
- Prescription: 6 endpoints (+ PDF generation)
- Admission: 6 endpoints
- Confinement: 6 endpoints
- Grooming: 6 endpoints
- Payment: 5 endpoints

**Total New Endpoints: ~60+**

---

## Role-Based Access Control (RBAC)

### Role Permissions Matrix

| Module | Admin | Doctor | Frontdesk | Employee |
|--------|-------|--------|-----------|----------|
| Dashboard | ✅ | ✅ Custom | ✅ | ✅ Limited |
| Clients | ✅ | ✅ | ✅ | ❌ |
| Patients | ✅ | ✅ | ✅ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ❌ |
| Diagnosis | ✅ | ✅ | ❌ | ❌ |
| Laboratory | ✅ | ✅ View | ✅ | ❌ |
| Treatment | ✅ | ✅ | ❌ | ❌ |
| Prescription | ✅ | ✅ | ✅ View | ❌ |
| Admission | ✅ | ✅ | ✅ | ❌ |
| Billing | ✅ | ❌ | ✅ | ❌ |
| Inventory | ✅ | ❌ | ✅ | ❌ |
| Grooming | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ Limited | ✅ Limited | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

---

## QR Code Features

### QR Code Types

1. **Patient QR Code**
   - Unique per patient
   - Contains patient ID
   - Printed on patient records
   - Scannable for quick lookup

2. **Appointment QR Code**
   - Generated when appointment created
   - Contains appointment ID
   - Scan to mark as "Arrived"
   - Printed on appointment confirmation

3. **Invoice/Receipt QR Code**
   - Contains invoice number
   - Quick invoice lookup
   - Payment verification

### QR Code Functionality

- Generate on record creation
- Store QR code data in database
- Provide scanning interface on dashboard
- Auto-redirect to relevant record

---

## SMS Notification Triggers

1. **Appointment Created** → Send confirmation
2. **Appointment Reminder** → 1 day before
3. **Appointment Approved** → Status change notification
4. **Patient Arrived** → Notify doctor
5. **Invoice Created** → Payment reminder
6. **Payment Received** → Receipt confirmation
7. **Patient Discharged** → Discharge notice with instructions

---

## Enhanced Billing Features

### Payment Methods

1. **Cash**
   - Full cash payment
   - Receipt generated

2. **GCash**
   - Reference number required
   - Full GCash payment

3. **Mixed (Half-Cash/Half-GCash)**
   - Split amount between cash and GCash
   - Both amounts tracked separately
   - Single combined receipt

### Payment Receipt Format

```
VETERINARY CLINIC RECEIPT
Invoice #: INV-2025-0001
Date: November 2, 2025
Client: John Doe

Items:
- General Checkup     $50.00
- Rabies Vaccine      $25.00
                    ---------
Subtotal:             $75.00
Tax (if applicable):  $0.00
Total:                $75.00

Payment Method: Mixed
Cash:                 $40.00
GCash (Ref: 123456):  $35.00

Prepared By: Jane Smith (Frontdesk)

[QR CODE]
```

---

## Appointment Queue Logic

### Queue Number Assignment

1. Appointments sorted by `dateTime` ASC
2. Auto-assign queue numbers per day
3. Example: Day 1 → Queue #1, #2, #3...

### Status Workflow

```
Pending → Approved → Arrived → Completed
         ↘ Canceled ↙
```

### Confirmation Interval

- Set per appointment (e.g., 30 minutes)
- If patient doesn't arrive within interval after appointment time
- Status changes to "No Show" or stays "Approved"
- SMS reminder sent before appointment

---

## Grooming Module Details

### Service Types

1. **Clinic Service**
   - Performed at clinic
   - Base price per patient
   - Premium option available

2. **Home Service**
   - Performed at client's home
   - Higher base price
   - Travel fee included

### Pricing Structure

Admin configurable:
- Clinic Service Base Price
- Clinic Service Premium Price
- Home Service Base Price
- Home Service Premium Price

### Calculation Example

```
Service Type: Clinic
Base Price: $50
Premium Selected: Yes (+$20)
Number of Patients: 2

Total: ($50 + $20) × 2 = $140
```

---

## Patient Medical Timeline

### Timeline Components

Display chronologically:

1. **Appointments** (date, doctor, reason, status)
2. **Diagnoses** (date, doctor, diagnosis details)
3. **Lab Results** (date, test type, results)
4. **Treatments** (date, medication, dosage, duration)
5. **Prescriptions** (date, medications, instructions)
6. **Admissions** (admission date, type, discharge date, status)
7. **Confinement Updates** (date, status changes)
8. **Groomings** (date, service type, groomer)
9. **Invoices** (date, amount, payment status)

### Filters

- Date range picker
- Filter by type (appointments, diagnosis, labs, etc.)
- Search by doctor name
- Export to PDF

---

## Next Steps

### Immediate Actions Required

1. **Run Prisma Migration**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

2. **Install New Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Add to `.env`:
   ```
   # JWT Secret
   JWT_SECRET=your_secure_random_string_here
   JWT_EXPIRES_IN=24h

   # Session Secret
   SESSION_SECRET=your_session_secret_here

   # Twilio SMS (optional)
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Create Default Admin User**
   - Will be created in seed script
   - Username: admin
   - Password: admin123 (change after first login)

### Development Priorities

1. ✅ Schema extension (DONE)
2. 🔄 Authentication & RBAC (IN PROGRESS)
3. Medical modules (Diagnosis, Lab, Treatment)
4. Admission & Confinement
5. Enhanced Billing & Payments
6. Grooming Module
7. QR Code Integration
8. SMS Notifications
9. Frontend updates
10. Testing & Documentation

---

## Estimated Completion Time

- **Phase 2 (Auth & RBAC)**: 3-4 hours
- **Phase 3 (Medical Modules)**: 4-5 hours
- **Phase 4 (Admission)**: 2-3 hours
- **Phase 5 (Grooming)**: 2 hours
- **Phase 6 (Enhancements)**: 3-4 hours
- **Phase 7 (Frontend)**: 4-5 hours
- **Phase 8 (Testing/Docs)**: 2-3 hours

**Total Estimated Time**: 20-30 hours

---

## Success Criteria

- [x] All 10 new models in database
- [ ] User authentication working
- [ ] Role-based access control functional
- [ ] All medical modules operational
- [ ] QR codes generate and scan correctly
- [ ] SMS notifications send successfully
- [ ] Enhanced billing with multiple payment methods
- [ ] Patient timeline displays all records
- [ ] Grooming module with admin pricing
- [ ] Updated documentation
- [ ] Comprehensive seed data

---

**Status**: Database schema complete. Ready to proceed with authentication implementation.

**Next Action**: Create authentication utilities and middleware.
