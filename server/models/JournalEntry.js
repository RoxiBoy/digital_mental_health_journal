const mongoose = require('mongoose')

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentiment: {
    type: String,  
  },
  emotion: {
    type: String, 
  },
  sentimentScore: {
    type: Number, 
  },
  moodRating: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  typingSpeed: {
    type: Number,
  },
  wordCount: {
    type: Number,
  },
})

module.exports = mongoose.model('JournalEntry', journalEntrySchema)
