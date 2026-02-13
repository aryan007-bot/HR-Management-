# HR Management System - API Examples

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "superadmin@system.com",
  "password": "SuperAdmin@123"
}
```

### Register User (SUPER_ADMIN or ADMIN_HR)
```http
POST /auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePass123",
  "role": "ADMIN_HR",
  "full_name": "Admin User",
  "company_id": "company-uuid-here"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

## Companies (SUPER_ADMIN)

### Create Company
```http
POST /companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Solutions Inc"
}
```

### Get All Companies
```http
GET /companies
Authorization: Bearer <token>
```

### Get Company Stats
```http
GET /companies/:companyId/stats
Authorization: Bearer <token>
```

## Visitors (HR, ADMIN_HR)

### Register Visitor
```http
POST /visitors/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "phone": "9876543210",
  "email": "jane@example.com",
  "aadhaar_number": "123456789012",
  "address": "456 Park Avenue, Mumbai",
  "remarks": "Referred by employee"
}
```

### Get All Visitors
```http
GET /visitors
Authorization: Bearer <token>
```

### Get Visitors by Status
```http
GET /visitors?status=PENDING
Authorization: Bearer <token>
```

### Get Visitor Details
```http
GET /visitors/:visitorId
Authorization: Bearer <token>
```

### Update Visitor Status
```http
PATCH /visitors/:visitorId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "REJECTED",
  "remarks": "Does not meet requirements"
}
```

## Employees (HR, ADMIN_HR)

### Convert Visitor to Employee
```http
POST /employees/convert/:visitorId
Authorization: Bearer <token>
Content-Type: application/json

{
  "department": "Engineering",
  "designation": "Senior Developer",
  "date_of_joining": "2024-02-15"
}
```

### Create Employee Directly
```http
POST /employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Robert Johnson",
  "phone": "9123456789",
  "email": "robert@company.com",
  "aadhaar_number": "987654321012",
  "department": "Sales",
  "designation": "Sales Manager",
  "date_of_joining": "2024-01-01",
  "status": "ACTIVE"
}
```

### Get All Employees
```http
GET /employees
Authorization: Bearer <token>
```

### Filter Employees
```http
GET /employees?status=ACTIVE&department=Engineering
Authorization: Bearer <token>
```

### Get Employee Details
```http
GET /employees/:employeeId
Authorization: Bearer <token>
```

### Update Employee
```http
PUT /employees/:employeeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "designation": "Lead Developer",
  "department": "Engineering"
}
```

### Offboard Employee
```http
POST /employees/:employeeId/offboard
Authorization: Bearer <token>
Content-Type: application/json

{
  "date_of_leaving": "2024-12-31"
}
```

### Get Employee Statistics
```http
GET /employees/stats
Authorization: Bearer <token>
```

## Documents (HR, ADMIN_HR)

### Upload Document
```http
POST /employees/:employeeId/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_type": "Aadhaar Card",
  "file_name": "aadhaar.pdf",
  "file_data": "<base64_encoded_file>",
  "content_type": "application/pdf"
}
```

### Get Employee Documents
```http
GET /employees/:employeeId/documents
Authorization: Bearer <token>
```

### Delete Document
```http
DELETE /employees/:employeeId/documents/:documentId
Authorization: Bearer <token>
```

## Letter Templates (ADMIN_HR)

### Create Template
```http
POST /templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "OFFER",
  "name": "Standard Offer Letter",
  "content": "<h1>Offer Letter</h1><p>Dear {{full_name}},</p><p>We are pleased to offer you the position of {{designation}} at our company.</p><p>Your joining date is {{date_of_joining}}.</p><p>Sincerely,<br>HR Department</p>"
}
```

### Get All Templates
```http
GET /templates
Authorization: Bearer <token>
```

### Get Active Templates by Type
```http
GET /templates?type=OFFER&is_active=true
Authorization: Bearer <token>
```

### Update Template
```http
PUT /templates/:templateId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Offer Letter",
  "content": "<h1>Updated Content</h1>"
}
```

## Letter Generation (HR, ADMIN_HR)

### Generate Letter
```http
POST /employees/:employeeId/generate-letter
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": "template-uuid",
  "additional_data": {
    "{{salary}}": "₹50,000",
    "{{probation_period}}": "3 months"
  }
}
```

### Get Employee Letters
```http
GET /employees/:employeeId/letters
Authorization: Bearer <token>
```

## Health Check

### Check API Status
```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "HR Management System API is running",
  "timestamp": "2024-02-09T10:30:00.000Z",
  "environment": "development"
}
```

## Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

## Testing Workflow

### 1. Setup Phase
1. Login as super admin
2. Create a company
3. Register ADMIN_HR for the company
4. Login as ADMIN_HR
5. Register HR users

### 2. Visitor Management
1. Register visitor (HR)
2. Check visitor details
3. Update visitor status

### 3. Employee Lifecycle
1. Convert visitor to employee
2. Upload employee documents
3. Generate offer letter
4. Update employee details
5. Offboard when needed

### 4. Template Management
1. Create letter templates (ADMIN_HR)
2. Generate letters for employees
3. View generated letters

## Notes

- Replace `<token>` with actual JWT token from login
- Replace `:id`, `:employeeId`, etc. with actual UUIDs
- All timestamps use ISO 8601 format
- File uploads use base64 encoding
- Aadhaar must be exactly 12 digits
- Phone must be exactly 10 digits
