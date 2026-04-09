const express = require('express');
const router = express.Router();
const Applicant = require('../models/Applicant');
const applicantController = require('../controllers/applicantController');
const upload = require('../middleware/upload');

// POST: Withdraw application by email or phone
router.post('/withdraw-application', async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).render('apply', { title: 'Job Application Form', error: 'No email or phone provided.' });
  }
  const result = await Applicant.deleteOne({
    $or: [
      { email: email ? email.trim() : '' },
      { phone: phone ? phone.trim() : '' }
    ]
  });
  if (result.deletedCount > 0) {
    return res.render('apply', { title: 'Job Application Form', error: 'Your application has been withdrawn. You may now apply again.' });
  } else {
    return res.render('apply', { title: 'Job Application Form', error: 'No application found to withdraw.' });
  }
});
// GET: Render apply form
router.get('/apply', applicantController.renderApplyForm);

// POST: Handle form submission with file upload
router.post('/apply', upload.single('cv'), applicantController.submitApplication);


// Paid application payment page
router.get('/apply/payment/:id', applicantController.renderPaymentPage);
// Paid application payment proof upload
const uploadPaymentProof = require('../middleware/uploadPaymentProof');
router.post('/apply/payment/:id', uploadPaymentProof.single('paymentProof'), applicantController.submitPaymentProof);

module.exports = router;
