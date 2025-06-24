import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Patient } from '../services/api';

interface RegistrationFormData extends Partial<Patient> {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const PatientRegistration: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Basic validation
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address?.street?.trim()) newErrors.street = 'Street address is required';
    if (!formData.address?.city?.trim()) newErrors.city = 'City is required';
    if (!formData.address?.state?.trim()) newErrors.state = 'State is required';
    if (!formData.address?.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';

    // Emergency contact validation
    if (!formData.emergencyContact?.name?.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContact?.phone?.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    if (!formData.emergencyContact?.relationship?.trim()) newErrors.emergencyContactRelationship = 'Emergency contact relationship is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith('emergencyContact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact!,
          [contactField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
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
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="card-header">
          <h1 className="card-title">Patient Registration</h1>
          <p className="card-subtitle">Create your account to access our lab services</p>
        </div>

        {submitError && (
          <div className="alert alert-error">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your first name"
              />
              {errors.firstName && <div className="form-error">{errors.firstName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your last name"
              />
              {errors.lastName && <div className="form-error">{errors.lastName}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email address"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleInputChange}
                className="form-input"
              />
              {errors.dateOfBirth && <div className="form-error">{errors.dateOfBirth}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                value={formData.gender || 'male'}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
          </div>

          {/* Address Information */}
          <h3 style={{ marginBottom: '1rem', marginTop: '2rem', color: '#374151' }}>Address Information</h3>
          
          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              name="address.street"
              value={formData.address?.street || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your street address"
            />
            {errors.street && <div className="form-error">{errors.street}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="address.city"
                value={formData.address?.city || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your city"
              />
              {errors.city && <div className="form-error">{errors.city}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                name="address.state"
                value={formData.address?.state || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your state"
              />
              {errors.state && <div className="form-error">{errors.state}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Zip Code *</label>
            <input
              type="text"
              name="address.zipCode"
              value={formData.address?.zipCode || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your zip code"
              style={{ maxWidth: '200px' }}
            />
            {errors.zipCode && <div className="form-error">{errors.zipCode}</div>}
          </div>

          {/* Emergency Contact */}
          <h3 style={{ marginBottom: '1rem', marginTop: '2rem', color: '#374151' }}>Emergency Contact</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact?.name || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContactName && <div className="form-error">{errors.emergencyContactName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact?.phone || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter emergency contact phone"
              />
              {errors.emergencyContactPhone && <div className="form-error">{errors.emergencyContactPhone}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Relationship *</label>
            <input
              type="text"
              name="emergencyContact.relationship"
              value={formData.emergencyContact?.relationship || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Spouse, Parent, Sibling"
              style={{ maxWidth: '300px' }}
            />
            {errors.emergencyContactRelationship && <div className="form-error">{errors.emergencyContactRelationship}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
