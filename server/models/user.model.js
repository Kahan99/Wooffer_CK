const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,     // base64 data URL, stored per user in DB
    default: '',
  },
  role: {
    type: String,
    enum: ['developer', 'admin'],
    default: 'developer',
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;