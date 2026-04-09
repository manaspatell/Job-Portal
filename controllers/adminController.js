// Admin rejects payment for a paid applicant
exports.rejectApplicantPayment = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant || !applicant.isPaid) {
      return res.status(404).render('error', { error: 'Applicant not found or not a paid application.' });
    }
    applicant.paymentStatus = 'rejected';
    applicant.isPaid = false;
    await applicant.save();
    res.redirect('/admin/paid-applicants');
  } catch (error) {
    res.status(500).render('error', { error: 'Error rejecting payment.' });
  }
};

// Utility: Set rating 5 for all paid applicants
exports.setPaidApplicantsRating = async (req, res) => {
  try {
    const result = await Applicant.updateMany({ isPaid: true, rating: { $ne: 5 } }, { $set: { rating: 5 } });
    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }

}
// List paid applicants for admin verification (with filter, search, pagination)
exports.getPaidApplicants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const search = req.query.search || '';
    const paymentStatus = req.query.paymentStatus || '';
    const filter = { isPaid: true };
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    const total = await Applicant.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const applicants = await Applicant.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.render('admin-paid-applicants', {
      title: 'Paid Applicants - Payment Verification',
      applicants,
      search,
      paymentStatus,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    res.status(500).render('error', { error: 'Error loading paid applicants.' });
  }
};

// Admin verifies payment for a paid applicant
exports.verifyApplicantPayment = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant || !applicant.isPaid) {
      return res.status(404).render('error', { error: 'Applicant not found or not a paid application.' });
    }
    applicant.paymentStatus = 'verified';
    applicant.paymentVerifiedBy = req.user ? req.user._id : null;
    applicant.paymentVerifiedAt = new Date();
    applicant.rating = 5;
    applicant.isPaid = true;
    if (!applicant.tags.includes('paid')) {
      applicant.tags.push('paid');
    }
    await applicant.save();
    res.redirect('/admin/paid-applicants');
  } catch (error) {
    res.status(500).render('error', { error: 'Error verifying payment.' });
  }
};
// Report: Show all applicants and which school updated their status, with filters and SaaS layout
exports.getApplicantsReport = async (req, res) => {
  try {
    const { search = '', status = '', school = '', location = '', paid = '' } = req.query;
    const SchoolModel = require('../models/School');
    const schools = await SchoolModel.find({}, 'name _id');
    let filter = {};
    if (status) filter.status = status;
    if (school) filter.statusUpdatedBy = school;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { 'statusUpdatedBy.name': new RegExp(search, 'i') }
      ];
    }
    if (paid === 'true') filter.isPaid = true;
    if (paid === 'false') filter.isPaid = false;
    // For location, filter by school location if provided
    let applicants = await Applicant.find(filter)
      .populate('statusUpdatedBy', 'name email location')
      .sort({ createdAt: -1 })
      .lean();
    if (location) {
      applicants = applicants.filter(app => app.statusUpdatedBy && app.statusUpdatedBy.location && app.statusUpdatedBy.location.toLowerCase().includes(location.toLowerCase()));
    }
    res.render('admin-applicants-report', {
      title: 'Applicants Status Report',
      applicants,
      schools,
      search,
      status,
      school,
      location,
      paid
    });
  } catch (error) {
    console.error('Error fetching applicants report:', error);
    res.status(500).render('error', { error: 'Error loading applicants report' });
  }
};
const Applicant = require('../models/Applicant');
const School = require('../models/School');
const { validatePasswordStrength } = require('../utils/passwordSecurity');
const fs = require('fs');
const path = require('path');

// Payment storage helpers
const paymentsFile = path.join(__dirname, '..', 'data', 'payments.json');
const ensurePaymentsStore = () => {
  const dir = path.dirname(paymentsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(paymentsFile)) fs.writeFileSync(paymentsFile, '[]');
};

