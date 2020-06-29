const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
  text: {
    type: String,
    required: false,
    unique: false
  }
},
  {
    timestamps: true
  });

const NewsModel = mongoose.model('news', NewsSchema);

module.exports = NewsModel;