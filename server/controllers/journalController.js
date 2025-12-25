const JournalEntry = require('../models/JournalEntry')
const mongoose = require('mongoose')
const axios = require('axios')
const Feedback = require('../models/Feedback')

const ML_SERVICE_URL = 'http://localhost:8000/analyze_and_feedback';

const createJournalEntry = async (req, res) => {
  try {
    const { userId, content, moodRating, typingSpeed, wordCount } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and content are required' });
    }

    const mlResponse = await axios.post(ML_SERVICE_URL, { content });

    const { 
      emotion, 
      sentiment, 
      sentimentScore, 
      feedbackText, 
      feedbackType, 
      ruleTriggered 
    } = mlResponse.data;

    // 3. Create the Journal Entry document
    const newEntry = await JournalEntry.create({
      userId,
      content,
      sentiment,      // from ML service
      emotion,        // from ML service
      sentimentScore, // from ML service
      moodRating,
      typingSpeed,
      wordCount,
    });

    const newFeedback = await Feedback.create({
      userId,
      journalEntryId: newEntry._id, // Link to the entry we just made
      feedbackText,
      feedbackType,
      ruleTriggered
    });

    // 5. Success Response
    // We return both so the React app can display the entry and the AI feedback immediately
    res.status(201).json({
      message: 'Journal entry created and analyzed successfully',
      entry: newEntry,
      feedback: newFeedback
    });

  } catch (err) {
    // Handle specific Microservice/Ollama failures
    if (axios.isAxiosError(err)) {
      console.error('ML Microservice Error:', err.message);
      return res.status(503).json({ 
        message: 'Analysis service is unavailable. Make sure your Python server and Ollama are running.' 
      });
    }

    console.error('Database/Server Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};const getUserJournals = async (req, res) => {

  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const entries = await JournalEntry.find({ userId }).sort({ createdAt: -1 })

    res.json({
      count: entries.length,
      entries,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getJournalById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' })
    }

    const entry = await JournalEntry.findById(id)
    if (!entry) return res.status(404).json({ message: 'Entry not found' })

    res.json(entry)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' })
    }

    const deleted = await JournalEntry.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Entry not found' })

    res.json({ message: 'Journal entry deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getJournalAnalytics = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const entries = await JournalEntry.find({ userId })

    if (!entries.length) {
      return res.json({ message: 'No entries yet', analytics: {} })
    }

    const totalMood = entries.reduce((acc, e) => acc + (e.moodRating || 0), 0)
    const avgMood = totalMood / entries.length
    const totalWords = entries.reduce((acc, e) => acc + (e.wordCount || 0), 0)

    res.json({
      count: entries.length,
      avgMood,
      avgWordCount: totalWords / entries.length,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  createJournalEntry,
  getUserJournals,
  getJournalById,
  deleteJournalEntry,
  getJournalAnalytics,
}
