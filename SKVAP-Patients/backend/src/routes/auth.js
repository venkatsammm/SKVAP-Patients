const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const { sendTokenResponse, protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Register patient
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
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

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this email already exists'
      });
    }

    // Create patient
    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    });

    sendTokenResponse(patient, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Login patient
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check for patient
    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(patient, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in patient
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.patient.id);
    
    res.status(200).json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update patient profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
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

    const fieldsToUpdate = {};
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'emergencyContact'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const patient = await Patient.findByIdAndUpdate(
      req.patient.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
