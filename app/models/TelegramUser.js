const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TelegramUserSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: false
  },
  first_name: {
    type: String,
    required: false,
    unique: false
  },
  last_name: {
    type: String,
    required: false,
    unique: false
  },
  phone: {
    type: Number,
    required: false,
    unique: false
  },
  is_receive_news: {
    type: Boolean,
    default: 1
  }
});

const TelegramUserModel = mongoose.model('telegram-users', TelegramUserSchema);

module.exports = TelegramUserModel;