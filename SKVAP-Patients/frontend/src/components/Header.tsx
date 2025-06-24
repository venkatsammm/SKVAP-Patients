import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, patient, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            🏥 Digital Health Clinic
          </Link>

          <nav>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/tests" 
                  style={{ 
                    fontWeight: isActivePath('/tests') ? 'bold' : 'normal',
                    textDecoration: isActivePath('/tests') ? 'underline' : 'none'
                  }}
                >
                  Lab Tests
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link 
                    to="/bookings"
                    style={{ 
                      fontWeight: isActivePath('/bookings') ? 'bold' : 'normal',
                      textDecoration: isActivePath('/bookings') ? 'underline' : 'none'
                    }}
                  >
                    My Bookings
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="user-info">
            {isAuthenticated ? (
              <>
                <span style={{ fontSize: '0.875rem' }}>
                  Welcome, {patient?.firstName} {patient?.lastName}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link 
                  to="/login" 
                  className="btn btn-secondary"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary"
                  style={{ 
                    background: 'white',
                    color: '#667eea',
                    textDecoration: 'none'
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
