const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get patient from token
      req.patient = await Patient.findById(decoded.id).select('-password');

      if (!req.patient) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, patient not found'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Send token response
const sendTokenResponse = (patient, statusCode, res) => {
  // Create token
  const token = generateToken(patient._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        patient: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone
        }
      }
    });
};

module.exports = {
  protect,
  generateToken,
  sendTokenResponse
};
