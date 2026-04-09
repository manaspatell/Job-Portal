// Print all Applicant cvPath values in your MongoDB
// Usage: node printCvPaths.js

const mongoose = require('mongoose');
const Applicant = require('./models/Applicant');

const MONGO_URI = 'mongodb://localhost:27017/candidate_dashboard'; // <-- Change to your DB name

async function printCvPaths() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const applicants = await Applicant.find({}, 'cvPath');
  applicants.forEach(applicant => {
    console.log(`${applicant._id}: ${applicant.cvPath}`);
  });
  mongoose.disconnect();
}

printCvPaths();
