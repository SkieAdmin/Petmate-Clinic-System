# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Optional message",
  "data": { ... },
  "count": 0 // For list endpoints
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## Clients API

### Get All Clients
```
GET /api/clients
```

**Query Parameters:**
- `search` (optional) - Search by name, email, or phone

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "(555) 123-4567",
      "email": "john.doe@email.com",
      "address": "123 Oak Street",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "_count": {
        "patients": 2,
        "invoices": 3
      }
    }
  ]
}
```

### Get Client by ID
```
GET /api/clients/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "(555) 123-4567",
    "email": "john.doe@email.com",
    "address": "123 Oak Street",
    "patients": [...],
    "invoices": [...]
  }
}
```

### Create Client
```
POST /api/clients
```

**Request Body:**
```json
{
  "name": "John Doe", // Required
  "phone": "(555) 123-4567",
  "email": "john.doe@email.com",
  "address": "123 Oak Street"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": { ... }
}
```

### Update Client
```
PUT /api/clients/:id
```

**Request Body:** Same as Create Client

**Response:**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": { ... }
}
```

### Delete Client
```
DELETE /api/clients/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

---

## Patients API

### Get All Patients
```
GET /api/patients
```

**Query Parameters:**
- `search` (optional) - Search by name, species, breed, or owner name
- `clientId` (optional) - Filter by client ID

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Rex",
      "species": "Dog",
      "breed": "German Shepherd",
      "birthDate": "2019-03-15T00:00:00.000Z",
      "notes": "Very friendly",
      "clientId": 1,
      "client": {
        "id": 1,
        "name": "John Doe"
      },
      "_count": {
        "appointments": 5
      }
    }
  ]
}
```

### Get Patient by ID
```
GET /api/patients/:id
```

### Create Patient
```
POST /api/patients
```

**Request Body:**
```json
{
  "name": "Rex", // Required
  "species": "Dog", // Required
  "breed": "German Shepherd",
  "birthDate": "2019-03-15",
  "notes": "Very friendly",
  "clientId": 1 // Required
}
```

### Update Patient
```
PUT /api/patients/:id
```

### Delete Patient
```
DELETE /api/patients/:id
```

---

## Appointments API

### Get All Appointments
```
GET /api/appointments
```

**Query Parameters:**
- `startDate` (optional) - Filter from this date (YYYY-MM-DD)
- `endDate` (optional) - Filter to this date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "dateTime": "2025-11-02T10:00:00.000Z",
      "reason": "Annual Vaccination",
      "status": "Scheduled",
      "notes": "Due for rabies vaccine",
      "patientId": 1,
      "patient": {
        "id": 1,
        "name": "Rex",
        "client": {
          "id": 1,
          "name": "John Doe"
        }
      }
    }
  ]
}
```

### Get Appointments by Date Range (Calendar View)
```
GET /api/appointments/calendar?startDate=2025-11-01&endDate=2025-11-30
```

### Get Today's Appointments
```
GET /api/appointments/today
```

### Get Appointment by ID
```
GET /api/appointments/:id
```

### Create Appointment
```
POST /api/appointments
```

**Request Body:**
```json
{
  "dateTime": "2025-11-05T10:00:00.000Z", // Required
  "patientId": 1, // Required
  "reason": "Annual Vaccination",
  "status": "Scheduled",
  "notes": "Due for rabies vaccine"
}
```

**Status Options:**
- `Scheduled` (default)
- `Completed`
- `Canceled`

### Update Appointment
```
PUT /api/appointments/:id
```

### Delete Appointment
```
DELETE /api/appointments/:id
```

---

## Items (Inventory) API

### Get All Items
```
GET /api/items
```

**Query Parameters:**
- `search` (optional) - Search by name or description
- `lowStockOnly` (optional) - Set to `true` to show only low stock items

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Rabies Vaccine",
      "description": "Standard rabies vaccination",
      "itemType": "Product",
      "quantity": 20,
      "minQuantity": 5,
      "price": 25.00
    }
  ]
}
```

### Get Low Stock Items
```
GET /api/items/low-stock
```

Returns items where `quantity <= minQuantity`

### Get Item by ID
```
GET /api/items/:id
```

### Create Item
```
POST /api/items
```

**Request Body:**
```json
{
  "name": "Rabies Vaccine", // Required
  "description": "Standard rabies vaccination",
  "itemType": "Product", // Product or Service (default: Product)
  "quantity": 20,
  "minQuantity": 5,
  "price": 25.00 // Required
}
```

**Item Types:**
- `Product` - Physical items (tracked in inventory)
- `Service` - Services (not tracked in inventory)

### Update Item
```
PUT /api/items/:id
```

### Update Item Quantity
```
PATCH /api/items/:id/quantity
```

**Request Body:**
```json
{
  "quantityChange": -5 // Negative to decrease, positive to increase
}
```

### Delete Item
```
DELETE /api/items/:id
```

---

## Invoices API

### Get All Invoices
```
GET /api/invoices
```

