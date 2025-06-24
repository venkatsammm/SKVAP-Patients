import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <div className="card-header text-center">
          <h1 className="card-title">Welcome Back</h1>
          <p className="card-subtitle">Sign in to your patient portal</p>
        </div>

        {submitError && (
          <div className="alert alert-error">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p style={{ color: '#64748b' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: '500' 
              }}
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="alert alert-info mt-4">
          <strong>Demo Credentials:</strong><br />
          Email: demo@patient.com<br />
          Password: demo123
        </div>
      </div>
    </div>
  );
};

export default Login;
