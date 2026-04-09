require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Applicant Schema
const applicantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  gender: String,
  state: String,
  city: String,
  highestQualification: String,
  collegeName: String,
  collegeTier: String,
  skills: String,
  preferredLocation: String,
  expectedSalary: Number,
  cvPath: String,
  status: { type: String, enum: ['pending', 'shortlisted', 'approved', 'rejected'], default: 'pending' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  tags: [String],
  notes: String,
  emailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Applicant = mongoose.model('Applicant', applicantSchema);

// Sample data
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy',
  'Christopher', 'Daniel', 'Matthew', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth',
  'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Sophia', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Peterson', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Reeves', 'Morris', 'Murphy', 'Rogers', 'Morgan', 'Peterson'
];

const locations = [
  // Indian Cities
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad',
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Chandigarh', 'Guwahati', 'Mysore', 'Coimbatore', 'Kota',
  // US Cities
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco',
  'Seattle', 'Boston', 'Austin', 'Denver',
  // Work Styles
  'Remote', 'Hybrid'
];

const indianStates = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
  'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Bihar', 'Andhra Pradesh', 'Punjab',
  'Haryana', 'Kerala', 'Assam', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand'
];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad',
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Chandigarh', 'Guwahati', 'Mysore', 'Coimbatore', 'Kota', 'Ranchi', 'Varanasi'
];

const qualifications = [
  'B.Ed', 'M.Ed', 'B.A. B.Ed', 'B.Sc. B.Ed', 'D.El.Ed', 'Ph.D.', 'B.A.', 'B.Sc.', 'B.Com.',
  'M.A.', 'M.Sc.', 'M.Com.', 'B.Tech/B.E.', 'M.Tech/M.E.'
];

const skillSets = [
  'Mathematics, Science, Classroom Management, CTET Certified',
  'English Literature, Creative Writing, Public Speaking, TET Qualified',
  'Physics, Chemistry, Laboratory Skills, Online Teaching',
  'Computer Science, Programming, Web Development, MS Office',
  'Social Studies, History, Geography, Activity-based Learning',
  'Primary Education, Child Psychology, Montessori Training',
  'Mathematics, Statistics, Problem Solving, Google Classroom',
  'Biology, Environmental Science, Practical Skills, Zoom Expert',
  'Hindi, Sanskrit, Language Teaching, Cultural Activities',
  'Economics, Commerce, Accountancy, Smart Board Teaching',
  'Art & Craft, Drawing, Painting, Creative Activities',
  'Physical Education, Sports, Yoga, Health & Fitness',
  'Music, Dance, Drama, Extracurricular Activities',
  'Special Education, Inclusive Teaching, Learning Disabilities',
  'Early Childhood Education, Play-way Method, Story Telling'
];

const possibleTags = [
  'experienced', 'fresher', 'certified', 'excellent', 'good-communicator',
  'team-player', 'innovative', 'dedicated', 'punctual', 'reliable',
  'tech-savvy', 'leadership', 'organized', 'motivated', 'qualified',
  'versatile', 'creative', 'committed', 'passionate', 'responsive'
];

// Only use 'pending' for initial status
const possibleStatuses = [
  'pending'
];

const possibleGenders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const possibleNotes = [
  'Strong candidate with excellent qualifications',
  'Good communication skills, needs improvement in technical area',
  'Follow up next week',
  'Looks promising for the position',
  'Waiting for additional information',
  'Schedule interview',
  'Great potential for growth',
  'Needs experience verification',
  'Recommended for approval',
  'Consider for future positions',
  '',
  '',
  '',
  null,
  null,
  null
];

const collegeNames = [
  // Tier 1 Institutions
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kharagpur', 'NIT Trichy', 'NIT Surathkal',
  'Delhi University', 'Mumbai University', 'Delhi School of Economics',
  // Tier 2 Institutions
  'Banaras Hindu University', 'Jawaharlal Nehru University', 'Aligarh Muslim University',
  'Jamia Millia Islamia', 'Amrita Vishwa Vidyapeetham', 'VIT University',
  'Anna University', 'BITS Pilani', 'Manipal University',
  // Tier 3 Institutions
  'St. Stephens College', 'Miranda House', 'Ramakrishna Mission Vivekananda University',
  'Christ University', 'Symbiosis International University',
  'Shobhit University', 'Gautam Buddha University', 'Lovely Professional University'
];

