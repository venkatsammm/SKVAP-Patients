const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const LabTest = require('../models/LabTest');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, [
  body('labTest')
    .isMongoId()
    .withMessage('Valid lab test ID is required'),
  body('bookingDate')
    .isISO8601()
    .withMessage('Valid booking date is required'),
  body('timeSlot')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time slot must be in HH:MM format'),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'cash', 'insurance'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { labTest, bookingDate, timeSlot, paymentMethod, notes } = req.body;

    // Check if lab test exists and is active
    const test = await LabTest.findById(labTest);
    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found or not available'
      });
    }

    // Check if booking date is in the future
    const selectedDate = new Date(bookingDate);
    const now = new Date();
    if (selectedDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Check for existing booking at the same time slot
    const existingBooking = await Booking.findOne({
      bookingDate: selectedDate,
      timeSlot,
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Create booking
    const booking = await Booking.create({
      patient: req.patient.id,
      labTest,
      bookingDate: selectedDate,
      timeSlot,
      paymentAmount: test.price,
      paymentMethod: paymentMethod || 'credit_card',
      notes
    });

    // Populate the booking with test and patient details
    await booking.populate([
      { path: 'labTest', select: 'name code category price duration' },
      { path: 'patient', select: 'firstName lastName email phone' }
    ]);

    res.status(201).json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get patient's bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, [
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { patient: req.patient.id };
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .populate('labTest', 'name code category price duration')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: {
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      patient: req.patient.id
    }).populate([
      { path: 'labTest', select: 'name code category price duration preparationInstructions' },
      { path: 'patient', select: 'firstName lastName email phone' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      patient: req.patient.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled. Must be cancelled at least 24 hours before the appointment.'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by patient';
    booking.cancelledAt = new Date();
    booking.paymentStatus = 'refunded';

    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
