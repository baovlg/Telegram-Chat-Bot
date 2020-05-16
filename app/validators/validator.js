const User = require('../models/User')

exports.UserValidator = function (req, res, next) {
  req.check('email', 'Invalid email.').isEmail();
  req.check('email', 'Email is required.').notEmpty();
  req.check('username', 'Username is required.').notEmpty();
  req.check('username', 'Username must be more than 1 characters').isLength({ min: 2 });
  req.check('password', 'Password is required.').notEmpty();
  req.check('password', 'Password must be more than 6 characters').isLength({ min: 6 });
  req.check('password_confirm', 'Password confirm is required.').notEmpty();
  req.check('password_confirm', 'Password mismatch').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  next();
}