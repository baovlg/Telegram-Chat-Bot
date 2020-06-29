const express = require('express');
const router = express.Router();
const axios = require('axios')
const TelegramUserModel = require('../models/TelegramUser');
const MessageModel = require('../models/Message');

router.get('/getListTelegramUser', (req, res) => {
  // console.log(req);
  TelegramUserModel.find({}, function (err, result) { })
    .then(datas => {
      if (datas.length > 0) {
        let response = {
          message: "Get list telegram user successfully!",
          data: datas,
          count: datas.length
          // token: req.query.secret_token
        }
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

router.post('/sendMessageById', (req, res) => {
  if (req.query.id != undefined) {
    TelegramUserModel.find({ _id: req.query.id }, function (err, result) { })
      .then(datas => {
        console.log(datas)
        if (datas.length > 0) {
          axios
            .post(
              'https://api.telegram.org/bot1239970044:AAFG7aUPL5i9lPMMCk-m2_pkiOdjemZMs3I/sendMessage',
              {
                chat_id: datas[0].uid,
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

          let mess = new MessageModel({
            telegram_user: req.query.id,
            text: req.query.message,
            is_bot: true
          });

          mess.save(function (err) {
            if (err) console.log(err)
          }
            // .catch(error => {
            //   console.log(error);
            // })
          );

          let response = {
            message: "Send message successfully!",
            data: datas
            // token: req.query.secret_token
          }
          res.send(response);
        }

      })
      .catch(err => res.status(400).json(err));

  } else {
    res.status(400).json({
      message: "id not find",
      // user: req.user,
      // token: req.query.secret_token
    });
  }
});

router.post('/historyMessageById', (req, res) => {
  if (req.query.id != undefined) {
    MessageModel.find({ telegram_user: req.query.id }, { '_id': 0, 'text': 1, 'createdAt': 1, 'is_bot': 1 }, {}).populate('telegram_user', { '_id': 0, 'first_name': 1 })
      .then(datas => {
        // console.log(datas)
        if (datas.length > 0) {
          datas = formatData(datas);
          let response = {
            message: "Get history message successfully!",
            data: datas
            // token: req.query.secret_token
          }
          res.send(response);
        }

      })
      .catch(err => res.status(400).json(err));

  } else {
    res.status(400).json({
      message: "id not find",
      // user: req.user,
      // token: req.query.secret_token
    });
  }
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