const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const schoolAuth = require('../middleware/schoolAuth');

router.get('/login', schoolController.renderLogin);
router.post('/login', schoolController.login);
router.get('/logout', schoolController.logout);
router.get('/dashboard', schoolAuth, schoolController.getDashboard);
router.get('/applicants', schoolAuth, schoolController.getApplicantsForSchool);

// School view applicant detail
router.get('/applicant/:id', schoolAuth, schoolController.getApplicantDetailForSchool);
// School updates applicant status
router.post('/applicant/:id/status', schoolAuth, schoolController.updateApplicantStatus);

// School settings/profile customization
const uploadLogo = require('../middleware/uploadLogo');
router.get('/settings', schoolAuth, schoolController.renderSettings);
router.post('/settings', schoolAuth, uploadLogo.single('logo'), schoolController.updateSettings);

module.exports = router;
