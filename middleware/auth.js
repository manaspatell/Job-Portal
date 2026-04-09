// Middleware to protect admin routes
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

module.exports = authMiddleware;
