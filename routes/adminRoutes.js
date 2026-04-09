
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Paid applicants payment rejection
router.post('/paid-applicants/:id/reject', authMiddleware, adminController.rejectApplicantPayment);

// Paid applicants payment verification
router.get('/paid-applicants', authMiddleware, adminController.getPaidApplicants);
router.post('/paid-applicants/:id/verify', authMiddleware, adminController.verifyApplicantPayment);
// Utility: Set rating 5 for all paid applicants
router.post('/applicants/set-paid-rating', authMiddleware, adminController.setPaidApplicantsRating);
// GET: Applicants status report
router.get('/report', authMiddleware, adminController.getApplicantsReport);

// GET: Render login page
router.get('/login', adminController.renderLoginPage);

// POST: Handle admin login
router.post('/login', adminController.loginAdmin);

// GET: Admin dashboard (overview)
router.get('/dashboard', authMiddleware, adminController.getDashboard);

// GET: Applicants list with filters
router.get('/applicants', authMiddleware, adminController.getApplicantsPage);
// Infinite scroll JSON route removed

// GET/POST: Create school credentials
router.get('/credentials/create', authMiddleware, adminController.renderCredentialForm);
router.post('/credentials/create', authMiddleware, adminController.createCredential);

// GET: Manage school credentials (list all)
router.get('/credentials', authMiddleware, adminController.manageCredentials);

// POST: Edit school credential
router.post('/credentials/edit/:id', authMiddleware, adminController.editCredential);

// POST: Delete school credential
router.post('/credentials/delete/:id', authMiddleware, adminController.deleteCredential);

// POST: Toggle school credential status (active/paused)
router.post('/credentials/toggle/:id', authMiddleware, adminController.toggleCredentialStatus);

// GET: Applicant detail view
router.get('/applicant/:id', authMiddleware, adminController.getApplicantDetail);

// POST: Update applicant status
router.post('/applicant/:id/status', authMiddleware, adminController.updateStatus);

// POST: Update rating
router.post('/applicant/:id/rating', authMiddleware, adminController.updateRating);

// POST: Add tags
router.post('/applicant/:id/tags', authMiddleware, adminController.addTags);

// POST: Add notes
router.post('/applicant/:id/notes', authMiddleware, adminController.addNotes);

// GET: Subscriptions management
router.get('/subscriptions', authMiddleware, adminController.getSubscriptions);

// POST: Upgrade subscription tier
router.post('/subscriptions/upgrade/:id', authMiddleware, adminController.upgradeSubscription);

// POST: Renew subscription
router.post('/subscriptions/renew/:id', authMiddleware, adminController.renewSubscription);

// POST: Cancel subscription
router.post('/subscriptions/cancel/:id', authMiddleware, adminController.cancelSubscription);

// Subscription pricing management
router.get('/subscription-pricing', authMiddleware, adminController.getSubscriptionPricingPage);
router.post('/subscription-pricing/update', authMiddleware, adminController.updateSubscriptionPricing);

// Payments management
router.get('/payments', authMiddleware, adminController.getPaymentsPage);
router.post('/payments/:id/approve', authMiddleware, adminController.approvePayment);
router.post('/payments/create-credentials', authMiddleware, adminController.createCredentialsFromPayment);


// DELETE: Delete payment
router.delete('/payments/:id/delete', authMiddleware, adminController.deletePayment);

// DELETE: Delete applicant
router.delete('/applicant/:id', authMiddleware, adminController.deleteApplicant);

// POST: Bulk delete
router.post('/bulk-delete', authMiddleware, adminController.bulkDelete);

// POST: Bulk status update
router.post('/bulk-status', authMiddleware, adminController.bulkStatusUpdate);

// GET: Export to CSV
router.get('/export/csv', authMiddleware, adminController.exportToCSV);

// GET: Shortlisted candidates
router.get('/shortlisted', authMiddleware, adminController.getShortlisted);

// GET: Logout
router.get('/logout', authMiddleware, adminController.logoutAdmin);

module.exports = router;
