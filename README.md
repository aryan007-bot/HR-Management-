# 🚀 HR Management System (HRMS)

A modern **HR Management Software** designed to automate and simplify employee management, attendance tracking, and internal company operations.
Built with a full-stack architecture and mobile-first UI for real-world business usage.

---

## 📌 Overview

This HRMS platform helps organizations manage employees, HR operations, and internal records from a single dashboard.
The system removes manual HR processes like Excel sheets, paperwork, and manual attendance.

The software is designed for:

* Startups
* Small & Medium Businesses (SMBs)
* Remote teams

---

## ✨ Features

### 👤 Employee Management

* Add / Edit / Delete employees
* Department & role assignment
* Employee profile records
* Document storage

### 🔐 Authentication & Security

* Secure login system
* Role-based access (Admin / Employee)
* Protected routes

### 📊 Dashboard

* HR overview panel
* Employee statistics
* Attendance summaries

---

## 🧠 Tech Stack

### Frontend

* React Native
* Tailwind CSS
* ShadCN UI Components
* VITE

### Backend

* Node.js
* Express.js

### Database

* Supabase (PostgreSQL + Auth + Storage)

---

## 🏗️ System Architecture

Client (React Native App)
⬇
Node.js API Server (Business Logic)
⬇
Supabase Database & Storage

---

## 📱 Screenshots

*(Add screenshots here — VERY IMPORTANT for recruiters)*

* Login Screen
* Dashboard
* Attendance Panel
* Employee Profile
* Leave Request Page

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/hrms.git
cd hrms
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_secret
```

Run server:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 🔑 Environment Variables

| Variable     | Description               |
| ------------ | ------------------------- |
| SUPABASE_URL | Supabase project URL      |
| SUPABASE_KEY | Supabase anon/service key |
| JWT_SECRET   | Authentication secret     |
| PORT         | Backend server port       |

---

## 🎯 Real World Use Case

This software can be deployed inside a company to:

* Replace Excel based HR tracking
* Manage employees remotely
* Maintain centralized employee records
* Automate HR workflow

---

## 🧩 Future Improvements

* Payroll automation
* Biometric attendance integration
* Email notifications
* AI based employee analytics

---

## 👨‍💻 Author
Ansh Vashist  
Aryan Dagar


## 📄 License

This project is for educational and demonstration purposes.
