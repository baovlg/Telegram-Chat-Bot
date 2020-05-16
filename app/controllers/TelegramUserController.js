const express = require('express');
const router = express.Router();
const TelegramUserModel = require('../models/TelegramUser');

router.post('/sendNews', (req, res, next) => {
  // console.log(req);
  TelegramUserModel.findOne({ is_receive_news: true }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });

  res.status(200).json({
    message: 'I am here' + ' - ' + req.query.message,
    // user: req.user,
    token: req.query.secret_token
  });

});

module.exports = router;