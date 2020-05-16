const express = require('express');
const router = express.Router();

router.get('/profile', (req, res, next) => {
  res.status(200).res.json({
    message: 'I did it.',
    user: req.user,
    token: req.query.secret_token
  })
});

module.exports = router;