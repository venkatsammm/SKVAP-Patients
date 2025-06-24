const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Download test report
// @route   GET /api/reports/:bookingId
// @access  Private
router.get('/:bookingId', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      patient: req.patient.id
    }).populate([
      { path: 'labTest', select: 'name code category normalRange' },
      { path: 'patient', select: 'firstName lastName email phone dateOfBirth' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // For demo purposes, we'll generate a dummy PDF report
    // In a real application, you would generate an actual PDF
    const reportData = generateDummyReport(booking);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${booking.confirmationNumber}.pdf"`);
    
    // For demo, we'll return JSON data instead of actual PDF
    // In production, you would use a PDF library like puppeteer or jsPDF
    res.status(200).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        reportData,
        downloadUrl: `/api/reports/${booking._id}/download`,
        booking: {
          confirmationNumber: booking.confirmationNumber,
          testName: booking.labTest.name,
          testCode: booking.labTest.code,
          bookingDate: booking.bookingDate,
          status: booking.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get report status
// @route   GET /api/reports/:bookingId/status
// @access  Private
router.get('/:bookingId/status', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      patient: req.patient.id
    }).select('testResults confirmationNumber status');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        confirmationNumber: booking.confirmationNumber,
        status: booking.status,
        reportReady: booking.testResults.isReady,
        resultDate: booking.testResults.resultDate
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate dummy report data
function generateDummyReport(booking) {
  const reportDate = new Date();
  const testDate = booking.bookingDate;
  
  // Generate dummy test results based on test type
  const dummyResults = generateDummyTestResults(booking.labTest);

  return {
    reportHeader: {
      clinicName: 'Digital Health Clinic',
      clinicAddress: '123 Health Street, Medical City, MC 12345',
      clinicPhone: '+1 (555) 123-4567',
      reportDate: reportDate.toISOString(),
      reportId: `RPT-${booking.confirmationNumber}`
    },
    patientInfo: {
      name: `${booking.patient.firstName} ${booking.patient.lastName}`,
      email: booking.patient.email,
      phone: booking.patient.phone,
      dateOfBirth: booking.patient.dateOfBirth,
      patientId: booking.patient._id
    },
    testInfo: {
      testName: booking.labTest.name,
      testCode: booking.labTest.code,
      category: booking.labTest.category,
      testDate: testDate,
      confirmationNumber: booking.confirmationNumber
    },
    results: dummyResults,
    summary: {
      overallStatus: 'Normal',
      doctorNotes: 'All test parameters are within normal range. Continue with regular health maintenance.',
      nextSteps: 'Follow up with your primary care physician if you have any concerns.'
    },
    footer: {
      disclaimer: 'This is a computer-generated report. For medical interpretation, please consult with your healthcare provider.',
      labCertification: 'This laboratory is certified by the College of American Pathologists (CAP)',
      generatedAt: reportDate.toISOString()
    }
  };
}

// Helper function to generate dummy test results
function generateDummyTestResults(labTest) {
  const results = [];
  
  // Generate different dummy results based on test category
  switch (labTest.category) {
    case 'Complete Blood Count':
      results.push(
        { parameter: 'White Blood Cells', value: '7.2', unit: 'K/uL', normalRange: '4.0-11.0', status: 'normal' },
        { parameter: 'Red Blood Cells', value: '4.5', unit: 'M/uL', normalRange: '4.2-5.4', status: 'normal' },
        { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '12.0-16.0', status: 'normal' },
        { parameter: 'Hematocrit', value: '42.1', unit: '%', normalRange: '36.0-46.0', status: 'normal' },
        { parameter: 'Platelets', value: '285', unit: 'K/uL', normalRange: '150-450', status: 'normal' }
      );
      break;
    case 'Lipid Profile':
      results.push(
        { parameter: 'Total Cholesterol', value: '185', unit: 'mg/dL', normalRange: '<200', status: 'normal' },
        { parameter: 'LDL Cholesterol', value: '110', unit: 'mg/dL', normalRange: '<130', status: 'normal' },
        { parameter: 'HDL Cholesterol', value: '55', unit: 'mg/dL', normalRange: '>40', status: 'normal' },
        { parameter: 'Triglycerides', value: '95', unit: 'mg/dL', normalRange: '<150', status: 'normal' }
      );
      break;
    case 'Liver Function':
      results.push(
        { parameter: 'ALT', value: '28', unit: 'U/L', normalRange: '7-56', status: 'normal' },
        { parameter: 'AST', value: '32', unit: 'U/L', normalRange: '10-40', status: 'normal' },
        { parameter: 'Bilirubin Total', value: '0.8', unit: 'mg/dL', normalRange: '0.3-1.2', status: 'normal' },
        { parameter: 'Alkaline Phosphatase', value: '75', unit: 'U/L', normalRange: '44-147', status: 'normal' }
      );
      break;
    default:
      results.push(
        { parameter: 'Test Result', value: 'Normal', unit: '', normalRange: 'Normal', status: 'normal' }
      );
  }
  
  return results;
}

module.exports = router;
