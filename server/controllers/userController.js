const bcrypt = require('bcryptjs')
const User = require('../models/User')

const generateToken = require('../utils/generateToken')
const { models } = require('mongoose')

const assignGroup = () => {
  return Math.random() < 0.5 ? 'adaptive' : 'control'
}

const registerUser = async (req, res) => {
  console.log('REGISTER USER HIT')
  try {
    const { email, password, displayName, consentGiven } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const group = assignGroup()

    const user = await User.create({
      email,
      passwordHash,
      displayName,
      consentGiven,
      group,
    })

    res.status(201).json({
      _id: user._id,
      email: user.email,
      group: user.group,
      token: generateToken(user._id),
    })

    console.log(`Successfully signed up, New user${displayName}`)
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log("Login request body:", req.body)

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    res.json({
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      group: user.group,
      token: generateToken(user._id),
    })

    console.log(`Successfully logged for user: ${user.displayName}`)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { registerUser, loginUser }

