const Applicant = require('../models/Applicant');

// Render apply form page
exports.renderApplyForm = (req, res) => {
  res.render('apply', { title: 'Job Application Form' });
};

// Handle form submission and save to database
const { calculateApplicantRating } = require('../utils/applicantRating');

// Handle application submission (with paid flow)
exports.submitApplication = async (req, res) => {
    // Debug log to inspect req.file
    console.log('DEBUG req.file:', req.file);
  try {
    const {
      name,
      email,
      phone,
      gender,
      state,
      city,
      highestQualification,
      collegeName,
      collegeTier,
      skills,
      preferredLocation,
      expectedSalary,
      isPaid
    } = req.body;

    // Check for duplicate by email or phone
    const duplicate = await Applicant.findOne({
      $or: [
        { email: email ? email.trim() : '' },
        { phone: phone ? phone.trim() : '' }
      ]
    });
    if (duplicate) {
      return res.status(400).render('apply', {
        title: 'Job Application Form',
        duplicate: true,
        duplicateEmail: email ? email.trim() : '',
        duplicatePhone: phone ? phone.trim() : ''
      });
    }
    // Calculate system-generated rating
    const rating = await calculateApplicantRating({
      collegeTier: collegeTier ? collegeTier.trim() : '',
      skills: skills ? skills.trim() : '',
      cvPath: req.file ? ('uploads/cvs/' + req.file.filename) : null
    });

    // If paid, redirect to payment page after saving initial data
    if (isPaid === 'on' || isPaid === true || isPaid === 'true' || isPaid === true) {
      // Save applicant with isPaid: true, paymentStatus: 'pending', no paymentProof yet
        const applicant = new Applicant({
          name: name.trim(),
          email: email ? email.trim() : '',
          phone: phone ? phone.trim() : '',
          gender: gender ? gender.trim() : '',
          state: state ? state.trim() : '',
          city: city ? city.trim() : '',
          highestQualification: highestQualification ? highestQualification.trim() : '',
          cvPath: req.file ? ('uploads/cvs/' + req.file.filename) : null,
          collegeTier: collegeTier ? collegeTier.trim() : '',
          skills: skills ? skills.trim() : '',
          preferredLocation: preferredLocation ? preferredLocation.trim() : '',
          expectedSalary: expectedSalary ? parseInt(expectedSalary) : 0,
          rating: rating,
          isPaid: true,
          paymentStatus: 'pending',
          paymentProof: '',
        });
      await applicant.save();
      // Redirect to payment page with applicant id
      return res.redirect(`/apply/payment/${applicant._id}`);
    }

    // Free application
    const applicant = new Applicant({
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      gender: gender ? gender.trim() : '',
      state: state ? state.trim() : '',
      city: city ? city.trim() : '',
      highestQualification: highestQualification ? highestQualification.trim() : '',
      cvPath: req.file ? ('uploads/cvs/' + req.file.filename) : null,
      collegeTier: collegeTier ? collegeTier.trim() : '',
      skills: skills ? skills.trim() : '',
      preferredLocation: preferredLocation ? preferredLocation.trim() : '',
      expectedSalary: expectedSalary ? parseInt(expectedSalary) : 0,
      rating: rating,
      isPaid: false,
      paymentStatus: 'not-required',
      paymentProof: '',
    });
    await applicant.save();
    res.render('success', { title: 'Application Submitted' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).render('apply', {
      title: 'Job Application Form',
      error: 'Error submitting application. Please try again.'
    });
  }
};

// Render payment page for paid applicants
exports.renderPaymentPage = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant || !applicant.isPaid) {
      return res.status(404).render('error', { error: 'Applicant not found or not a paid application.' });
    }
    res.render('applicant-payment', { title: 'Complete Payment', applicant });
  } catch (error) {
    res.status(500).render('error', { error: 'Error loading payment page.' });
  }
};

// Handle payment proof upload for paid applicants
exports.submitPaymentProof = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant || !applicant.isPaid) {
      return res.status(404).render('error', { error: 'Applicant not found or not a paid application.' });
    }
    // Save payment proof file path
    if (req.file) {
      applicant.paymentProof = req.file.filename;
      applicant.paymentStatus = 'pending';
      await applicant.save();
      return res.render('verification-pending', { title: 'Payment Verification Pending' });
    } else {
      return res.status(400).render('applicant-payment', { title: 'Complete Payment', applicant, error: 'Please upload payment proof.' });
    }
  } catch (error) {
    res.status(500).render('error', { error: 'Error submitting payment proof.' });
  }
};
