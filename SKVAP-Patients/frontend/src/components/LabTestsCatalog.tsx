import React, { useState, useEffect } from 'react';
import { LabTest, labTestsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  test: LabTest;
  isOpen: boolean;
  onClose: () => void;
  onBook: (bookingData: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ test, isOpen, onClose, onBook }) => {
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    timeSlot: '',
    paymentMethod: 'credit_card',
    notes: '',
  });
  const [selectedDay, setSelectedDay] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDay && test.availableSlots) {
      const daySlot = test.availableSlots.find(slot => slot.day === selectedDay);
      setAvailableTimes(daySlot?.times || []);
      setBookingData(prev => ({ ...prev, timeSlot: '' }));
    }
  }, [selectedDay, test.availableSlots]);

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    // Set booking date to next occurrence of selected day
    const today = new Date();
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
    const daysUntilNext = (dayIndex - today.getDay() + 7) % 7 || 7;
    const nextDate = new Date(today.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
    setBookingData(prev => ({
      ...prev,
      bookingDate: nextDate.toISOString().split('T')[0],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(bookingData);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header">
          <h2 className="card-title">Book {test.name}</h2>
          <p className="card-subtitle">Price: ${test.price.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Day</label>
            <select
              value={selectedDay}
              onChange={(e) => handleDayChange(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a day</option>
              {test.availableSlots?.map(slot => (
                <option key={slot.day} value={slot.day}>
                  {slot.day}
                </option>
              ))}
            </select>
          </div>

          {selectedDay && (
            <div className="form-group">
              <label className="form-label">Select Time</label>
              <select
                value={bookingData.timeSlot}
                onChange={(e) => setBookingData(prev => ({ ...prev, timeSlot: e.target.value }))}
                className="form-select"
                required
              >
                <option value="">Choose a time</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              value={bookingData.paymentMethod}
              onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="form-select"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="insurance">Insurance</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
              className="form-textarea"
              placeholder="Any special instructions or notes"
              rows={3}
            />
          </div>

          {test.preparationInstructions && (
            <div className="alert alert-info">
              <strong>Preparation Instructions:</strong><br />
              {test.preparationInstructions}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={!bookingData.bookingDate || !bookingData.timeSlot}
            >
              Book Test - ${test.price.toFixed(2)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LabTestsCatalog: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  });
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string>('');

  useEffect(() => {
    fetchTests();
    fetchCategories();
  }, [filters]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: parseFloat(filters.maxPrice) }),
      };
      
      const response = await labTestsAPI.getAll(params);
      setTests(response.data.labTests);
    } catch (err: any) {
      setError('Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await labTestsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookTest = async (bookingData: any) => {
    if (!selectedTest || !isAuthenticated) return;

    try {
      setBookingLoading(true);
      const response = await bookingsAPI.create({
        labTest: selectedTest._id,
        ...bookingData,
      });
      
      setBookingSuccess(`Test booked successfully! Confirmation: ${response.data.booking.confirmationNumber}`);
      setSelectedTest(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book test');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card-header mb-6">
        <h1 className="card-title">Available Lab Tests</h1>
        <p className="card-subtitle">Browse and book from our comprehensive catalog of lab tests</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {bookingSuccess && (
        <div className="alert alert-success">
          {bookingSuccess}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <h3 style={{ marginBottom: '1rem' }}>Filter Tests</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="form-input"
              placeholder="Search tests..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Min Price ($)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="form-input"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Max Price ($)</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="form-input"
              placeholder="1000"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid grid-2">
        {tests.map(test => (
          <div key={test._id} className="card">
            <div className="flex-between mb-4">
              <div>
                <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>{test.name}</h3>
                <span style={{
                  background: '#e0e7ff',
                  color: '#3730a3',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {test.category}
                </span>
              </div>
              <div className="text-right">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                  ${test.price.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {test.duration}
                </div>
              </div>
            </div>

            <p style={{ color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>
              {test.description}
            </p>

            <div className="mb-4">
              <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                <strong>Sample Type:</strong> {test.sampleType}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                <strong>Fasting Required:</strong> {test.fastingRequired ? 'Yes' : 'No'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                <strong>Test Code:</strong> {test.code}
              </div>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => setSelectedTest(test)}
                className="btn btn-primary btn-full"
              >
                Book This Test
              </button>
            ) : (
              <div className="alert alert-warning">
                Please <a href="/login" style={{ color: '#92400e', fontWeight: 'bold' }}>login</a> to book tests
              </div>
            )}
          </div>
        ))}
      </div>

      {tests.length === 0 && !loading && (
        <div className="text-center" style={{ padding: '3rem' }}>
          <h3 style={{ color: '#64748b' }}>No tests found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your filters</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTest && (
        <BookingModal
          test={selectedTest}
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          onBook={handleBookTest}
        />
      )}
    </div>
  );
};

export default LabTestsCatalog;