**Query Parameters:**
- `clientId` (optional) - Filter by client ID
- `status` (optional) - Filter by status (Paid/Unpaid)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "invoiceNumber": "INV-2025-0001",
      "date": "2025-11-01T00:00:00.000Z",
      "totalAmount": 120.00,
      "status": "Paid",
      "notes": "Payment received",
      "clientId": 1,
      "client": {
        "id": 1,
        "name": "John Doe"
      },
      "items": [
        {
          "id": 1,
          "quantity": 1,
          "priceEach": 50.00,
          "subtotal": 50.00,
          "item": {
            "id": 1,
            "name": "General Checkup"
          }
        }
      ]
    }
  ]
}
```

### Get Invoice by ID
```
GET /api/invoices/:id
```

### Generate PDF Invoice
```
GET /api/invoices/:id/pdf
```

Downloads the invoice as a PDF file.

### Create Invoice
```
POST /api/invoices
```

**Request Body:**
```json
{
  "clientId": 1, // Required
  "date": "2025-11-01", // Optional (defaults to now)
  "status": "Unpaid", // Optional (default: Unpaid)
  "notes": "Payment pending",
  "items": [ // Required (at least one item)
    {
      "itemId": 1,
      "quantity": 1,
      "priceEach": 50.00
    },
    {
      "itemId": 2,
      "quantity": 2,
      "priceEach": 25.00
    }
  ]
}
```

**Notes:**
- Invoice number is auto-generated (format: INV-YYYY-####)
- Total amount is calculated automatically
- For `Product` type items, inventory quantity is automatically decreased

**Status Options:**
- `Unpaid` (default)
- `Paid`

### Update Invoice
```
PUT /api/invoices/:id
```

**Request Body:**
```json
{
  "status": "Paid",
  "notes": "Payment received"
}
```

**Note:** Only `status` and `notes` can be updated. Items cannot be modified after invoice creation.

### Delete Invoice
```
DELETE /api/invoices/:id
```

---

## Reports API

### Get Dashboard Summary
```
GET /api/reports/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": {
      "total": 120
    },
    "patients": {
      "total": 300
    },
    "appointments": {
      "upcoming": 45,
      "today": 8,
      "todayList": [...]
    },
    "revenue": {
      "monthly": 5000.00,
      "total": 25000.00
    },
    "inventory": {
      "lowStock": 3
    },
    "invoices": {
      "total": 150
    }
  }
}
```

### Get Revenue Report
```
GET /api/reports/revenue?startDate=2025-11-01&endDate=2025-11-30
```

**Query Parameters:**
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "startDate": "2025-11-01",
    "endDate": "2025-11-30",
    "totalRevenue": 5000.00,
    "invoiceCount": 25,
    "invoices": [...]
  }
}
```

### Get Appointment Statistics
```
GET /api/reports/appointments?startDate=2025-11-01&endDate=2025-11-30
```

**Query Parameters:**
- `startDate` (optional) - Start date
- `endDate` (optional) - End date

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "scheduled": 45,
    "completed": 50,
    "canceled": 5
  }
}
```

### Get Top Clients by Revenue
```
GET /api/reports/top-clients?limit=10
```

**Query Parameters:**
- `limit` (optional) - Number of clients to return (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "(555) 123-4567",
      "totalRevenue": 1250.00,
      "invoiceCount": 8,
      "patientCount": 2
    }
  ]
}
```

---

## Status Codes

- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., duplicate unique field)
- `500` - Internal Server Error

---

## Common Use Cases

### Create a Complete Invoice Workflow

1. **Get client information**
   ```
   GET /api/clients/1
   ```

2. **Get available items**
   ```
   GET /api/items
   ```

3. **Create invoice**
   ```
   POST /api/invoices
   {
     "clientId": 1,
     "items": [
       { "itemId": 1, "quantity": 1, "priceEach": 50.00 },
       { "itemId": 2, "quantity": 1, "priceEach": 25.00 }
     ]
   }
   ```

4. **Download PDF**
   ```
   GET /api/invoices/1/pdf
   ```

### Schedule an Appointment

1. **Find patient**
   ```
   GET /api/patients?search=Rex
   ```

2. **Create appointment**
   ```
   POST /api/appointments
   {
     "patientId": 1,
     "dateTime": "2025-11-05T10:00:00Z",
     "reason": "Annual Checkup"
   }
   ```

### Check Low Stock Items

1. **Get low stock items**
   ```
   GET /api/items/low-stock
   ```

2. **Update stock for specific item**
   ```
   PATCH /api/items/3/quantity
   {
     "quantityChange": 20
   }
   ```

---

## Testing with cURL

### Create a Client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "(555) 234-5678",
    "email": "jane@email.com"
  }'
```

### Get All Clients
```bash
curl http://localhost:3000/api/clients
```

### Create an Invoice
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "items": [
      {"itemId": 1, "quantity": 1, "priceEach": 50.00}
    ]
  }'
```
