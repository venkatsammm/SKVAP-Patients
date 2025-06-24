const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LabTest = require('../models/LabTest');

// Load environment variables
dotenv.config();

const labTests = [
  {
    name: 'Complete Blood Count (CBC)',
    code: 'CBC001',
    description: 'A complete blood count test measures several components of your blood including red blood cells, white blood cells, hemoglobin, hematocrit, and platelets.',
    category: 'Complete Blood Count',
    price: 45.00,
    duration: '30 minutes',
    preparationInstructions: 'No special preparation required. You may eat and drink normally before this test.',
    sampleType: 'Blood',
    fastingRequired: false,
    availableSlots: [
      { day: 'Monday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Tuesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Wednesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Thursday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Friday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
    ],
    normalRange: { min: 4.0, max: 11.0, unit: 'K/uL' }
  },
  {
    name: 'Lipid Profile',
    code: 'LIP001',
    description: 'A lipid panel measures cholesterol and triglycerides in your blood to assess cardiovascular risk.',
    category: 'Lipid Profile',
    price: 65.00,
    duration: '15 minutes',
    preparationInstructions: 'Fast for 9-12 hours before the test. You may drink water but avoid food, drinks with calories, and alcohol.',
    sampleType: 'Blood',
    fastingRequired: true,
    availableSlots: [
      { day: 'Monday', times: ['07:00', '07:30', '08:00', '08:30'] },
      { day: 'Tuesday', times: ['07:00', '07:30', '08:00', '08:30'] },
      { day: 'Wednesday', times: ['07:00', '07:30', '08:00', '08:30'] },
      { day: 'Thursday', times: ['07:00', '07:30', '08:00', '08:30'] },
      { day: 'Friday', times: ['07:00', '07:30', '08:00', '08:30'] }
    ],
    normalRange: { min: 0, max: 200, unit: 'mg/dL' }
  },
  {
    name: 'Thyroid Function Test (TSH)',
    code: 'THY001',
    description: 'Thyroid-stimulating hormone test measures the amount of TSH in your blood to check thyroid function.',
    category: 'Thyroid',
    price: 55.00,
    duration: '20 minutes',
    preparationInstructions: 'No special preparation required. Inform your doctor about any medications you are taking.',
    sampleType: 'Blood',
    fastingRequired: false,
    availableSlots: [
      { day: 'Monday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Tuesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Thursday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] }
    ],
    normalRange: { min: 0.4, max: 4.0, unit: 'mIU/L' }
  },
  {
    name: 'Liver Function Test',
    code: 'LFT001',
    description: 'A group of blood tests that check how well your liver is working by measuring enzymes, proteins, and substances.',
    category: 'Liver Function',
    price: 75.00,
    duration: '25 minutes',
    preparationInstructions: 'Fast for 8-12 hours before the test. Avoid alcohol for 24 hours before the test.',
    sampleType: 'Blood',
    fastingRequired: true,
    availableSlots: [
      { day: 'Monday', times: ['07:00', '07:30', '08:00', '08:30', '09:00'] },
      { day: 'Tuesday', times: ['07:00', '07:30', '08:00', '08:30', '09:00'] },
      { day: 'Wednesday', times: ['07:00', '07:30', '08:00', '08:30', '09:00'] },
      { day: 'Thursday', times: ['07:00', '07:30', '08:00', '08:30', '09:00'] },
      { day: 'Friday', times: ['07:00', '07:30', '08:00', '08:30', '09:00'] }
    ],
    normalRange: { min: 7, max: 56, unit: 'U/L' }
  },
  {
    name: 'Kidney Function Test',
    code: 'KFT001',
    description: 'Blood and urine tests that check how well your kidneys are filtering waste from your blood.',
    category: 'Kidney Function',
    price: 70.00,
    duration: '30 minutes',
    preparationInstructions: 'No special preparation required. Drink plenty of water before the test.',
    sampleType: 'Blood',
    fastingRequired: false,
    availableSlots: [
      { day: 'Monday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Tuesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Thursday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] }
    ],
    normalRange: { min: 0.6, max: 1.2, unit: 'mg/dL' }
  },
  {
    name: 'Diabetes Screening (HbA1c)',
    code: 'DIA001',
    description: 'Hemoglobin A1c test measures your average blood sugar level over the past 2-3 months.',
    category: 'Diabetes',
    price: 60.00,
    duration: '15 minutes',
    preparationInstructions: 'No fasting required. You can eat and drink normally before this test.',
    sampleType: 'Blood',
    fastingRequired: false,
    availableSlots: [
      { day: 'Monday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Tuesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Wednesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Thursday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Friday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
    ],
    normalRange: { min: 4.0, max: 5.6, unit: '%' }
  },
  {
    name: 'Urine Analysis',
    code: 'URI001',
    description: 'A urine test that checks for various substances and cells to detect urinary tract infections and other conditions.',
    category: 'Urine Test',
    price: 35.00,
    duration: '20 minutes',
    preparationInstructions: 'Collect a clean-catch midstream urine sample. Avoid contamination from hands or genital area.',
    sampleType: 'Urine',
    fastingRequired: false,
    availableSlots: [
      { day: 'Monday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Tuesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Wednesday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Thursday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Friday', times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
    ]
  },
  {
    name: 'Cardiac Risk Assessment',
    code: 'CAR001',
    description: 'Comprehensive cardiac panel including troponin, CK-MB, and other cardiac markers to assess heart health.',
    category: 'Cardiac',
    price: 120.00,
    duration: '45 minutes',
    preparationInstructions: 'Fast for 12 hours before the test. Avoid strenuous exercise 24 hours before the test.',
    sampleType: 'Blood',
    fastingRequired: true,
    availableSlots: [
      { day: 'Monday', times: ['07:00', '08:00', '09:00'] },
      { day: 'Tuesday', times: ['07:00', '08:00', '09:00'] },
      { day: 'Wednesday', times: ['07:00', '08:00', '09:00'] },
      { day: 'Thursday', times: ['07:00', '08:00', '09:00'] },
      { day: 'Friday', times: ['07:00', '08:00', '09:00'] }
    ],
    normalRange: { min: 0, max: 0.04, unit: 'ng/mL' }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing lab tests
    await LabTest.deleteMany({});
    console.log('Cleared existing lab tests');

    // Insert new lab tests
    await LabTest.insertMany(labTests);
    console.log('Lab tests seeded successfully');

    console.log(`${labTests.length} lab tests have been added to the database`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, labTests };
