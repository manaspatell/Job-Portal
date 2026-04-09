// Middleware to protect school routes
const School = require('../models/School');

// Function to check and pause expired subscriptions
const checkAndPauseExpiredSubscriptions = async (schoolId) => {
  try {
    const school = await School.findById(schoolId);
    
    if (!school) {
      return { expired: false };
    }

    // Check if school has no subscription or subscription is 'none'
    if (!school.subscription || !school.subscription.tier || school.subscription.tier === 'none') {
      return { noSubscription: true };
    }

    // Check if subscription has expired
    if (school.subscription.endDate && new Date() > school.subscription.endDate) {
      // Store last subscription info before pausing
      if (school.subscription.tier && school.subscription.tier !== 'none') {
        school.lastSubscription = {
          tier: school.subscription.tier,
          endDate: school.subscription.endDate,
          status: 'expired'
        };
      }
      // Subscription has expired - pause the account
      if (school.status !== 'paused') {
        school.status = 'paused';
        school.subscription.status = 'expired';
        await school.save();
      }
      return { expired: true, endDate: school.subscription.endDate };
    }
    
    return { expired: false };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { expired: false };
  }
};

module.exports = async (req, res, next) => {
  if (req.session && req.session.schoolUser) {
    try {
      // Check if subscription has expired and pause if needed
      const result = await checkAndPauseExpiredSubscriptions(req.session.schoolUser.id);
      
      if (result.noSubscription) {
        // No subscription - clear session and redirect to login
        req.session.schoolUser = null;
        return res.status(403).render('school-login', {
          title: 'School Login',
          error: 'No active subscription found. Please contact admin to activate your subscription.'
        });
      }

      if (result.expired) {
        // Subscription expired - clear session and redirect to login
        req.session.schoolUser = null;
        return res.status(403).render('school-login', {
          title: 'School Login',
          error: `Your subscription expired on ${new Date(result.endDate).toLocaleDateString()}. Your account has been paused. Please contact admin to renew.`
        });
      }

      // Check if school is paused (either manually or by system)
      const school = await School.findById(req.session.schoolUser.id);
      if (school && school.status === 'paused') {
        req.session.schoolUser = null;
        return res.status(403).render('school-login', {
          title: 'School Login',
          error: 'Your account has been paused. Please contact admin.'
        });
      }

      return next();
    } catch (error) {
      console.error('Error in school auth middleware:', error);
      return next();
    }
  }
  return res.redirect('/school/login');
};
