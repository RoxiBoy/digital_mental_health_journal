const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  journalEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry',
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  feedbackType: {
    type: String, 
  },
  ruleTriggered: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Feedback', feedbackSchema)
