exports.ensureLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
};

exports.ensureAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login');
};