const loadPayments = () => {
  ensurePaymentsStore();
  try {
    return JSON.parse(fs.readFileSync(paymentsFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const savePayments = (items) => {
  ensurePaymentsStore();
  fs.writeFileSync(paymentsFile, JSON.stringify(items, null, 2));
};

const fetchStatsAndFilters = async () => {
  // Stats
  const totalApplicants = await Applicant.countDocuments();
  const byStatus = await Applicant.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const byState = await Applicant.aggregate([
    { $group: { _id: '$state', count: { $sum: 1 } } }
  ]);
  const avgSalary = await Applicant.aggregate([
    { $group: { _id: null, average: { $avg: '$expectedSalary' } } }
  ]);
  const byQualification = await Applicant.aggregate([
    { $group: { _id: '$highestQualification', count: { $sum: 1 } } }
  ]);
  const byCollegeTier = await Applicant.aggregate([
    { $group: { _id: '$collegeTier', count: { $sum: 1 } } }
  ]);

  // Filter values
  const locations = await Applicant.distinct('preferredLocation');
  const states = await Applicant.distinct('state');
  const qualifications = await Applicant.distinct('highestQualification');
  const collegeTiers = await Applicant.distinct('collegeTier');
  const genders = await Applicant.distinct('gender');

  const topQual = byQualification.length > 0
    ? byQualification.reduce((prev, current) => (prev.count > current.count ? prev : current))._id
    : 'N/A';

  const stats = {
    total: totalApplicants,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item._id || 'pending'] = item.count;
      return acc;
    }, {}),
    avgSalary: avgSalary[0]?.average || 0,
    topQualification: topQual,
    byState: byState.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };

  return {
    stats,
    locations: locations.filter(Boolean),
    states: states.filter(Boolean),
    qualifications: qualifications.filter(Boolean),
    collegeTiers: collegeTiers.filter(Boolean),
    genders: genders.filter(Boolean),
    byState,
    byQualification,
    byCollegeTier
  };
};

// Helper: Get applicant counts per month for the last 12 months
async function getApplicantsPerMonth() {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      count: 0
    });
  }
  // Get counts grouped by year/month
  const results = await Applicant.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]);
  // Map results to months array
  months.forEach(m => {
    const found = results.find(r => r._id.year === m.year && r._id.month === m.month + 1);
    if (found) m.count = found.count;
  });
  return months;
}

// Render login page
exports.renderLoginPage = (req, res) => {
  res.render('login', { title: 'Admin Login' });
};

// Handle admin login
exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  // Simple authentication (use process.env variables)
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    req.session.adminEmail = email;
    res.redirect('/admin/dashboard');
  } else {
    res.status(401).render('login', {
      title: 'Admin Login',
      error: 'Invalid email or password'
    });
  }
};

