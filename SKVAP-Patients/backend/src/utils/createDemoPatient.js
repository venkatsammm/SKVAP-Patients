const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('../models/Patient');

// Load environment variables
dotenv.config();

const createDemoPatient = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if demo patient already exists
    const existingPatient = await Patient.findOne({ email: 'demo@patient.com' });
    if (existingPatient) {
      console.log('Demo patient already exists');
      process.exit(0);
    }

    // Create demo patient
    const demoPatient = await Patient.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'demo@patient.com',
      password: 'demo123',
      phone: '+1234567890',
      dateOfBirth: '1990-01-15',
      gender: 'male',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relationship: 'Spouse'
      }
    });

    console.log('Demo patient created successfully:');
    console.log('Email: demo@patient.com');
    console.log('Password: demo123');
    console.log('Patient ID:', demoPatient._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo patient:', error);
    process.exit(1);
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  createDemoPatient();
}

module.exports = { createDemoPatient };
