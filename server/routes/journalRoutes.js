const express = require('express')

const { createJournalEntry, deleteJournalEntry, getJournalById, getUserJournals, getJournalAnalytics} = require('../controllers/journalController')

const router = express.Router()

router.post('/', createJournalEntry)
router.get('/:userId', getUserJournals)
router.get('/entry/:id', getJournalById)
router.delete('/:id', deleteJournalEntry)
router.get('/analytics/:userId', getJournalAnalytics)

module.exports = router
