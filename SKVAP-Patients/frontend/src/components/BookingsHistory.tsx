import React, { useState, useEffect } from 'react';
import { Booking, bookingsAPI, reportsAPI } from '../services/api';

const BookingsHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set());
  const [cancellingBookings, setCancellingBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.bookings);
    } catch (err: any) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (bookingId: string) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(bookingId));
      const response = await reportsAPI.download(bookingId);
      
      if (response.success) {
        // In a real app, this would trigger a file download
        // For demo purposes, we'll show the report data
        alert(`Report generated successfully!\n\nReport ID: ${response.data.reportData.reportHeader.reportId}\nPatient: ${response.data.reportData.patientInfo.name}\nTest: ${response.data.reportData.testInfo.testName}\n\nIn a real application, this would download a PDF file.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download report');
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingBookings(prev => new Set(prev).add(bookingId));
      await bookingsAPI.cancel(bookingId, 'Cancelled by patient');
      
      // Refresh bookings
      await fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'no-show':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.timeSlot}`);
    const now = new Date();
    const timeDiff = bookingDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 24 && booking.status === 'scheduled';
  };

  const canDownloadReport = (booking: Booking) => {
    return booking.status === 'completed' || booking.testResults?.isReady;
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
        <h1 className="card-title">My Bookings</h1>
        <p className="card-subtitle">View your test bookings and download reports</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="card mb-6">
        <div className="form-group">
          <label className="form-label">Filter by Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Bookings</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="card text-center">
          <h3 style={{ color: '#64748b', marginBottom: '1rem' }}>No bookings found</h3>
          <p style={{ color: '#94a3b8' }}>
            {filter ? 'No bookings match the selected filter' : 'You haven\'t booked any tests yet'}
          </p>
          {!filter && (
            <a href="/tests" className="btn btn-primary mt-4">
              Browse Lab Tests
            </a>
          )}
        </div>
      ) : (
        <div className="grid">
          {bookings.map(booking => (
            <div key={booking._id} className="card">
              <div className="flex-between mb-4">
                <div>
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                    {booking.labTest.name}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Confirmation: {booking.confirmationNumber}
                  </div>
                </div>
                <span style={{
                  background: getStatusColor(booking.status) + '20',
                  color: getStatusColor(booking.status),
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {getStatusText(booking.status)}
                </span>
              </div>

              <div className="grid grid-2 mb-4">
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                    <strong>Date:</strong> {formatDate(booking.bookingDate)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                    <strong>Time:</strong> {formatTime(booking.timeSlot)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <strong>Category:</strong> {booking.labTest.category}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                    <strong>Amount:</strong> ${booking.paymentAmount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                    <strong>Payment:</strong> {booking.paymentStatus}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <strong>Duration:</strong> {booking.labTest.duration}
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="alert alert-info mb-4">
                  <strong>Notes:</strong> {booking.notes}
                </div>
              )}

              <div className="flex gap-4">
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="btn btn-danger"
                    disabled={cancellingBookings.has(booking._id)}
                  >
                    {cancellingBookings.has(booking._id) ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Booking'
                    )}
                  </button>
                )}

                {canDownloadReport(booking) && (
                  <button
                    onClick={() => handleDownloadReport(booking._id)}
                    className="btn btn-success"
                    disabled={downloadingReports.has(booking._id)}
                  >
                    {downloadingReports.has(booking._id) ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                        Generating...
                      </>
                    ) : (
                      'Download Report'
                    )}
                  </button>
                )}

                {booking.status === 'scheduled' && !canCancelBooking(booking) && (
                  <div style={{ fontSize: '0.875rem', color: '#f59e0b', fontStyle: 'italic' }}>
                    Cannot cancel (less than 24 hours)
                  </div>
                )}

                {booking.status === 'completed' && !booking.testResults?.isReady && (
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                    Report not ready yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsHistory;
