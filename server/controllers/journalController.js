const JournalEntry = require('../models/JournalEntry')
const mongoose = require('mongoose')
const axios = require('axios')

const ANALYSIS_URL = 'http://127.0.0.1:8001/analyze_and_feedback'; // Adjust port if needed

const createJournalEntry = async (req, res) => {
  try {
    const { userId, content, moodRating, typingSpeed, wordCount } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and content are required' });
    }

    const analysisResponse = await axios.post(ANALYSIS_URL, {
      content: content,
    });

    const { 
      sentiment, 
      emotion, 
      sentimentScore 
    } = analysisResponse.data;

    const newEntry = await JournalEntry.create({
      userId,
      content,
      sentiment,
      emotion,
      sentimentScore,
      moodRating,
      typingSpeed,
      wordCount,
    });

    res.status(201).json({
      message: 'Journal entry created successfully with analysis',
      entry: newEntry,
    });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('Microservice Error:', err.response.data);
      return res.status(503).json({ 
        message: 'Analysis service failed to process the request.',
        details: err.response.data 
      });
    }

    console.error('Server Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserJournals = async (req, res) => {
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
