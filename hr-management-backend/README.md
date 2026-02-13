# HR Management System - Backend API

A production-ready backend system for managing complete HR lifecycle from visitor registration to employee offboarding.

## 🚀 Features

- **Complete HR Workflow**: Visitor → Interview → Selection → Employee → Offboarding
- **Role-Based Access Control**: SUPER_ADMIN, ADMIN_HR, HR
- **Document Management**: Upload and manage employee documents via Supabase Storage
- **Letter Generation**: Dynamic letter templates with variable replacement
- **Visitor Intelligence**: Automatic detection of rejoining/reapplying candidates
- **Duplicate Prevention**: Smart checking to prevent duplicate employee registrations
- **Multi-tenant Architecture**: Company-based data isolation

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Storage**: Supabase Storage
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
src/
├── config/           # Configuration files (Supabase, JWT)
├── controllers/      # Request handlers
├── services/         # Business logic layer
├── routes/          # API route definitions
├── middleware/      # Custom middleware (auth, validation)
├── validations/     # Zod schemas
├── utils/           # Utility functions (errors, helpers)
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js >= 16.x
- npm or yarn
- Supabase account

### 2. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor and execute the schema in `database/schema.sql`
3. Create a storage bucket named `employee-documents`:
   - Go to Storage
   - Create new bucket
   - Name: `employee-documents`
   - Set as Public bucket
4. Get your credentials from Settings → API

### 3. Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
```

Required environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 🔐 Authentication

### Default Super Admin

After running the database schema, a default super admin account is created:

```
Email: superadmin@system.com
Password: SuperAdmin@123
```

**IMPORTANT**: Change this password immediately in production!

### Login Flow

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "superadmin@system.com",
  "password": "SuperAdmin@123"
}

# Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "superadmin@system.com",
      "role": "SUPER_ADMIN",
      "full_name": "System Administrator"
    }
  }
}
```

### Using JWT Token

Include the token in all subsequent requests:

```
Authorization: Bearer eyJhbGc...
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | Register new user | SUPER_ADMIN, ADMIN_HR |
| GET | `/api/auth/profile` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/users` | Get all users | ADMIN_HR |

### Company Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/companies` | Create company | SUPER_ADMIN |
| GET | `/api/companies` | Get all companies | SUPER_ADMIN |
| GET | `/api/companies/:id` | Get company details | SUPER_ADMIN, ADMIN_HR |
| PUT | `/api/companies/:id` | Update company | SUPER_ADMIN |
| DELETE | `/api/companies/:id` | Delete company | SUPER_ADMIN |
| GET | `/api/companies/:id/stats` | Company statistics | ADMIN_HR |

### Visitor Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/visitors/register` | Register visitor | HR, ADMIN_HR |
| GET | `/api/visitors` | Get all visitors | HR, ADMIN_HR |
| GET | `/api/visitors/:id` | Get visitor details | HR, ADMIN_HR |
| PATCH | `/api/visitors/:id/status` | Update status | HR, ADMIN_HR |
| DELETE | `/api/visitors/:id` | Delete visitor | HR, ADMIN_HR |

### Employee Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/employees` | Create employee | HR, ADMIN_HR |
| POST | `/api/employees/convert/:visitorId` | Convert visitor | HR, ADMIN_HR |
| GET | `/api/employees` | Get all employees | HR, ADMIN_HR |
| GET | `/api/employees/:id` | Get employee details | HR, ADMIN_HR |
| PUT | `/api/employees/:id` | Update employee | HR, ADMIN_HR |
| POST | `/api/employees/:id/offboard` | Offboard employee | HR, ADMIN_HR |
| GET | `/api/employees/stats` | Employee statistics | HR, ADMIN_HR |

### Document Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/employees/:id/documents` | Upload document | HR, ADMIN_HR |
| GET | `/api/employees/:id/documents` | Get documents | HR, ADMIN_HR |
| GET | `/api/employees/:id/documents/:docId` | Get document | HR, ADMIN_HR |
| DELETE | `/api/employees/:id/documents/:docId` | Delete document | HR, ADMIN_HR |

