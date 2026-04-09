// Render school settings page
exports.renderSettings = async (req, res) => {
  try {
    const school = await School.findById(req.session.schoolUser.id);
    if (!school) {
      return res.status(404).render('404', { title: 'School Not Found' });
    }
    res.render('school-settings', {
      title: 'School Settings',
      school
    });
  } catch (error) {
    console.error('Error rendering school settings:', error);
    res.status(500).render('error', { title: 'Error', error: 'Error loading settings' });
  }
};

// Update school settings (profile customization)
exports.updateSettings = async (req, res) => {
  try {
    const school = await School.findById(req.session.schoolUser.id);
    if (!school) {
      return res.status(404).render('404', { title: 'School Not Found' });
    }
    // Update fields
    school.name = req.body.name || school.name;
    school.email = req.body.email || school.email;
    school.location = req.body.location || school.location;
    // Optionally update contact info fields if present
    if (req.body.contact) school.contact = req.body.contact;
    // Handle logo upload
    if (req.file && req.file.filename) {
      school.logo = '/uploads/school-logos/' + req.file.filename;
    }
    await school.save();
    res.redirect('/school/settings?success=1');
  } catch (error) {
    console.error('Error updating school settings:', error);
    res.status(500).render('error', { title: 'Error', error: 'Error updating settings' });
  }
};
// School view applicant detail
exports.getApplicantDetailForSchool = async (req, res) => {
  try {
    const applicantId = req.params.id;
    // Only allow access if applicant is in school's preferred location
    const { location } = req.session.schoolUser;
    const applicant = await Applicant.findOne({ _id: applicantId, preferredLocation: location });
    if (!applicant) {
      return res.status(404).render('404', { title: 'Applicant Not Found' });
    }
    res.render('school-applicant-detail', { title: 'Applicant Detail', applicant });
  } catch (error) {
    console.error('Error fetching applicant detail:', error);
    res.status(500).render('error', { title: 'Error', error: 'Error loading applicant detail' });
  }
};
// School updates applicant status (shortlist/approve)
exports.updateApplicantStatus = async (req, res) => {
  try {
    const applicantId = req.params.id;
    let status = req.body.status;
    // Debug log incoming body and status
    console.log('DEBUG status update API req.body:', req.body);
    console.log('DEBUG status update API status:', status);
    // Fallback: if status is undefined, try to get from first key (handles edge cases)
    if (!status && req.body && typeof req.body === 'object') {
      const keys = Object.keys(req.body);
      if (keys.length === 1) {
        status = req.body[keys[0]];
        console.log('DEBUG fallback status from key:', status);
      }
    }
    const validStatuses = ['pending', 'shortlisted', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', received: status, body: req.body });
    }
    const schoolId = req.session.schoolUser.id;
    const updated = await Applicant.findByIdAndUpdate(
      applicantId,
      {
        status,
        statusUpdatedBy: schoolId,
        statusUpdatedAt: new Date()
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Applicant not found' });
    }
    // Only return { success: true } for AJAX requests
    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating applicant status:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
const School = require('../models/School');
const Applicant = require('../models/Applicant');
const fs = require('fs');
const path = require('path');

// Payment storage helpers (shared with admin)
const paymentsFile = path.join(__dirname, '..', 'data', 'payments.json');
const loadPayments = () => {
  try {
    if (!fs.existsSync(paymentsFile)) return [];
    return JSON.parse(fs.readFileSync(paymentsFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

// Render school login page
exports.renderLogin = (req, res) => {
  res.render('school-login', { title: 'School Login', error: null, subscriptionError: null });
};

// Handle school login
exports.login = async (req, res) => {
  try {


    const { loginId, password } = req.body;
    let school = null;
    if (loginId && loginId.includes('@')) {
      school = await School.findOne({ email: loginId.trim() });
    } else {
      school = await School.findOne({ userId: loginId });
    }
    if (!school) {
      return res.status(401).render('school-login', { title: 'School Login', error: 'Invalid user ID/email or password', subscriptionError: null });
    }

    // Compare password using bcrypt
    const isPasswordValid = await school.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).render('school-login', { title: 'School Login', error: 'Invalid user ID or password', subscriptionError: null });
    }

    // If a renewal payment is pending, block login until approved
    const payments = loadPayments();
    const pendingRenewal = payments.find(p => 
      p.isRenewal === true && 
      p.status === 'pending' && 
      (
        (p.schoolId && p.schoolId.toString() === school._id.toString())
      )
    );

    if (pendingRenewal) {
      return res.status(403).render('school-login', {
        title: 'School Login',
        error: null,
        subscriptionError: {
          type: 'renewal_pending',
          schoolName: school.name,
          message: 'Your renewal payment is received and under verification. You can login once admin approves it.'
        }
      });
    }

    // Check if school has no subscription or subscription is 'none'
    if (!school.subscription || !school.subscription.tier || school.subscription.tier === 'none') {
      return res.status(403).render('school-login', { 
        title: 'School Login', 
        error: null,
        subscriptionError: {
          type: 'no_subscription',
          schoolName: school.name,
          message: 'Your subscription has expired. Please renew it to continue.'
        }
      });
    }

    // Check if subscription has expired and pause if needed
    if (school.subscription.endDate && new Date() > school.subscription.endDate) {
      // Store last subscription info before pausing
      if (school.subscription.tier && school.subscription.tier !== 'none') {
        school.lastSubscription = {
          tier: school.subscription.tier,
          endDate: school.subscription.endDate,
          status: 'expired'
        };
      }
      // Subscription expired - pause account automatically
      if (school.status !== 'paused') {
        school.status = 'paused';
        school.subscription.status = 'expired';
        await school.save();
      }
      return res.status(403).render('school-login', { 
        title: 'School Login', 
        error: null,
        subscriptionError: {
          type: 'expired',
          schoolName: school.name,
          expiredDate: new Date(school.subscription.endDate).toLocaleDateString(),
          message: 'Your subscription has expired. Please renew it to continue.'
        }
      });
    }

    // Check if school is paused
    if (school.status === 'paused') {
      return res.status(403).render('school-login', { 
        title: 'School Login', 
        error: null,
        subscriptionError: {
          type: 'paused',
          schoolName: school.name,
          message: 'Your account has been paused. Please renew your subscription to continue.'
        }
      });
    }

    req.session.schoolUser = { 
      id: school._id, 
      email: school.email, 
      location: school.location, 
      name: school.name,
      genderFilter: school.genderFilter || 'all'
    };
    return res.redirect('/school/dashboard');
  } catch (error) {
    console.error('School login error:', error);
    return res.status(500).render('school-login', { title: 'School Login', error: 'Error logging in', subscriptionError: null });
  }
};

// Logout school
exports.logout = (req, res) => {
  req.session.schoolUser = null;
  res.redirect('/school/login');
};

// Dashboard overview for school (stats only)
exports.getDashboard = async (req, res) => {
  try {
    const { location, genderFilter } = req.session.schoolUser;

    // Build query based on gender filter
    const baseQuery = { preferredLocation: location };
    if (genderFilter && genderFilter !== 'all') {
      baseQuery.gender = genderFilter;
    }

    // Stats for this location only (with gender filter)
    const totalApplicants = await Applicant.countDocuments(baseQuery);
    const byStatus = await Applicant.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const avgSalary = await Applicant.aggregate([
      { $match: baseQuery },
      { $group: { _id: null, average: { $avg: '$expectedSalary' } } }
    ]);
    const byQualification = await Applicant.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$highestQualification', count: { $sum: 1 } } }
    ]);
    const genders = await Applicant.distinct('gender', baseQuery);

    const topQual = byQualification.length > 0
      ? byQualification.reduce((prev, current) => (prev.count > current.count ? prev : current))._id
      : 'N/A';

    // Fetch recent applicants for activity feed
    const recentApplicants = await Applicant.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const stats = {
      total: totalApplicants,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id || 'pending'] = item.count;
        return acc;
      }, {}),
      avgSalary: (avgSalary && avgSalary[0] && avgSalary[0].average) || 0,
      topQualification: topQual
    };

    res.render('school-dashboard-saas', {
      title: 'School Dashboard - ' + (req.session.schoolUser && req.session.schoolUser.name ? req.session.schoolUser.name : location),
      stats,
      location,
      schoolName: (req.session.schoolUser && req.session.schoolUser.name) || '',
      recentApplicants
    });
  } catch (error) {
    console.error('Error fetching school dashboard:', error);
    res.status(500).render('school-dashboard-saas', {
      title: 'School Dashboard',
      error: 'Error loading dashboard',
      stats: {},
      location: (req.session.schoolUser && req.session.schoolUser.location) || '',
      recentApplicants: []
    });
  }
};

