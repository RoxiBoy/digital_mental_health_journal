const express = require('express')
const { createOrUpdateEngagement, getUserEngagement } = require('../controllers/engagementController')
const router = express.Router()

router.post('/', createOrUpdateEngagement)
router.get('/:userId', getUserEngagement)

module.exports = router
