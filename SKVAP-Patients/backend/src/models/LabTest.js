const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    unique: true,
    minlength: [3, 'Test name must be at least 3 characters long'],
    maxlength: [100, 'Test name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Test code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Test code must be 3-10 alphanumeric characters']
  },
  description: {
    type: String,
    required: [true, 'Test description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Test category is required'],
    enum: [
      'Blood Test',
      'Urine Test',
      'Imaging',
      'Cardiac',
      'Liver Function',
      'Kidney Function',
      'Thyroid',
      'Diabetes',
      'Lipid Profile',
      'Complete Blood Count',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Test price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed $10,000']
  },
  duration: {
    type: String,
    required: [true, 'Test duration is required'],
    trim: true,
    match: [/^\d+\s(minutes?|hours?|days?)$/, 'Duration must be in format "X minutes/hours/days"']
  },
  preparationInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Preparation instructions cannot exceed 1000 characters']
  },
  sampleType: {
    type: String,
    required: [true, 'Sample type is required'],
    enum: ['Blood', 'Urine', 'Saliva', 'Stool', 'Tissue', 'Other']
  },
  fastingRequired: {
    type: Boolean,
    default: false
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    times: [{
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  normalRange: {
    min: Number,
    max: Number,
    unit: String
  }
}, {
  timestamps: true
});

// Index for efficient searching
labTestSchema.index({ name: 'text', description: 'text' });
labTestSchema.index({ category: 1 });
labTestSchema.index({ isActive: 1 });

module.exports = mongoose.model('LabTest', labTestSchema);
