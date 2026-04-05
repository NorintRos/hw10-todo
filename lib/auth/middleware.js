function requireAuth(req, res, next) {
  if (res.locals.currentUser) {
    return next();
  }

  return res.redirect('/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (res.locals.currentUser) {
    return res.redirect('/');
  }

  return next();
}

module.exports = {
  requireAuth,
  redirectIfAuthenticated
};
