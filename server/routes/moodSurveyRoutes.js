const express = require('express')
const { createMoodSurvey, getUserMoodSurveys, getMoodSurveyById, deleteMoodSurvey } = require('../controllers/moodSurveyController')

const router = express.Router()

router.post('/', createMoodSurvey)
router.get('/:userId', getUserMoodSurveys)
router.get('/entry/:id', getMoodSurveyById)
router.delete('/:id', deleteMoodSurvey)

module.exports = router