// Render overview dashboard (stats only)
exports.getDashboard = async (req, res) => {
  try {
    const { stats, byState, byQualification, byCollegeTier } = await fetchStatsAndFilters();
    // Recent activity: last 8 applicants
    const recentApplicants = await Applicant.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    // Get monthly applicant data for trends chart
    const applicantsPerMonth = await getApplicantsPerMonth();
    res.render('dashboard', {
      title: 'Admin Overview',
      stats,
      byState,
      byQualification,
      byCollegeTier,
      applicants: [],
      recentApplicants,
      applicantsPerMonth, // <-- pass to EJS
      locations: [],
      states: [],
      qualifications: [],
      collegeTiers: [],
      genders: [],
      currentFilter: '',
      currentStatus: '',
      currentState: '',
      currentGender: '',
      currentQualification: '',
      currentTier: '',
      currentSort: 'createdAt',
      searchTerm: '',
      currentPage: 1,
      totalPages: 1,
      showList: false
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('dashboard', {
      title: 'Admin Dashboard',
      error: 'Error loading dashboard'
    });
  }
};

// Render form to create school credentials
exports.renderCredentialForm = async (req, res) => {
  try {
    const locations = await Applicant.distinct('preferredLocation');
    // Autofill from query params
    const autofill = {
      name: req.query.name || '',
      email: req.query.email || '',
      subscriptionTier: req.query.subscriptionTier || 'none'
    };
    res.render('create-credential', {
      title: 'Create School Credential',
      success: null,
      error: null,
      locations: locations.filter(Boolean).sort(),
      autofill
    });
  } catch (error) {
    console.error('Error rendering credential form:', error);
    res.status(500).render('create-credential', {
      title: 'Create School Credential',
      success: null,
      error: 'Error loading form',
      locations: [],
      autofill: {}
    });
  }
};

// Handle credential creation
exports.createCredential = async (req, res) => {
  try {
    const { name, userId, email, password, location, genderFilter, subscriptionTier } = req.body;
    const locations = await Applicant.distinct('preferredLocation');
    const sortedLocations = locations.filter(Boolean).sort();

    if (!name || !userId || !email || !password || !location || !genderFilter) {
      return res.status(400).render('create-credential', { 
        title: 'Create School Credential', 
        success: null, 
        error: 'All fields are required',
        locations: sortedLocations
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).render('create-credential', { 
        title: 'Create School Credential', 
        success: null, 
        error: 'Password is too weak. Requirements:<br>' + passwordValidation.errors.join('<br>'),
        locations: sortedLocations
      });
    }

    const existingUserId = await School.findOne({ userId });
    if (existingUserId) {
      return res.status(400).render('create-credential', { 
        title: 'Create School Credential', 
        success: null, 
        error: 'Credential already exists for this user ID',
        locations: sortedLocations
      });
    }
    const existingEmail = await School.findOne({ email });
    if (existingEmail) {
      return res.status(400).render('create-credential', { 
        title: 'Create School Credential', 
        success: null, 
        error: 'Credential already exists for this email',
        locations: sortedLocations
      });
    }
    // Create subscription object
    let subscription = {
      tier: subscriptionTier || 'none',
      startDate: null,
      endDate: null,
      status: 'active'
    };
    if (subscriptionTier && subscriptionTier !== 'none') {
      subscription.startDate = new Date();
      subscription.endDate = new Date();
      if (subscriptionTier === 'silver') {
        subscription.endDate.setDate(subscription.endDate.getDate() + 30);
      } else if (subscriptionTier === 'gold') {
        subscription.endDate.setMonth(subscription.endDate.getMonth() + 6);
      } else if (subscriptionTier === 'diamond') {
        subscription.endDate.setFullYear(subscription.endDate.getFullYear() + 1);
      }
    }

    // Create and save the new school credential
    const newSchool = new School({
      name,
      userId,
      email,
      password,
      location,
      genderFilter,
      subscription
    });
    await newSchool.save();

    res.render('create-credential', {
      title: 'Create School Credential',
      success: 'School credential created successfully!',
      error: null,
      locations: sortedLocations,
      autofill: {}
    });

  } catch (error) {
    console.error('Error creating credentials:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create credentials' 
    });
  }
};
// List all school credentials
exports.manageCredentials = async (req, res) => {
  try {
    // Fetch schools and explicitly exclude password field
    const schools = await School.find().select('-password').sort({ createdAt: -1 });
    const locations = await Applicant.distinct('preferredLocation');
    res.render('manage-credentials', { 
      title: 'Manage School Credentials',
      schools,
      locations: locations.filter(Boolean).sort(),
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).render('manage-credentials', { 
      title: 'Manage School Credentials',
      schools: [],
      locations: [],
      error: 'Error loading credentials'
    });
  }
};

// Edit school credential
exports.editCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, userId, location, password, genderFilter, subscriptionTier } = req.body;

    // Check if userId is already taken by another school
    const existingSchool = await School.findOne({ userId, _id: { $ne: id } });
    if (existingSchool) {
      return res.redirect('/admin/credentials?error=' + encodeURIComponent('User ID already exists for another school'));
    }

    // Fetch the school and update fields, then save (to trigger pre-save hooks)
    const school = await School.findById(id);
    if (!school) {
      return res.redirect('/admin/credentials?error=' + encodeURIComponent('School not found'));
    }
    school.name = name;
    school.userId = userId;
    school.location = location;
    school.genderFilter = genderFilter;

    // Only update password if provided and validate strength
    if (password && password.trim() !== '') {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.redirect('/admin/credentials?error=' + encodeURIComponent('Password too weak. ' + passwordValidation.errors.join(' ')));
      }
      school.password = password;
    }

    // Handle subscription tier update
    if (subscriptionTier && ['silver', 'gold', 'diamond', 'none'].includes(subscriptionTier)) {
      let subscriptionStartDate = null;
      let subscriptionEndDate = null;
      let subStatus = 'active';

      if (subscriptionTier !== 'none') {
        subscriptionStartDate = new Date();
        subscriptionEndDate = new Date();

        if (subscriptionTier === 'silver') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30 days
        } else if (subscriptionTier === 'gold') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6); // 6 months
        } else if (subscriptionTier === 'diamond') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 year
        }
      }

      school.subscription = {
        tier: subscriptionTier,
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        status: subStatus
      };
    }

    await school.save();
    res.redirect('/admin/credentials?success=' + encodeURIComponent('School credential updated successfully'));
  } catch (error) {
    console.error('Error updating credential:', error);
    res.redirect('/admin/credentials?error=' + encodeURIComponent('Error updating credential'));
  }
};

