// Run this script once to fix all Applicant cvPath fields in your MongoDB
// Usage: node fixCvPaths.js

const mongoose = require('mongoose');
const Applicant = require('./models/Applicant');

const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME'; // <-- Change to your DB name

async function fixCvPaths() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const applicants = await Applicant.find({ cvPath: { $regex: /^uploads\/cvs\/uploads\/cvs\// } });
  for (const applicant of applicants) {
    applicant.cvPath = applicant.cvPath.replace('uploads/cvs/uploads/cvs/', 'uploads/cvs/');
    await applicant.save();
    console.log(`Fixed: ${applicant._id}`);
  }
  console.log('Done!');
  mongoose.disconnect();
}

fixCvPaths();