const collegeTiers = [
  'Tier 1', 'Tier 2', 'Tier 3'
];

const cvPaths = [
  'uploads/cvs/cv-sample-001.pdf',
  'uploads/cvs/cv-sample-002.pdf',
  'uploads/cvs/cv-sample-003.docx',
  'uploads/cvs/resume-001.pdf',
  'uploads/cvs/resume-002.pdf',
  'uploads/cvs/application-001.pdf',
  null, null, null // Some without CV
];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to generate random salary
const getRandomSalary = () => Math.floor(Math.random() * (200000 - 40000 + 1)) + 40000;

// Helper function to generate random date in last 90 days
const getRandomDate = () => {
  const now = new Date();
  const days = Math.floor(Math.random() * 90);
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date;
};

// Generate 1,500 India-origin applicants with diverse Indian colleges
const generateApplicants = (count) => {
  const applicants = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const hasCv = Math.random() > 0.2;
    // Generate random tags (0-4 tags per applicant)
    const numTags = Math.floor(Math.random() * 5);
    const tags = [];
    for (let j = 0; j < numTags; j++) {
      const tag = getRandomItem(possibleTags);
      if (!tags.includes(tag)) tags.push(tag);
    }
    const status = getRandomItem(possibleStatuses);
    let rating = Math.floor(Math.random() * 5) + 1;
    if (status === 'pending') rating = Math.floor(Math.random() * 3) + 1;
    else if (status === 'shortlisted') rating = Math.floor(Math.random() * 2) + 4;
    else rating = 5;
    // Only use Indian states, cities, and colleges
    applicants.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
      phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      gender: getRandomItem(possibleGenders),
      state: getRandomItem(indianStates),
      city: getRandomItem(indianCities),
      highestQualification: getRandomItem(qualifications),
      collegeName: getRandomItem(collegeNames),
      collegeTier: getRandomItem(collegeTiers),
      skills: getRandomItem(skillSets),
      preferredLocation: getRandomItem(indianCities),
      expectedSalary: getRandomSalary(),
      cvPath: hasCv ? getRandomItem(cvPaths.filter(cv => cv !== null)) : null,
      status: 'pending',
      rating: rating,
      tags: tags,
      notes: getRandomItem(possibleNotes),
      emailSent: Math.random() > 0.5,
      createdAt: getRandomDate()
    });
  }
  return applicants;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Applicant.deleteMany({});
    console.log('✅ Cleared existing applicants');

    // Generate 1,500 India-origin applicants
    const applicants = generateApplicants(1500);
    console.log(`✅ Generated ${applicants.length} India-origin applicants`);

    // Insert into database
    const result = await Applicant.insertMany(applicants);
    console.log(`✅ Successfully inserted ${result.length} applicants into database`);

    // Display summary
    console.log('\n📊 SEED DATA SUMMARY:');
    console.log(`   Total Applicants: ${result.length}`);
    
    const avgSalary = applicants.reduce((sum, app) => sum + app.expectedSalary, 0) / applicants.length;
    console.log(`   Average Expected Salary: $${Math.round(avgSalary).toLocaleString()}`);

    const withCv = applicants.filter(app => app.cvPath).length;
    console.log(`   Applicants with CV: ${withCv}`);
    console.log(`   Applicants without CV: ${applicants.length - withCv}`);

    // Show sample records
    console.log('\n📝 SAMPLE RECORDS:');
    const samples = await Applicant.find().limit(5);
    samples.forEach((applicant, index) => {
      console.log(`\n   ${index + 1}. ${applicant.name}`);
      console.log(`      Location: ${applicant.currentLocation}`);
      console.log(`      Preferred: ${applicant.preferredLocation}`);
      console.log(`      Education: ${applicant.educationFrom}`);
      console.log(`      Company: ${applicant.workedAt}`);
      console.log(`      Salary: $${applicant.expectedSalary.toLocaleString()}`);
      console.log(`      CV: ${applicant.cvPath ? '✅ Yes' : '❌ No'}`);
    });

    console.log('\n✅ SEED COMPLETED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
