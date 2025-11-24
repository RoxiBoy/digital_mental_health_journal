const express = require('express')
const { createFeedback, getFeedbackByJournal, deleteFeedback } = require('../controllers/feedbackController')
const router = express.Router()

router.post('/', createFeedback)
router.get('/:journalEntryId', getFeedbackByJournal)
router.delete('/:id', deleteFeedback)

module.exports = router
