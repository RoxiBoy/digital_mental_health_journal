const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
  },
  consentGiven: {
    type: Boolean,
    default: false,
  },
  group: {
    type: String,
    enum: ['adaptive', 'control'], 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('User', userSchema)
