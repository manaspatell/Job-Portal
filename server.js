require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const connectDB = require('./config/db');

// Import routes
const applicantRoutes = require('./routes/applicantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

// Initialize Express app
const app = express();

// --- SOCKET.IO SETUP ---
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Make io accessible in routes/controllers
app.set('io', io);

// Broadcast rating update event
io.on('connection', (socket) => {
  // You can add authentication here if needed
  console.log('Socket.IO client connected');
});

// Connect to MongoDB
connectDB();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Expose whether current route is under /admin for templating
app.use((req, res, next) => {
  res.locals.isAdmin = req.path.startsWith('/admin');
  next();
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  })
);

  // Create uploads directory if it doesn't exist
  const paymentProofsDir = path.join(__dirname, 'uploads', 'payment-proofs');
  if (!fs.existsSync(paymentProofsDir)) {
    fs.mkdirSync(paymentProofsDir, { recursive: true });
  }

  // Configure multer for payment proof uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, paymentProofsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const uploadPayment = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

// Simple JSON store for payment submissions
const dataDir = path.join(__dirname, 'data');
const paymentsFile = path.join(dataDir, 'payments.json');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(paymentsFile)) {
  fs.writeFileSync(paymentsFile, '[]');
}

const loadPayments = () => {
  try {
    const raw = fs.readFileSync(paymentsFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const savePayments = (items) => {
  fs.writeFileSync(paymentsFile, JSON.stringify(items, null, 2));
};

const loadPricing = () => {
  const pricingFile = path.join(__dirname, 'data', 'subscriptionPricing.json');
  try {
    if (fs.existsSync(pricingFile)) {
      return JSON.parse(fs.readFileSync(pricingFile, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading pricing store:', err);
  }
  return {};
};

// Home route - redirect to school login
app.get('/', (req, res) => {
  res.redirect('/school/login');
});

// Subscription pricing page (no login required)
app.get('/subscription-pricing', (req, res) => {
  try {
    const pricingFile = path.join(__dirname, 'data', 'subscriptionPricing.json');
    let pricing = {};
    
    if (fs.existsSync(pricingFile)) {
      pricing = JSON.parse(fs.readFileSync(pricingFile, 'utf-8'));
    }
    
    res.render('subscription-pricing', { 
      title: 'Pricing Plans',
      pricing 
    });
  } catch (error) {
    console.error('Error loading pricing:', error);
    res.render('subscription-pricing', { 
      title: 'Pricing Plans',
      pricing: {} 
    });
  }
});

// Verification pending page
app.get('/verification-pending', (req, res) => {
  res.render('verification-pending', { title: 'Verification Pending' });
});

// Renewal subscription page
app.get('/renew-subscription', (req, res) => {
  res.render('renew-subscription', { title: 'Renew Subscription', error: null, email: req.query.email || '' });
});

// API: Get pricing data
app.get('/api/pricing', (req, res) => {
  try {
    const pricingFile = path.join(__dirname, 'data', 'subscriptionPricing.json');
    let pricing = {};
    
    if (fs.existsSync(pricingFile)) {
      pricing = JSON.parse(fs.readFileSync(pricingFile, 'utf-8'));
    }
    
    res.json(pricing);
  } catch (error) {
    console.error('Error loading pricing:', error);
    res.json({});
  }
});

// API: Verify school credentials
app.post('/api/verify-school', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password are required' });
    }

    const School = require('./models/School');
    const school = await School.findOne({ email: email.trim().toLowerCase() });

    if (!school) {
      return res.json({ success: false, message: 'School not found with this email' });
    }

    const isPasswordValid = await school.comparePassword(password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    // Return school details, including lastSubscription for previous plan info
    res.json({
      success: true,
      school: {
        id: school._id.toString(),
        name: school.name,
        email: school.email,
        status: school.status,
        subscription: {
          tier: school.subscription?.tier || 'none',
          status: school.subscription?.status || 'expired',
          endDate: school.subscription?.endDate
        },
        lastSubscription: school.lastSubscription || null
      }
    });
  } catch (error) {
    console.error('Verify school error:', error);
    res.json({ success: false, message: 'Error verifying credentials' });
  }
});

// API: Submit renewal payment
app.post('/api/submit-renewal', uploadPayment.single('paymentScreenshot'), (req, res) => {
  try {
    const { schoolId, schoolEmail, plan, phone } = req.body;
    const screenshot = req.file;

    if (!schoolId || !schoolEmail || !plan || !phone || !screenshot) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const payments = loadPayments();
    const pricing = loadPricing();
    const planKey = (plan || '').toLowerCase();
    const planData = pricing[planKey] || {};
    const amount = Number(planData.currentPrice) || Number(planData.basePrice) || 0;

    const newPayment = {
      id: Date.now().toString(),
      schoolId,
      email: schoolEmail,
      instituteName: 'Renewal Payment',
      phone,
      whatsapp: phone,
      plan,
      amount,
      screenshot: screenshot.filename,
      status: 'pending',
      isRenewal: true,
      submittedAt: new Date().toISOString()
    };

    payments.push(newPayment);
    savePayments(payments);

    console.log('Renewal payment submitted:', newPayment);

    res.json({ success: true, message: 'Renewal payment submitted successfully' });
  } catch (error) {
    console.error('Renewal submission error:', error);
    res.json({ success: false, message: error.message || 'Error processing renewal' });
  }
});

// Checkout page
app.get('/checkout', (req, res) => {
  const plan = req.query.plan || 'Gold';
  res.render('checkout', { title: 'Complete Registration', plan });
});

// Handle checkout form submission
app.post('/checkout/submit', uploadPayment.single('paymentScreenshot'), (req, res) => {
  try {
    const { instituteName, phone, whatsapp, plan, email } = req.body;
    const screenshot = req.file;

    if (!instituteName || !phone || !whatsapp || !screenshot) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const payments = loadPayments();
    const pricing = loadPricing();
    const planKey = (plan || '').toLowerCase();
    const planData = pricing[planKey] || {};
    const amount = Number(planData.currentPrice) || Number(planData.basePrice) || 0;

    const newPayment = {
      id: Date.now().toString(),
      instituteName,
      phone,
      whatsapp,
      plan: plan || 'N/A',
      email: email || '',
      amount,
      screenshot: screenshot.filename,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    payments.push(newPayment);
    savePayments(payments);

    console.log('Payment proof submitted:', newPayment);

    res.json({ success: true, message: 'Payment proof submitted successfully' });
  } catch (error) {
    console.error('Checkout error:', error);
    res.json({ success: false, message: error.message || 'Error processing request' });
  }
});

// API: Track payment status by email
app.get('/api/track-payment', (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.json({ success: false, message: 'Email is required' });
    }

    const payments = loadPayments();
    const payment = payments.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());

    if (payment) {
      return res.json({ 
        success: true, 
        payment: {
          instituteName: payment.instituteName,
          plan: payment.plan,
          email: payment.email,
          phone: payment.phone,
          whatsapp: payment.whatsapp,
          status: payment.status,
          isRenewal: payment.isRenewal || false,
          submittedAt: payment.submittedAt,
          approvedAt: payment.approvedAt
        }
      });
    } else {
      return res.json({ 
        success: false, 
        message: 'No payment record found with this email. Please check your email and try again.' 
      });
    }
  } catch (error) {
    console.error('Track payment error:', error);
    res.json({ success: false, message: 'An error occurred while checking status' });
  }
});

// Use routes
app.use('/', applicantRoutes);
app.use('/admin', adminRoutes);
app.use('/school', schoolRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  
  // Handle Multer errors
  if (err.message && err.message.includes('Only PDF')) {
    return res.status(400).render('apply', {
      title: 'Job Application Form',
      error: err.message
    });
  }

  if (err.message && err.message.includes('Only image files')) {
    return res.json({ success: false, message: err.message });
  }

  res.status(500).render('error', {
    title: 'Error',
    error: err.message || 'An error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`School login: http://localhost:${PORT}/school/login`);
});

