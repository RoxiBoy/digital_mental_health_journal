const EngagementMetric = require('../models/EngagementMetric')
const mongoose = require('mongoose')

const createOrUpdateEngagement = async (req, res) => {
  try {
    const { userId, entriesWritten, avgEntryLength, timeSpent, appOpens } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let metric = await EngagementMetric.findOne({ userId, sessionDate: { $gte: today } })

    if (metric) {
      metric.entriesWritten += entriesWritten || 0
      metric.avgEntryLength = avgEntryLength || metric.avgEntryLength
      metric.timeSpent += timeSpent || 0
      metric.appOpens += appOpens || 0

      await metric.save()
    } else {
      metric = await EngagementMetric.create({
        userId,
        entriesWritten: entriesWritten || 0,
        avgEntryLength: avgEntryLength || 0,
        timeSpent: timeSpent || 0,
        appOpens: appOpens || 1,
        sessionDate: new Date(),
      })
    }

    res.status(201).json({
      message: 'Engagement metrics recorded successfully',
      metric,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * @desc Get engagement metrics for a specific user
 * @route GET /api/engagement/:userId
 */
const getUserEngagement = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const metrics = await EngagementMetric.find({ userId }).sort({ sessionDate: -1 })

    res.json({
      count: metrics.length,
      metrics,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  createOrUpdateEngagement,
  getUserEngagement,
}