// Delete school credential
exports.deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    await School.findByIdAndDelete(id);
    res.redirect('/admin/credentials?success=' + encodeURIComponent('School credential deleted successfully'));
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.redirect('/admin/credentials?error=' + encodeURIComponent('Error deleting credential'));
  }
};

// Toggle school credential status (active/paused)
exports.toggleCredentialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findById(id);
    
    if (!school) {
      return res.redirect('/admin/credentials?error=' + encodeURIComponent('School not found'));
    }

    // Check if trying to activate a school without subscription
    if (school.status === 'paused') {
      const hasNoSubscription = !school.subscription || !school.subscription.tier || school.subscription.tier === 'none';
      if (hasNoSubscription) {
        return res.redirect('/admin/credentials?error=' + encodeURIComponent('Cannot activate school without an active subscription. Please assign a subscription first.'));
      }
      
      // Check if subscription has expired
      if (school.subscription.endDate && new Date() > school.subscription.endDate) {
        return res.redirect('/admin/credentials?error=' + encodeURIComponent('Cannot activate school with expired subscription. Please renew the subscription first.'));
      }
    }

    // Toggle status
    school.status = school.status === 'active' ? 'paused' : 'active';
    await school.save();
    
    const statusText = school.status === 'active' ? 'activated' : 'paused';
    res.redirect('/admin/credentials?success=' + encodeURIComponent(`School credential ${statusText} successfully`));
  } catch (error) {
    console.error('Error toggling credential status:', error);
    res.redirect('/admin/credentials?error=' + encodeURIComponent('Error updating status'));
  }
};

// Render applicants list with filters
exports.getApplicantsPage = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt';
    const filterLocation = req.query.location || '';
    const filterStatus = req.query.status || '';
    const filterState = req.query.state || '';
    const filterGender = req.query.gender || '';
    const filterQualification = req.query.qualification || '';
    const filterCollegeTier = req.query.collegeTier || '';
    const searchTerm = req.query.search || '';
    const paid = req.query.paid || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    let query = Applicant.find();

    if (filterLocation) {
      query = query.where('preferredLocation').equals(filterLocation);
    }

    if (filterStatus) {
      query = query.where('status').equals(filterStatus);
    }

    if (filterState) {
      query = query.where('state').equals(filterState);
    }

    if (filterGender) {
      query = query.where('gender').equals(filterGender);
    }

    if (filterQualification) {
      query = query.where('highestQualification').equals(filterQualification);
    }

    if (filterCollegeTier) {
      query = query.where('collegeTier').equals(filterCollegeTier);
    }

    if (paid === 'true') {
      query = query.where('isPaid').equals(true);
    } else if (paid === 'false') {
      query = query.where('isPaid').equals(false);
    }

    if (searchTerm) {
      query = query.or([
        { name: new RegExp(searchTerm, 'i') },
        { email: new RegExp(searchTerm, 'i') },
        { phone: new RegExp(searchTerm, 'i') },
        { skills: new RegExp(searchTerm, 'i') }
      ]);
    }

    const totalCount = await Applicant.countDocuments(query.getFilter());
    const totalPages = Math.ceil(totalCount / limit);

    const applicants = await query
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const { stats, locations, states, qualifications, collegeTiers, genders, byState, byQualification, byCollegeTier } = await fetchStatsAndFilters();

    res.render('dashboard', {
      title: 'Applicants',
      applicants,
      locations,
      states,
      qualifications,
      collegeTiers,
      genders,
      currentFilter: filterLocation,
      currentStatus: filterStatus,
      currentState: filterState,
      currentGender: filterGender,
      currentQualification: filterQualification,
      currentTier: filterCollegeTier,
      currentSort: sortBy,
      searchTerm,
      currentPage: page,
      totalPages,
      totalCount,
      stats,
      byState,
      byQualification,
      byCollegeTier,
      showList: true,
      paid
    });
  } catch (error) {
    console.error('Error fetching applicants page:', error);
    res.status(500).render('dashboard', {
      title: 'Applicants',
      error: 'Error loading applicants'
    });
  }
};

