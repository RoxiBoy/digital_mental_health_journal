const MoodSurvey = require('../models/MoodSurvey')
const mongoose = require('mongoose')

const createMoodSurvey = async (req, res) => {
  try {
    const { userId, period, depressionScore, anxietyScore, wellBeingScore, emotionalRegulationScore } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const survey = await MoodSurvey.create({
      userId,
      period,
      depressionScore,
      anxietyScore,
      wellBeingScore,
      emotionalRegulationScore,
    })

    res.status(201).json({
      message: 'Mood survey submitted successfully',
      survey,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getUserMoodSurveys = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const surveys = await MoodSurvey.find({ userId }).sort({ createdAt: -1 })

    res.json({
      count: surveys.length,
      surveys,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getMoodSurveyById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid survey ID' })
    }

    const survey = await MoodSurvey.findById(id)
    if (!survey) return res.status(404).json({ message: 'Survey not found' })

    res.json(survey)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteMoodSurvey = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid survey ID' })
    }

    const deleted = await MoodSurvey.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Survey not found' })

    res.json({ message: 'Survey deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  createMoodSurvey,
  getUserMoodSurveys,
  getMoodSurveyById,
  deleteMoodSurvey,
}
