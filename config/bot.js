const token = process.env.TELEGRAM_TOKEN;
const axios = require('axios');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const sessionId = uuid.v4();
const TelegramUserModel = require('../app/models/TelegramUser');

const TelegramBot = require('node-telegram-bot-api');
let bot;

if (process.env.NODE_ENV !== 'stagging') {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new TelegramBot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

/*-------------------------------------------------------------------------------------------------------*/

// Config telegram bot
bot.onText(/\/start/, (msg, match) => {
  const chat_id = msg.chat.id;
  console.log(chat_id + " - " + msg.from.first_name);
  // console.log(msg)

  TelegramUserModel.find({ uid: chat_id }).exec(function (err, result) {
    if (result == undefined) {
      TelegramUserModel.update({ uid: chat_id }).exec(function (err, result) {
        if (!err) {
          // console.log(result)
        } else {
          console.log('Error on update!')
        }
      });
    }

    else {
      var telegram_user = new TelegramUserModel({
        uid: msg.chat.id,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name
      });

      telegram_user.save(function (err) { if (err) console.log('Error on save!') });
    };
  });

  bot.sendMessage(
    chat_id,
    'Xin chào ' + msg.from.first_name + ', tôi có thể giúp gì cho bạn?',
  )

  bot.on("polling_error", (err) => console.log(err));
});

bot.onText(/\/tracuu/, (msg) => {
  const chat_id = msg.chat.id;

  let reply_options_tracuu = {
    reply_markup: {
      'keyboard': [['1.🦠Ca bị nhiễm'], ['2.☠️Ca tử vong'], ['3.❤️Ca hồi phục']],

      resize_keyboard: true,
      one_time_keyboard: true,
      force_reply: true,
    },
  };

  bot.sendMessage(chat_id, "Chọn thông tin tra cứu", reply_options_tracuu)
  bot.on("polling_error", (err) => console.log(err));
});

bot.onText(/^([0-9])\.(.)+$/g, function (msg, match) {
  const chat_id = msg.chat.id;
  if (match[1] == undefined)
    return;
  var choose_tracuu_id = match[1];
  if (choose_tracuu_id == 1 || choose_tracuu_id == 2 || choose_tracuu_id == 3) {
    getInforAndSendMess(chat_id, choose_tracuu_id);
  } else {
    return;
  }

  bot.on("polling_error", (err) => console.log(err));
});

bot.onText(/\/tuvan/, (msg, match) => {
  const chat_id = msg.chat.id;

  let reply_options = {
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Phòng ngừa',
          callback_data: 'prevention'
        }, {
          text: 'Dấu hiệu',
          callback_data: 'expression'
        }, {
          text: 'Cách xử lý',
          callback_data: 'treatment'
        }
      ]]
    },
  };

  bot.sendMessage(chat_id, "Chọn thông tin tư vấn", reply_options)
    .then(() => {
      bot.on("callback_query", (callbackQuery) => {
        const data = callbackQuery.data;
        const opts = {
          chat_id: callbackQuery.message.chat.id,
          message_id: callbackQuery.message.message_id,
        };
        // console.log(data);
        sendMessToDialogFlow(data).then(result => {
          bot.sendMessage(opts.chat_id, result);
          bot.answerCallbackQuery(callbackQuery.id);
        })
          .catch(error => {
            bot.sendMessage(opts.chat_id, 'Not found');
            bot.answerCallbackQuery(callbackQuery.id);
          });
      });
    });
});

/*-------------------------------------------------------------------------------------------------------*/

// Config DialogFlow

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function sendMessToDialogFlow(msg, projectId = 'coronainfomationbot-xahpex') {
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: "./CoronaInfomationBot-935ebeebff88.json"
  });
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`Query: ${result.queryText}`);
  console.log(`Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`Intent: ${result.intent.displayName}`);
  } else {
    console.log(`No intent matched.`);
  }
  return result.fulfillmentText;
}

/*-------------------------------------------------------------------------------------------------------*/

function getInforAndSendMess(chat_id, choose_tracuu) {
  let url = 'https://code.junookyo.xyz/api/ncov-moh/index.php?type=vn';
  axios.get(url)
    .then(response => {
      if (response.data.success === true) {
        let data = response.data.data;
        let global = data.global;
        let vietnam = data.vietnam;
        let options_tracuu = ['cases', 'deaths', 'recovered'];
        let result = "";
        let index = choose_tracuu - 1;

        if (options_tracuu[index] === 'cases') {
          result = "Số ca nhiễm trên toàn thế giới: " +
            numberWithCommas(global.cases) + " người." + '\n' +
            "Số ca nhiễm ở Việt Nam: " + numberWithCommas(vietnam.cases) + " người.";
          bot.sendMessage(chat_id, result)
        } else if (options_tracuu[index] === 'deaths') {
          result = "Số ca tử vong trên toàn thế giới: " +
            numberWithCommas(global.deaths) + " người." + '\n' +
            "Số ca tử vong ở Việt Nam: " + numberWithCommas(vietnam.deaths) + " người.";
          bot.sendMessage(chat_id, result)
        } else if (options_tracuu[index] === 'recovered') {
          result = "Số ca hồi phục trên toàn thế giới: " +
            numberWithCommas(global.recovered) + " người." + '\n' +
            "Số ca hồi phục ở Việt Nam: " + numberWithCommas(vietnam.recovered) + " người.";
          bot.sendMessage(chat_id, result)
        }
        bot.on("polling_error", (err) => console.log(err));
        // console.log(options_tracuu[choose_tracuu]);
      } else {
        bot.sendMessage(chat_id, "Không lấy được dữ liệu từ Server!!")
        bot.on("polling_error", (err) => console.log(err));
      }
    })
    .catch(error => {
      bot.sendMessage(chat_id, "Lấy dữ liệu từ Server thất bại!!")
    });
}

function numberWithCommas(number) {
  var parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// axios.get('https://code.junookyo.xyz/api/ncov-moh/index.php?type=vn')
//   .then(response => {
//     console.log(response.data.data.global.cases);
//   })
//   .catch(error => {
//     console.log(error);
//   });

module.exports = bot;
