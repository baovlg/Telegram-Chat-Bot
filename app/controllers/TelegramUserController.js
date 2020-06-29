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
    message: "Send news successfully",
    // message: req.query.message,
    // user: req.user,
    // token: req.query.secret_token
  });

});

router.post('/getListTelegramUser', (req, res) => {
  // console.log(req);
  TelegramUserModel.find({}, function (err, result) {
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
    message: "Get list telegram user successfully!",
    // user: req.user,
    // token: req.query.secret_token
  });

});

function formatData(inputs) {
  let result = [];
  if (inputs.length > 0) {
    for (const iterator of inputs) {
      let action = iterator.is_bot == true ? "response" : "request";
      result.push({ telegram_user: iterator.telegram_user.first_name, text: iterator.text, datetime: iterator.createdAt, action: action })
    }
  }
  return result;
}

module.exports = router;