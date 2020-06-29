const express = require('express');
const router = express.Router();
const axios = require('axios')
const TelegramUserModel = require('../models/TelegramUser');

router.get('/getListTelegramUser', (req, res) => {
  // console.log(req);
  var is_have_data = false;
  TelegramUserModel.find({}, function (err, result) { })
    .then(datas => {
      if (datas.length > 0) {
        let response = {
          message: "Get list telegram user successfully!",
          data: datas,
          count: datas.length
          // token: req.query.secret_token
        }
        console.log(response)
        res.send(response);
      }

    })
    .catch(err => res.status(200).json({
      message: "Get list telegram user successfully!",
      data: [],
      count: 0
      // token: req.query.secret_token

    }));
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