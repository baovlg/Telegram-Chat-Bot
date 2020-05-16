const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
var uuid = require('uuid');

const UserSchema = new Schema({
  id: {
    type: String,
    default: uuid.v1
  },
  name: {
    type: String,
    required: true,
    unique: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true,
    unique: false
  },
  role: {
    type: String,
    default: 'admin'
  }
});

UserSchema.pre('save', async function (next) {
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
}

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;