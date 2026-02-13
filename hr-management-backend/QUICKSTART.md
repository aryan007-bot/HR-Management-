# Quick Start Guide - 5 Minutes Setup

## ⚡ Fast Track Setup

### Step 1: Clone & Install (1 minute)

```bash
# Clone the repository (or create new folder)
mkdir hr-management-backend
cd hr-management-backend

# Copy all project files here

# Install dependencies
npm install
```

### Step 2: Supabase Setup (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to **SQL Editor** → **New Query**
4. Copy entire content from `database/schema.sql`
5. Paste and click **Run**
6. Go to **Storage** → Create bucket: `employee-documents` (Public)
7. Go to **Settings** → **API** → Copy your credentials

### Step 3: Environment Setup (1 minute)

```bash
# Create .env file
cp .env.example .env

# Edit .env (use nano, vim, or any editor)
nano .env
```

Paste your Supabase credentials:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE=eyJhbGc...
JWT_SECRET=my-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
```

### Step 4: Start Server (30 seconds)

```bash
npm run dev
```

You should see:
```
🚀 HR Management System Backend
📡 Server running on port: 5000
🌍 Environment: development
```

### Step 5: Test It (30 seconds)

Open new terminal and test:

```bash
# Health check
curl http://localhost:5000/health

# Login (default super admin)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@system.com",
    "password": "SuperAdmin@123"
  }'
```

You should get a JWT token in response! 🎉

## 🎯 What to Do Next

### 1. Change Default Password (IMPORTANT!)

Use the token from login:

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SuperAdmin@123",
    "newPassword": "NewSecurePassword@2024"
  }'
```

### 2. Create Your First Company

```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company"
  }'
```

### 3. Create Admin HR User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "SecurePass123",
    "role": "ADMIN_HR",
    "full_name": "HR Admin",
    "company_id": "YOUR_COMPANY_ID_FROM_STEP_2"
  }'
```

### 4. Register Your First Visitor

Login as HR and:

```bash
curl -X POST http://localhost:5000/api/visitors/register \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "aadhaar_number": "123456789012",
    "address": "123 Main St"
  }'
```

## 🛠️ Useful Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Check if running
curl http://localhost:5000/health

# View all routes
# Open browser: http://localhost:5000
```

## 📱 Test with Postman or Thunder Client

1. Import the examples from `API_EXAMPLES.md`
2. Set up environment variable for token
3. Test all endpoints

## 🚨 Common Issues

### Port Already in Use
```bash
# Change PORT in .env to 3000 or 8000
PORT=3000
```

### Supabase Connection Error
- Double-check URL and keys in .env
- Make sure no extra spaces
- Verify project is not paused

### Database Schema Error
- Make sure you ran the SQL from `database/schema.sql`
- Check Supabase SQL Editor for errors

### JWT Token Invalid
- Check if JWT_SECRET matches
- Token might be expired (default: 7 days)

## 📚 Next Steps

1. Read `README.md` for complete documentation
2. Check `API_EXAMPLES.md` for all endpoints
3. Review `DEPLOYMENT.md` when ready to deploy
4. Explore the codebase in `src/` folder

## 🎓 Understanding the Flow

```
1. Super Admin (You)
   ↓
2. Creates Company
   ↓
3. Creates Admin HR for that Company
   ↓
4. Admin HR creates HR users
   ↓
5. HR registers Visitors
   ↓
6. HR converts Visitors → Employees
   ↓
7. HR uploads documents
   ↓
8. HR generates letters
```

## 💡 Pro Tips

- Use environment variables for all secrets
- Always test in development first
- Keep Supabase dashboard open to monitor DB
- Use Postman collections for easier testing
- Check logs if something doesn't work

## 🎉 You're All Set!

Your backend is running. Now you can:
- Build a frontend (React, Vue, Angular)
- Use it with mobile apps (React Native, Flutter)
- Integrate with existing systems
- Deploy to production

Need help? Check the full documentation in README.md

---

**Happy Coding! 🚀**
