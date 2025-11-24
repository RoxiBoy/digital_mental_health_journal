const mongoose = require('mongoose')

const moodSurveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  period: {
    type: String,
  },
  depressionScore: Number,
  anxietyScore: Number,
  wellBeingScore: Number,
  emotionalRegulationScore: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('MoodSurvey', moodSurveySchema)
