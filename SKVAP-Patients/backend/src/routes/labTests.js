const express = require('express');
const { body, query, validationResult } = require('express-validator');
const LabTest = require('../models/LabTest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all lab tests
// @route   GET /api/tests
// @access  Public
router.get('/', [
  query('category')
    .optional()
    .isIn(['Blood Test', 'Urine Test', 'Imaging', 'Cardiac', 'Liver Function', 'Kidney Function', 'Thyroid', 'Diabetes', 'Lipid Profile', 'Complete Blood Count', 'Other'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
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

    const {
      category,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const labTests = await LabTest.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LabTest.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      count: labTests.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: {
        labTests
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single lab test
// @route   GET /api/tests/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    if (!labTest.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Lab test is not available'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        labTest
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get lab test categories
// @route   GET /api/tests/categories/list
// @access  Public
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await LabTest.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: {
        categories: categories.sort()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create lab test (Admin only - for seeding data)
// @route   POST /api/tests
// @access  Private
router.post('/', protect, [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Test name must be between 3 and 100 characters'),
  body('code')
    .trim()
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Test code must be 3-10 alphanumeric characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['Blood Test', 'Urine Test', 'Imaging', 'Cardiac', 'Liver Function', 'Kidney Function', 'Thyroid', 'Diabetes', 'Lipid Profile', 'Complete Blood Count', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be between 0 and 10000'),
  body('duration')
    .matches(/^\d+\s(minutes?|hours?|days?)$/)
    .withMessage('Duration must be in format "X minutes/hours/days"'),
  body('sampleType')
    .isIn(['Blood', 'Urine', 'Saliva', 'Stool', 'Tissue', 'Other'])
    .withMessage('Invalid sample type')
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

    const labTest = await LabTest.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        labTest
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
