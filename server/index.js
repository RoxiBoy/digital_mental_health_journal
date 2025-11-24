const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

const connect_db = require('./config/db')

// routes imports
const userRoutes = require('./routes/userRoutes')
const journalRoutes = require('./routes/journalRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const engagementRoutes = require('./routes/engagementRoutes')
const moodSurveyRoutes = require('./routes/moodSurveyRoutes')

dotenv.config()
connect_db()

const app = express()

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// routing apis
app.use('/api/users', userRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/engagement', engagementRoutes)
app.use('/api/surveys', moodSurveyRoutes)


app.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on port ${process.env.PORT || 5000}`)
})
