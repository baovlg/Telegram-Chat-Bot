const express = require('express');
const router = express.Router();
const axios = require('axios')
const TelegramUserModel = require('../models/TelegramUser');

router.post('/sendNews', (req, res) => {
  // console.log(req);
  TelegramUserModel.find({ is_receive_news: true }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) {
        for (const key of result) {
          axios
            .post(
              'https://api.telegram.org/bot1239970044:AAFG7aUPL5i9lPMMCk-m2_pkiOdjemZMs3I/sendMessage',
              {
                chat_id: key.uid,
                text: req.query.message
              }
            )
            .then(response => {
              // We get here if the message was successfully posted
              console.log('Message posted')
              res.end('OK')
            })
            .catch(err => {
              // ...and here if it was not
              console.log('Error :', err)
              res.end('Error :' + err)
            })
        }
      }
    }
  });

  res.status(200).json({
    message: req.query.message,
    // user: req.user,
    token: req.query.secret_token
  });

});

module.exports = router;