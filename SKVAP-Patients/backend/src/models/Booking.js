const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  labTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: [true, 'Lab test is required']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Booking date must be in the future'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'cash', 'insurance'],
    default: 'credit_card'
  },
  confirmationNumber: {
    type: String,
    unique: true,
    required: true
  },
  testResults: {
    isReady: {
      type: Boolean,
      default: false
    },
    reportUrl: {
      type: String,
      trim: true
    },
    resultDate: {
      type: Date
    },
    values: [{
      parameter: String,
      value: String,
      unit: String,
      normalRange: String,
      status: {
        type: String,
        enum: ['normal', 'high', 'low', 'critical']
      }
    }],
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Doctor notes cannot exceed 1000 characters']
    }
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate confirmation number before saving
bookingSchema.pre('save', function(next) {
  if (!this.confirmationNumber) {
    this.confirmationNumber = 'BK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Index for efficient querying
bookingSchema.index({ patient: 1, bookingDate: -1 });
bookingSchema.index({ labTest: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ confirmationNumber: 1 });
bookingSchema.index({ bookingDate: 1, timeSlot: 1 });

// Virtual for booking day
bookingSchema.virtual('bookingDay').get(function() {
  return this.bookingDate.toDateString();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const timeDiff = bookingDateTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 3600);
  
  return hoursDiff > 24 && this.status === 'scheduled';
};

module.exports = mongoose.model('Booking', bookingSchema);
