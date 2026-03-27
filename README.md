# PlaceMe - Placement Management System

A comprehensive web application for managing student placements, job postings, and interview scheduling. Built with React, Node.js, and MySQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Usage Guide](#usage-guide)

## 🎯 Overview

PlaceMe is a placement management system designed for educational institutions to streamline the hiring process. It enables:

- **Students**: Apply to jobs, track applications, view interview schedules, and update profiles
- **Administrators**: Post jobs, manage applicants, schedule interviews, and track placements
- **Companies**: Post opportunities and interact with qualified candidates

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios with JWT authentication
- **Icons**: Lucide React
- **Notifications**: Sonner Toast
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Prepared statements for SQL injection prevention

### Database
- **DBMS**: MySQL
- **Connection Pool**: mysql2/promise

## 📁 Project Structure

```
PlaceMe/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── UpdateProfileDialog.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── CompanyDashboard.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   └── ...
│   │   ├── context/            # State management
│   │   │   ├── AuthContext.jsx
│   │   │   └── PlacementContext.jsx
│   │   ├── api/
│   │   │   └── tokenHandler.js # API client with JWT
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                     # Express.js backend
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── adminController.js
│   │   └── companyController.js
│   ├── routes/                 # API route definitions
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── adminRoutes.js
│   │   └── companyRoutes.js
│   ├── middleware/             # Express middleware
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── config/                 # Configuration files
│   │   ├── db.js              # Database connection
│   │   └── initDB.js          # Database initialization
│   ├── index.js               # Server entry point
│   └── package.json
│
└── package.json               # Root package.json
```

## 🏗️ System Architecture

### Authentication Flow
1. User registers/logs in via AuthPage
2. Backend generates JWT token
3. Token stored in localStorage
4. All subsequent requests include token in headers
5. Backend validates token via authMiddleware

### Data Flow
- Frontend uses PlacementContext for global state management
- API calls made through custom axios instance (tokenHandler)
- Backend validates requests and returns standardized JSON responses
- Database queries use prepared statements for security

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

### Clone Repository
```bash
git clone <repository-url>
cd PlaceMe
```

### Setup Backend
```bash
cd backend
npm install
```

### Setup Frontend
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE placement_db;
   ```

2. **Configure Connection** in `backend/config/db.js`:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',
     password: 'your_password',
     database: 'placement_db',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   });
   ```

3. **Initialize Database**
   - The app automatically initializes tables on first connection
   - Tables created: `users`, `students`, `companies`, `jobs`, `applications`, `interviews`

### Environment Variables (Backend)

Create `.env` file in backend directory:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_db
JWT_SECRET=your_secret_key
```

### Frontend API Configuration

Update `frontend/src/api/tokenHandler.js` if backend URL differs:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});
```

## 🚀 Running the Project

### Start Backend Server
```bash
cd backend
npm start
```
Server runs on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## ✨ Features

### Student Features
- 🔐 **User Authentication**: Register, login, and logout securely
- 📋 **Browse Jobs**: View all available job postings with details
- 📝 **Apply to Jobs**: Submit applications to companies
- 📊 **Track Applications**: Monitor application status (pending, shortlisted, accepted, rejected)
- 📅 **View Interviews**: See scheduled interviews with company details, date/time, and meeting links
- 👤 **Update Profile**: Modify personal information (name, CGPA, skills, resume)
- ✅ **Placement Status**: View placement confirmation once shortlisted

### Admin Features
- 🏢 **Company Management**: Create and manage company profiles
- 💼 **Job Posting**: Post new job opportunities with eligibility criteria
- 👥 **Applicant Management**: View and filter applicants for each job
- 📋 **Status Updates**: Update application status (shortlisted, accepted, rejected)
- 📅 **Interview Scheduling**: Schedule interviews with specific rounds, dates, times, and meeting links
- 📊 **Dashboard**: View all interviews and track hiring progress
- 🎯 **Placement Tracking**: Mark students as placed after shortlisting

### Company Features
- 📝 **Post Jobs**: Create and manage job postings
- 👁️ **View Applicants**: See student applications
- 📞 **Interview Management**: Schedule and coordinate interviews

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout user

### Student Routes
- `GET /api/student/jobs` - Fetch all available jobs
- `POST /api/student/apply` - Apply to a job
- `GET /api/student/my` - Get student's applications
- `GET /api/student/get-profile` - Get student profile details
- `PUT /api/student/update` - Update student profile
- `GET /api/student/get-interviews` - Get scheduled interviews

### Admin Routes
- `GET /api/admin/get-company` - Fetch all companies
- `POST /api/admin/company` - Create new company
- `POST /api/admin/job` - Post new job
- `GET /api/admin/applicants/:jobId` - Get applicants for a job
- `PUT /api/admin/status` - Update application status
- `GET /api/admin/interviews` - Get all interviews
- `POST /api/admin/schedule-interview` - Schedule interview

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'company') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Students Table
```sql
CREATE TABLE students (
  user_id INT PRIMARY KEY,
  roll_no VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  branch VARCHAR(100),
  cgpa DECIMAL(3,2),
  skills TEXT,
  resume_url VARCHAR(255),
  placed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Companies Table
```sql
CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  role VARCHAR(255) NOT NULL,
  ctc DECIMAL(8,2),
  min_cgpa DECIMAL(3,2),
  eligible_branches TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('pending', 'shortlisted', 'accepted', 'rejected') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(user_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

### Interviews Table
```sql
CREATE TABLE interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  interview_round VARCHAR(255),
  interview_date DATETIME,
  interview_time TIME,
  interview_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);
```

## 👥 Usage Guide

### For Students

1. **Register & Login**
   - Visit the app and create an account
   - Login with your credentials

2. **Browse Jobs**
   - View all posted jobs in the Jobs tab
   - Check eligibility criteria (CGPA, branch)

3. **Apply to Jobs**
   - Click "Apply" button on job cards
   - Once applied, button changes to "Applied"

4. **Track Progress**
   - Go to "My Applications" tab to see status updates
   - Application status flow: pending → shortlisted → accepted/rejected

5. **View Interviews**
   - Go to "Interviews" tab after being shortlisted
   - See interview round, date/time, and meeting link
   - Click "Join Interview" to open the meeting

6. **Update Profile**
   - Click your name/profile icon in header
   - Edit your details and save

### For Admins

1. **Login to Admin Dashboard**
   - Use admin account credentials

2. **Manage Companies**
   - Create company profiles before posting jobs

3. **Post Jobs**
   - Go to "Create Job" section
   - Fill in role, CTC, CGPA requirement, eligible branches
   - Associate with a company

4. **Review Applicants**
   - Go to "Applicants" tab
   - View student details and applications
   - Update status to "shortlisted", "accepted", or "rejected"

5. **Schedule Interviews**
   - After updating status to "accepted"
   - Click "Schedule Interview" button
   - Fill in interview details (round, date, time, meeting link)

6. **View Interview Schedule**
   - Go to "Interviews" tab
   - See all scheduled interviews with student details

## 📝 Notes

- All passwords are securely hashed before storage
- JWT tokens expire after a set duration (configurable)
- Application status directly affects placement status
- Students marked as "placed" cannot apply to new jobs
- Interview scheduling is only available for accepted applicants
- Database automatically initializes on first run

## 🤝 Contributing

1. Create a new branch for features
2. Make changes and test thoroughly
3. Commit with clear messages
4. Push and create pull request

## 📄 License

This project is part of the DBMS course at IIIT Dharwad.

## 📞 Support

For issues or questions, please contact the development team or check the project documentation.

---

**Last Updated**: March 2026
**Version**: 1.0.0
