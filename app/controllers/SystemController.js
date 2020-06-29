const express = require('express');
const router = express.Router();
const nodeXlsx = require('node-xlsx');
const TelegramUserModel = require('../models/TelegramUser');
const MessageModel = require('../models/Message');
const axios = require('axios')

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

// Khi client truy cập router này thì server sẽ export ngay file excel xuống client
router.get('/exportDownload', function (req, res) {
  let dataExcel = [];
  MessageModel.find({}, { '_id': 0, 'text': 1, 'createdAt': 1, 'is_bot': 1 }, {}).populate('telegram_user', { '_id': 0, 'first_name': 1 })
    .then(datas => {
      // console.log(datas)
      datas = formatData(datas);
      // console.log(datas)

      // Lay du lieu header cho file excel <=> lay cac key name trong collection
      let arrHeaderTitle = [];

      Object.keys(datas[0]).forEach(key => {
        arrHeaderTitle.push(key);
      });

      dataExcel.push(arrHeaderTitle);  // push header vao mang dataExcel

      // Lay du lieu cac row tuong ung voi header <=> lay cac value tuong ung voi key name o tren
      for (let item of datas) {
        let rowItemValue = [];
        Object.keys(item).forEach(key => {
          rowItemValue.push(item[key]);
        });
        dataExcel.push(rowItemValue); // push tung dong value vao mang dataExcel
      }

      let buffer = nodeXlsx.build([{ name: "List User", data: dataExcel }]); // Returns a buffer
      res.attachment('message-database.xlsx');
      res.send(buffer);
    })
    .catch(err => res.status(400).json(err));
});

//////////////////////////////////////////////////////////
router.post('/exportDownloadById', function (req, res) {
  let dataExcel = [];
  if (req.query.id != undefined) {
    MessageModel.find({ telegram_user: req.query.id }, { '_id': 0, 'text': 1, 'createdAt': 1, 'is_bot': 1 }, {}).populate('telegram_user', { '_id': 0, 'first_name': 1 })
      .then(datas => {
        // console.log(datas)
        datas = formatData(datas);
        console.log(datas)

        // Lay du lieu header cho file excel <=> lay cac key name trong collection
        let arrHeaderTitle = [];

        Object.keys(datas[0]).forEach(key => {
          arrHeaderTitle.push(key);
        });

        dataExcel.push(arrHeaderTitle);  // push header vao mang dataExcel

        // Lay du lieu cac row tuong ung voi header <=> lay cac value tuong ung voi key name o tren
        for (let item of datas) {
          let rowItemValue = [];
          Object.keys(item).forEach(key => {
            rowItemValue.push(item[key]);
          });
          dataExcel.push(rowItemValue); // push tung dong value vao mang dataExcel
        }

        let buffer = nodeXlsx.build([{ name: "List User", data: dataExcel }]); // Returns a buffer
        res.attachment('message-database.xlsx');
        res.send(buffer);
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