// Infinite scroll JSON controller removed

// Logout admin
exports.logoutAdmin = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/admin/login');
  });
};

// Get applicant details
exports.getApplicantDetail = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).render('error', { error: 'Applicant not found' });
    }
    res.render('applicant-detail', {
      title: 'Applicant Details',
      applicant: applicant
    });
  } catch (error) {
    console.error('Error fetching applicant:', error);
    res.status(500).render('error', { error: 'Error loading applicant' });
  }
};

// Update applicant status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Applicant.findByIdAndUpdate(req.params.id, { status: status });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send('Error updating status');
  }
};

// Update applicant rating
exports.updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const updated = await Applicant.findByIdAndUpdate(req.params.id, { rating: parseInt(rating) }, { new: true });
    // Emit Socket.IO event for live update
    const io = req.app.get('io');
    if (io && updated) {
      io.emit('ratingUpdated', { applicantId: updated._id, rating: updated.rating });
    }
    res.json({ success: true, message: 'Rating updated' });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ success: false, error: 'Error updating rating' });
  }
};

// Add tags
exports.addTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    await Applicant.findByIdAndUpdate(req.params.id, { tags: tagArray });
    res.json({ success: true, message: 'Tags updated' });
  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ success: false, error: 'Error updating tags' });
  }
};

// Add notes
exports.addNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    await Applicant.findByIdAndUpdate(req.params.id, { notes: notes });
    res.json({ success: true, message: 'Notes updated' });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ success: false, error: 'Error updating notes' });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
  try {
    await Applicant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Applicant deleted' });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    res.status(500).json({ success: false, error: 'Error deleting applicant' });
  }
};

