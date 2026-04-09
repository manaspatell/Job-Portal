require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// School Schema
const schoolSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

const School = mongoose.model('School', schoolSchema);

async function createTestSchool() {
  try {
    // Delete existing test school
    await School.deleteOne({ email: 'school1@example.com' });

    // Create a new test school
    const school = new School({
      name: 'Test School 1',
      email: 'school1@example.com',
      password: 'school123',
      location: 'Mumbai' // Make sure this location has applicants in your database
    });

    await school.save();
    console.log('✅ Test school created successfully!');
    console.log('Email:', school.email);
    console.log('Password:', school.password);
    console.log('Location:', school.location);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test school:', error.message);
    process.exit(1);
  }
}

createTestSchool();
