const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  telegram_user: {
    type: Schema.Types.ObjectId,
    ref: 'telegram-users',
    required: true,
    unique: false
  },
  text: {
    type: String,
    required: false,
    unique: false
  },
  is_bot: {
    type: Boolean,
    default: 0
  }
},
  {
    timestamps: true
  });

const MessageModel = mongoose.model('messages', MessageSchema);

module.exports = MessageModel;