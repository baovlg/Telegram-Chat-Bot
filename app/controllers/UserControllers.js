const User = require('../models/User')
const bcrypt = require('bcrypt')

exports.register = function (req, res, next) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user == null) {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) { return next(err); }
        const user = new User(req.body)
        user.role = ['customer']
        user.password = hash;
        user.password_confirm = hash;
        user.save((err, result) => {
          if (err) { return res.json({ err }) }
          res.json({ user: result })
        })
      })
    } else {
      res.json({ err: 'Email has been used' })
    }
  })
}