// Bulk delete
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    await Applicant.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} applicants deleted` });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({ success: false, error: 'Error deleting applicants' });
  }
};

// Bulk status update
exports.bulkStatusUpdate = async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Applicant.updateMany({ _id: { $in: ids } }, { status: status });
    res.json({ success: true, message: `${ids.length} applicants updated` });
  } catch (error) {
    console.error('Error bulk updating:', error);
    res.status(500).json({ success: false, error: 'Error updating applicants' });
  }
};

// Export to CSV
exports.exportToCSV = async (req, res) => {
  try {
    const applicants = await Applicant.find();
    
    // Create CSV header
    const headers = ['Name', 'Email', 'Phone', 'State', 'City', 'Qualification', 'College', 'College Tier', 'Skills', 'Preferred Location', 'Expected Salary', 'Status', 'Rating', 'Tags', 'Submitted Date'];
    
    // Create CSV rows
    const rows = applicants.map(app => [
      app.name,
      app.email || '',
      app.phone || '',
      app.state || '',
      app.city || '',
      app.highestQualification || '',
      app.collegeName || '',
      app.collegeTier || '',
      app.skills || '',
      app.preferredLocation || '',
      app.expectedSalary || '',
      app.status || 'pending',
      app.rating || '0',
      (app.tags || []).join('; '),
      new Date(app.createdAt).toLocaleDateString()
    ]);

    // Combine headers and rows
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applicants.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).send('Error exporting data');
  }
};

// Get shortlisted applicants
exports.getShortlisted = async (req, res) => {
  try {
    const applicants = await Applicant.find({ status: 'shortlisted' }).sort({ createdAt: -1 });
    res.render('shortlist', {
      title: 'Shortlisted Candidates',
      applicants: applicants
    });
  } catch (error) {
    console.error('Error fetching shortlisted:', error);
    res.status(500).render('error', { error: 'Error loading shortlist' });
  }
};
// Get subscriptions management page
exports.getSubscriptions = async (req, res) => {
  try {
    const { tier } = req.query;
    let query = {};

    // Filter by tier if provided
    if (tier && tier !== 'expired') {
      query['subscription.tier'] = tier;
    }

    // Fetch schools excluding password field
    const schools = await School.find(query).select('-password').sort({ 'subscription.endDate': -1 });

    // Filter expired subscriptions if requested
    let filteredSchools = schools;
    if (tier === 'expired') {
      const now = new Date();
      filteredSchools = schools.filter(s => {
        return s.subscription?.endDate && s.subscription.endDate < now;
      });
    }

    // Calculate statistics
    const silverCount = await School.countDocuments({ 'subscription.tier': 'silver' });
    const goldCount = await School.countDocuments({ 'subscription.tier': 'gold' });
    const diamondCount = await School.countDocuments({ 'subscription.tier': 'diamond' });
    const totalSubscriptions = silverCount + goldCount + diamondCount;

    res.render('subscriptions', {
      title: 'Subscription Management',
      schools: filteredSchools,
      silverCount,
      goldCount,
      diamondCount,
      totalSubscriptions,
      currentFilter: tier || 'all'
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).render('error', { error: 'Error loading subscriptions' });
  }
};

// Upgrade or change subscription tier
exports.upgradeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTier } = req.body;

    if (!['silver', 'gold', 'diamond', 'none'].includes(newTier)) {
      return res.status(400).json({ success: false, error: 'Invalid subscription tier' });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, error: 'School not found' });
    }

    let subscriptionStartDate = null;
    let subscriptionEndDate = null;
    let subStatus = 'active';

    if (newTier !== 'none') {
      subscriptionStartDate = new Date();
      subscriptionEndDate = new Date();

      if (newTier === 'silver') {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30 days
      } else if (newTier === 'gold') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6); // 6 months
      } else if (newTier === 'diamond') {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 year
      }
    }

    // Store last subscription info before upgrading (guard if subscription missing)
    if (school.subscription && school.subscription.tier && school.subscription.tier !== 'none') {
      school.lastSubscription = {
        tier: school.subscription.tier,
        endDate: school.subscription.endDate,
        status: school.subscription.status || 'expired'
      };
    }
    school.subscription = {
      tier: newTier,
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate,
      status: subStatus
    };

    await school.save();
    
    res.status(200).json({ 
      success: true, 
      message: `Subscription upgraded to ${newTier}` 
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ success: false, error: 'Error upgrading subscription' });
  }
};

// Renew subscription
exports.renewSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { renewTier } = req.body;

    if (!['silver', 'gold', 'diamond'].includes(renewTier)) {
      return res.status(400).json({ success: false, error: 'Invalid subscription tier' });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, error: 'School not found' });
    }

    let newEndDate = new Date();

    if (renewTier === 'silver') {
      newEndDate.setDate(newEndDate.getDate() + 30); // 30 days from now
    } else if (renewTier === 'gold') {
      newEndDate.setMonth(newEndDate.getMonth() + 6); // 6 months from now
    } else if (renewTier === 'diamond') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1); // 1 year from now
    }

    // Store last subscription info before renewing (guard if subscription missing)
    if (school.subscription && school.subscription.tier && school.subscription.tier !== 'none') {
      school.lastSubscription = {
        tier: school.subscription.tier,
        endDate: school.subscription.endDate,
        status: 'cancelled'
      };
    }
    school.subscription = {
      tier: renewTier,
      startDate: school.subscription?.startDate || new Date(),
      endDate: newEndDate,
      status: 'active'
    };

    await school.save();
    
    res.status(200).json({ 
      success: true, 
      message: `Subscription renewed for ${renewTier}` 
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({ success: false, error: 'Error renewing subscription' });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, error: 'School not found' });
    }

    // Store last subscription info before cancelling (guard if subscription missing)
    if (school.subscription && school.subscription.tier && school.subscription.tier !== 'none') {
      school.lastSubscription = {
        tier: school.subscription.tier,
        endDate: school.subscription.endDate,
        status: 'cancelled'
      };
    }
    school.subscription = {
      tier: 'none',
      startDate: null,
      endDate: null,
      status: 'cancelled'
    };

    await school.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Subscription cancelled' 
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, error: 'Error cancelling subscription' });
  }
};

// Payments management
exports.getPaymentsPage = async (req, res) => {
  const payments = loadPayments().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const pricing = loadPricing();

  const getPlanPrice = (planName) => {
    const key = (planName || '').toLowerCase();
    const plan = pricing[key];
    if (!plan) return 0;
    return Number(plan.currentPrice) || Number(plan.basePrice) || 0;
  };

  const paymentsWithAmount = payments.map(p => ({
    ...p,
    amount: (typeof p.amount === 'number' ? p.amount : getPlanPrice(p.plan))
  }));
  
  // Calculate statistics
  const approvedPayments = paymentsWithAmount.filter(p => p.status === 'approved');
  const pendingPayments = paymentsWithAmount.filter(p => p.status === 'pending');
  
  // Calculate revenue by plan using dynamic pricing
  const silverRevenue = approvedPayments
    .filter(p => p.plan === 'Silver')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const goldRevenue = approvedPayments
    .filter(p => p.plan === 'Gold')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const diamondRevenue = approvedPayments
    .filter(p => p.plan === 'Diamond')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRevenue = silverRevenue + goldRevenue + diamondRevenue;
  
  // Calculate pending revenue
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Count by plan
  const silverCount = approvedPayments.filter(p => p.plan === 'Silver').length;
  const goldCount = approvedPayments.filter(p => p.plan === 'Gold').length;
  const diamondCount = approvedPayments.filter(p => p.plan === 'Diamond').length;
  
  // Fetch all school emails for credential existence check
  try {
    const schools = await School.find({}, 'email');
    const schoolEmails = schools ? schools.map(s => s.email) : [];
    res.render('admin-payments', {
      title: 'Payment Management',
      payments: paymentsWithAmount,
      stats: {
        totalRevenue,
        silverRevenue,
        goldRevenue,
        diamondRevenue,
        pendingRevenue,
        approvedCount: approvedPayments.length,
        pendingCount: pendingPayments.length,
        silverCount,
        goldCount,
        diamondCount
      },
      schoolEmails
    });
  } catch (err) {
    console.error('Error fetching schools for payments page:', err);
    res.render('admin-payments', {
      title: 'Payment Management',
      payments: paymentsWithAmount,
      stats: {
        totalRevenue,
        silverRevenue,
        goldRevenue,
        diamondRevenue,
        pendingRevenue,
        approvedCount: approvedPayments.length,
        pendingCount: pendingPayments.length,
        silverCount,
        goldCount,
        diamondCount
      },
      schoolEmails: []
    });
  }
};

exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payments = loadPayments();
    const idx = payments.findIndex(p => p.id === id);
    
    if (idx !== -1) {
      payments[idx].status = 'approved';
      payments[idx].approvedAt = new Date().toISOString();
      
      // If this is a renewal payment, automatically activate the subscription
      if (payments[idx].isRenewal && payments[idx].schoolId) {
        try {
          const school = await School.findById(payments[idx].schoolId);
          
          if (school) {
            const plan = payments[idx].plan.toLowerCase();
            let durationDays = 30; // Default Silver
            
            if (plan === 'gold') {
              durationDays = 180; // 6 months
            } else if (plan === 'diamond') {
              durationDays = 365; // 1 year
            }
            
            // Update subscription
            school.subscription = {
              tier: plan,
              startDate: new Date(),
              endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
              status: 'active'
            };
            school.status = 'active';
            
            await school.save();
            
            console.log(`Subscription renewed automatically for school: ${school.name} (${payments[idx].plan})`);
            payments[idx].autoActivated = true;
            payments[idx].activatedAt = new Date().toISOString();
          }
        } catch (error) {
          console.error('Error auto-activating subscription:', error);
          // Continue with approval even if activation fails
        }
      }
      
      savePayments(payments);
    }
    
    // Save session to ensure it persists on redirect
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin/payments');
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/admin/payments');
    });
  }
};

exports.createCredentialsFromPayment = async (req, res) => {
  try {
    const { institute, contact, paymentId } = req.body;
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, password, and confirm password are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }

    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: `Password: ${passwordStrength.feedback.join(', ')}` 
      });
    }

    // Check if email already exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    // Create school credential
    const school = new School({
      name: institute,
      email,
      password,
      phone: contact,
      subscription: {
        tier: 'silver', // or extract from payment data if available
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        status: 'active'
      },
      status: 'active'
    });

    const createdSchool = await school.save();

    // Update payment record with school ID
    if (paymentId) {
      const payments = loadPayments();
      const idx = payments.findIndex(p => p.id === paymentId);
      if (idx !== -1) {
        payments[idx].schoolId = createdSchool._id.toString();
        payments[idx].credentialCreatedAt = new Date().toISOString();
        savePayments(payments);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Credentials created successfully!',
      schoolId: createdSchool._id
    });
  } catch (error) {
    console.error('Error creating credentials:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create credentials' 
    });
  }
};

// Subscription pricing management
const pricingFile = path.join(__dirname, '..', 'data', 'subscriptionPricing.json');
const ensurePricingStore = () => {
  const dir = path.dirname(pricingFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(pricingFile)) {
    const defaultPricing = {
      silver: { name: 'Silver', basePrice: 5000, currentPrice: 5000, discount: 0, discountType: 'percentage', description: 'For small schools', features: ['Up to 100 applicants', 'Basic tracking', 'Email notifications', 'Standard support'], duration: '30 days' },
      gold: { name: 'Gold', basePrice: 25000, currentPrice: 25000, discount: 0, discountType: 'percentage', description: 'For growing schools', featured: true, features: ['Up to 500 applicants', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom branding'], duration: '6 months' },
      diamond: { name: 'Diamond', basePrice: 45000, currentPrice: 45000, discount: 0, discountType: 'percentage', description: 'For large institutions', features: ['Unlimited applicants', 'Full analytics', '24/7 support', 'API access', 'Custom integrations', 'Account manager'], duration: '1 year' }
    };
    fs.writeFileSync(pricingFile, JSON.stringify(defaultPricing, null, 2));
  }
};

const loadPricing = () => {
  ensurePricingStore();
  try {
    return JSON.parse(fs.readFileSync(pricingFile, 'utf-8'));
  } catch (err) {
    return {};
  }
};

const savePricing = (pricing) => {
  ensurePricingStore();
  fs.writeFileSync(pricingFile, JSON.stringify(pricing, null, 2));
};

exports.getSubscriptionPricingPage = (req, res) => {
  try {
    const pricing = loadPricing();
    res.render('admin-subscription-pricing', {
      title: 'Subscription Pricing Management',
      pricing,
      plans: Object.entries(pricing).map(([key, data]) => ({
        id: key,
        ...data,
        finalPrice: data.currentPrice
      })),
      error: null
    });
  } catch (error) {
    console.error('Error loading pricing page:', error);
    res.render('admin-subscription-pricing', {
      title: 'Subscription Pricing Management',
      pricing: {},
      plans: [],
      error: 'Failed to load pricing data'
    });
  }
};

exports.updateSubscriptionPricing = (req, res) => {
  try {
    const { plan, currentPrice, discount, discountType } = req.body;

    if (!plan || !['silver', 'gold', 'diamond'].includes(plan)) {
      return res.status(400).json({ success: false, error: 'Invalid plan' });
    }

    const pricing = loadPricing();
    
    if (!pricing[plan]) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Update pricing
    pricing[plan].currentPrice = parseFloat(currentPrice) || pricing[plan].basePrice;
    pricing[plan].discount = parseFloat(discount) || 0;
    pricing[plan].discountType = discountType || 'percentage';

    savePricing(pricing);

    res.json({
      success: true,
      message: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan updated successfully`,
      plan: pricing[plan]
    });
  } catch (error) {
    console.error('Error updating pricing:', error);

    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete payment by id
exports.deletePayment = (req, res) => {
  try {
    const { id } = req.params;
    let payments = loadPayments();
    const initialLength = payments.length;
    payments = payments.filter(p => String(p.id) !== String(id));
    if (payments.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    savePayments(payments);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, error: 'Error deleting payment' });
  }
};
