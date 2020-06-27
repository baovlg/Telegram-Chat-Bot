const express = require('express');
const router = express.Router();
const TelegramUserModel = require('../models/TelegramUser');
const token = process.env.TELEGRAM_TOKEN;
const uuid = require('uuid');
const sessionId = uuid.v4();
const TelegramBot = require('node-telegram-bot-api');
let bot;

if (process.env.NODE_ENV !== 'stagging') {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new TelegramBot(token, { polling: true });
}

router.post('/sendNews', (req, res, next) => {
  // console.log(req);
  TelegramUserModel.findOne({ is_receive_news: true }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) {
        for (const key in result) {
          bot.sendMessage(
            key.uid,
            'Xin chào ' + msg.from.first_name + ', tôi có thể giúp gì cho bạn?',
          )
        }
      }
    }
  });

  res.status(200).json({
    message: 'I am here' + ' - ' + req.query.message,
    // user: req.user,
    token: req.query.secret_token
  });

});

module.exports = router;