### Template & Letter Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/templates` | Create template | ADMIN_HR |
| GET | `/api/templates` | Get templates | ADMIN_HR |
| GET | `/api/templates/:id` | Get template | ADMIN_HR |
| PUT | `/api/templates/:id` | Update template | ADMIN_HR |
| DELETE | `/api/templates/:id` | Delete template | ADMIN_HR |
| POST | `/api/employees/:id/generate-letter` | Generate letter | HR, ADMIN_HR |
| GET | `/api/employees/:id/letters` | Get letters | HR, ADMIN_HR |

## 🔄 Visitor Registration Logic

The system implements intelligent visitor registration:

```javascript
// Scenario 1: Active Employee Exists
{
  "allow": false,
  "reason": "Already Active Employee",
  "employee_id": "uuid",
  "employee_name": "John Doe"
}

// Scenario 2: Offboarded Employee (Rejoining)
{
  "allow": true,
  "candidate_type": "REJOINING",
  "visitor_id": "uuid"
}

// Scenario 3: Previously Rejected (Reapplying)
{
  "allow": true,
  "candidate_type": "REAPPLY",
  "visitor_id": "uuid"
}

// Scenario 4: New Candidate
{
  "allow": true,
  "candidate_type": "NEW",
  "visitor_id": "uuid"
}
```

## 📝 Example Usage

### 1. Register Visitor

```bash
POST /api/visitors/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "aadhaar_number": "123456789012",
  "address": "123 Main St, City"
}
```

### 2. Convert to Employee

```bash
POST /api/employees/convert/visitor-uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "department": "Engineering",
  "designation": "Software Engineer",
  "date_of_joining": "2024-01-15"
}
```

### 3. Upload Document

```bash
POST /api/employees/employee-uuid/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_type": "Aadhaar Card",
  "file_name": "aadhaar.pdf",
  "file_data": "base64_encoded_data",
  "content_type": "application/pdf"
}
```

### 4. Generate Letter

```bash
POST /api/employees/employee-uuid/generate-letter
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": "template-uuid",
  "additional_data": {
    "{{salary}}": "50000",
    "{{start_date}}": "2024-02-01"
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Fine-grained permissions
- **Rate Limiting**: Prevent abuse
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Company Isolation**: Data segregation per company
- **Aadhaar Uniqueness**: Prevent duplicate employees

## 🚦 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_ENTRY`: Unique constraint violation
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication failed
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests

## 📊 Employee Code Format

Auto-generated format: `CMP-YYYY-XXXX`

Example: `TEC-2024-0001`

- CMP: First 3 letters of company name
- YYYY: Current year
- XXXX: Sequential 4-digit number

## 🎯 Production Deployment

### Environment Variables

Ensure all environment variables are set:

```bash
NODE_ENV=production
SUPABASE_URL=<production_url>
SUPABASE_SERVICE_ROLE=<production_key>
JWT_SECRET=<strong_secret>
PORT=5000
```

### Supabase Configuration

1. Enable Row Level Security
2. Configure appropriate RLS policies
3. Set up backup schedules
4. Configure storage bucket policies

### Recommended Deployment Platforms

- **Render**: Easy deployment with auto-scaling
- **Railway**: Simple Node.js deployment
- **Heroku**: Classic platform
- **AWS EC2**: Full control
- **DigitalOcean**: App Platform

## 📈 Future Enhancements

- Interview scheduling system
- Attendance tracking
- Salary management
- Performance reviews
- Leave management
- Email notifications
- Webhook integrations
- Bulk operations
- Advanced reporting

## 🤝 Support

For issues or questions:
1. Check the API documentation
2. Review error messages
3. Check Supabase logs
4. Verify JWT token validity

## 📄 License

ISC

---

**Built with ❤️ for efficient HR management**
