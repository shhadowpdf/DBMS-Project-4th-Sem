# Placement Management System

A comprehensive full-stack web application for managing student placements in educational institutions. This system allows administrators to post job opportunities and manage applications, while students can apply for jobs, track their applications, and view interview schedules.

## Features

### For Students
- User registration and authentication
- Profile management (CGPA, branch, skills, resume upload)
- Browse available job opportunities
- Apply and unapply for jobs
- Track application status (Applied, Shortlisted, Interview, Selected, Rejected)
- View scheduled interviews

### For Administrators
- User registration and authentication
- Create and manage companies
- Post job opportunities with eligibility criteria
- View applicants for each job
- Update application statuses
- Schedule interviews for selected candidates
- Manage interview schedules

### General Features
- Secure JWT-based authentication
- Role-based access control (Admin/Student)
- Responsive UI built with React and Shadcn UI
- RESTful API backend
- MySQL database with automatic schema initialization

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **cors** for cross-origin requests

### Frontend
- **React** with Vite
- **Shadcn UI** components
- **TanStack Query** for data fetching
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling

### Development Tools
- **Vitest** for unit testing
- **Playwright** for end-to-end testing
- **ESLint** for code linting
- **Nodemon** for backend development

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server
- npm or yarn package manager

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd placement-management-system
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values according to your MySQL configuration:
     ```
     PORT=8000
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=placement_db
     JWT_SECRET=your_jwt_secret_key
     ```

4. **Start MySQL server** and ensure it's running on the specified host and port.

5. **Initialize the database:**
   The application will automatically create the database and tables when the backend starts. No manual database setup is required.

## Usage

### Development Mode
Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:8000`
- Frontend development server on `http://localhost:5173` (default Vite port)

### Production Build
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend:
   ```bash
   npm run backend
   ```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

#### Student Routes (Require Authentication)
- `GET /api/student/jobs` - Get all available jobs
- `POST /api/student/apply` - Apply for a job
- `DELETE /api/student/unapply/:jobId` - Unapply from a job
- `GET /api/student/my` - Get user's applications
- `PUT /api/student/update` - Update student profile
- `GET /api/student/get-profile` - Get student profile
- `GET /api/student/get-interviews` - Get scheduled interviews

#### Admin Routes (Require Admin Authentication)
- `POST /api/admin/job` - Create a new job
- `DELETE /api/admin/job/:jobId` - Delete a job
- `GET /api/admin/applicants/:jobId` - Get applicants for a job
- `PUT /api/admin/status` - Update application status
- `POST /api/admin/company` - Create a company
- `DELETE /api/admin/company/:companyId` - Delete a company
- `POST /api/admin/schedule-interview` - Schedule an interview
- `GET /api/admin/interviews` - Get all interviews
- `GET /api/admin/get-company` - Get all companies

## Database Schema

The application uses the following MySQL tables:
- `users` - User accounts (admin/student)
- `students` - Student profiles
- `companies` - Company information
- `jobs` - Job postings
- `applications` - Job applications
- `interviews` - Interview schedules

The database schema is automatically created when the backend starts.

## Project Structure

```
placement-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js          # Database connection
│   │   └── initDB.js      # Database initialization
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── studentRoutes.js
│   ├── index.js           # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── tokenHandler.js
│   │   ├── components/
│   │   │   ├── ui/         # Shadcn UI components
│   │   │   ├── NavLink.jsx
│   │   │   └── UpdateProfileDialog.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── PlacementContext.jsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── package.json
└── README.md
```

