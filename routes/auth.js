const express = require('express');
const { AuthError } = require('../lib/auth/errors');
const {
  validateSignupInput,
  validateLoginInput
} = require('../lib/auth/validation');
const { redirectIfAuthenticated } = require('../lib/auth/middleware');

const router = express.Router();

function renderAuthPage(res, view, data = {}, statusCode = 200) {
  return res.status(statusCode).render(view, data);
}

router.get('/login', redirectIfAuthenticated, (req, res) => {
  renderAuthPage(res, 'login');
});

router.post('/login', redirectIfAuthenticated, async (req, res, next) => {
  const { error, value } = validateLoginInput(req.body);

  if (error) {
    return renderAuthPage(res, 'login', {
      error,
      email: req.body.email
    }, 400);
  }

  try {
    const user = await req.app.locals.db.authenticateUser(value);
    if (!user) {
      return renderAuthPage(res, 'login', {
        error: 'Invalid email or password.',
        email: value.email
      }, 401);
    }

    req.session.user = user;
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
});

router.get('/signup', redirectIfAuthenticated, (req, res) => {
  renderAuthPage(res, 'signup');
});

router.post('/signup', redirectIfAuthenticated, async (req, res, next) => {
  const { error, value } = validateSignupInput(req.body);

  if (error) {
    return renderAuthPage(res, 'signup', {
      error,
      email: req.body.email
    }, 400);
  }

  try {
    const user = await req.app.locals.db.registerUser(value);
    req.session.user = user;
    return res.redirect('/');
  } catch (err) {
    if (err instanceof AuthError) {
      return renderAuthPage(res, 'signup', {
        error: err.message,
        email: value.email
      }, err.statusCode);
    }

    return next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }

    res.clearCookie('connect.sid');
    return res.redirect('/login');
  });
});

module.exports = router;
