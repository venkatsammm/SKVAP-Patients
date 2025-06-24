import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import PatientRegistration from './components/PatientRegistration';
import LabTestsCatalog from './components/LabTestsCatalog';
import BookingsHistory from './components/BookingsHistory';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<PatientRegistration />} />
              <Route path="/tests" element={<LabTestsCatalog />} />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/tests" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
