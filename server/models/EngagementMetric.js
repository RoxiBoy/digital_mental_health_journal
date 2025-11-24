const mongoose = require('mongoose')

const engagementMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionDate: {
    type: Date,
    default: Date.now,
  },
  entriesWritten: {
    type: Number,
    default: 0,
  },
  avgEntryLength: {
    type: Number,
  },
  timeSpent: {
    type: Number,
  },
  appOpens: {
    type: Number,
  },
})

module.exports = mongoose.model('EngagementMetric', engagementMetricSchema)