// Applicants view with filters for school location
exports.getApplicantsForSchool = async (req, res) => {
  try {
    const { location, genderFilter } = req.session.schoolUser;
    const filterStatus = req.query.status || '';
    const filterGender = req.query.gender || '';
    const searchTerm = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Build base query with location and gender filter
    const baseQuery = { preferredLocation: location };
    if (genderFilter && genderFilter !== 'all') {
      baseQuery.gender = genderFilter;
    }

    let query = Applicant.find(baseQuery);

    if (filterStatus) {
      query = query.where('status').equals(filterStatus);
    }

    if (filterGender) {
      query = query.where('gender').equals(filterGender);
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
      .sort({ rating: -1, createdAt: -1 }) // Sort by rating descending, then by creation date
      .skip(skip)
      .limit(limit)
      .exec();

    // For filtered stats, use the same filter as the list
    const byStatus = await Applicant.aggregate([
      { $match: query.getFilter() },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const avgSalary = await Applicant.aggregate([
      { $match: query.getFilter() },
      { $group: { _id: null, average: { $avg: '$expectedSalary' } } }
    ]);
    const byQualification = await Applicant.aggregate([
      { $match: query.getFilter() },
      { $group: { _id: '$highestQualification', count: { $sum: 1 } } }
    ]);
    const genders = await Applicant.distinct('gender', query.getFilter());

    const topQual = byQualification.length > 0
      ? byQualification.reduce((prev, current) => (prev.count > current.count ? prev : current))._id
      : 'N/A';

    const stats = {
      total: totalCount,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id || 'pending'] = item.count;
        return acc;
      }, {}),
      avgSalary: (avgSalary && avgSalary[0] && avgSalary[0].average) || 0,
      topQualification: topQual
    };

    res.render('school-applicants-saas', {
      title: 'Applicants - ' + location,
      stats,
      location,
      applicants,
      genders: genders.filter(Boolean),
      currentGender: filterGender,
      currentStatus: filterStatus,
      searchTerm,
      currentPage: page,
      totalPages,
      showList: true
    });
  } catch (error) {
    console.error('Error fetching school applicants:', error);
    res.status(500).render('school-dashboard', {
      title: 'Applicants',
      error: 'Error loading applicants',
      stats: {},
      location: (req.session.schoolUser && req.session.schoolUser.location) || '',
      applicants: [],
      genders: [],
      currentGender: '',
      currentStatus: '',
      searchTerm: '',
      totalPages: 1,
      currentPage: 1,
      showList: true
    });
  }
};
