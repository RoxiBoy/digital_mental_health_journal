const Feedback = require('../models/Feedback')
const JournalEntry = require('../models/JournalEntry')
const mongoose = require('mongoose')
const axios = require('axios')

const createFeedback = async (req, res) => {
  try {
    const { userId, journalEntryId } = req.body;

    if (!userId || !journalEntryId) {
      return res.status(400).json({ message: 'userId and journalEntryId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(journalEntryId)) {
      return res.status(400).json({ message: 'Invalid userId or journalEntryId' });
    }

    const journalEntry = await JournalEntry.findById(journalEntryId);
    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const journalText = journalEntry.content;

    const sentimentResponse = await axios.post('http://localhost:8001/analysis/analyze', {
      content: journalText
    });

    const { sentiment, emotion, sentimentScore } = sentimentResponse.data;

    const feedbackResponse = await axios.post('http://localhost:8001/feedback/generate', {
      content: journalText,
      sentiment,
      emotion,
      sentimentScore
    });

    const { feedbackText, feedbackType, ruleTriggered } = feedbackResponse.data;

    const feedback = await Feedback.create({
      userId,
      journalEntryId,
      feedbackText,
      feedbackType,
      ruleTriggered
    });

    res.status(201).json({
      message: 'Feedback created successfully',
      feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedbackByJournal = async (req, res) => {
  try {
    const { journalEntryId } = req.params

    if (!mongoose.Types.ObjectId.isValid(journalEntryId)) {
      return res.status(400).json({ message: 'Invalid journalEntryId' })
    }

    const feedbacks = await Feedback.find({ journalEntryId }).sort({ createdAt: -1 })

    res.json({
      count: feedbacks.length,
      feedbacks,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid feedback ID' })
    }

    const deleted = await Feedback.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Feedback not found' })

    res.json({ message: 'Feedback deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  createFeedback,
  getFeedbackByJournal,
  deleteFeedback,
}
