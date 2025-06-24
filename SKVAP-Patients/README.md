# Patient Portal - Digital Health Clinic

A comprehensive patient-facing portal for a digital health clinic built with React frontend, Node.js/Express backend, and MongoDB.

## Features

- **Patient Registration**: Secure patient registration with JWT authentication
- **Lab Tests Catalog**: Browse available lab tests and book appointments
- **Booking History**: View booking history and download test reports
- **Clean UI**: Modern, responsive design with validation and error handling

## Tech Stack

### Frontend
- React.js with modern hooks
- React Router for navigation
- Axios for API calls
- CSS modules for styling
- Form validation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- bcrypt for password hashing
- multer for file handling

## Project Structure

```
patient-portal/
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js/Express API
│   ├── src/
│   ├── models/
│   ├── routes/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up environment variables (see .env.example files)

5. Start the development servers:
   ```bash
   # Backend (runs on port 5000)
   cd backend
   npm run dev

   # Frontend (runs on port 3000)
   cd frontend
   npm start
   ```

## API Endpoints

- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - Patient login
- `GET /api/tests` - Get available lab tests
- `POST /api/bookings` - Book a lab test
- `GET /api/bookings` - Get patient's booking history
- `GET /api/reports/:bookingId` - Download test report

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/patient-portal
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```
