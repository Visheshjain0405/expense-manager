import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'
import { seedDefaultCategories } from '../utils/categorySeeder.js'
import { seedDefaultAccounts } from '../utils/accountSeeder.js'

export const createUser = async (req, res) => {
  try {
    let { name, email, password } = req.body

    // Simple manual body validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters.',
      })
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      })
    }

    // Clean email address
    email = email.trim().toLowerCase()
    
    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 8 characters.',
      })
    }

    // Check for duplicate email
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      })
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password,
    })

    // Seed default categories and accounts
    await seedDefaultCategories(user.id)
    await seedDefaultAccounts(user.id)

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(`Error in createUser: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error during user creation.',
    })
  }
}

export const login = async (req, res) => {
  try {
    let { email, password } = req.body

    // Validate email and password presence
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      })
    }

    email = email.trim().toLowerCase()

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      })
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      })
    }

    // Find the user, explicitly requesting password field (since pre-save hashes and we exclude it by default in transforms)
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Generate JWT token
    const token = generateToken(user.id)

    // Seed default categories and accounts for existing user accounts if missing
    await seedDefaultCategories(user.id)
    await seedDefaultAccounts(user.id)

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(`Error in login: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Seed default categories and accounts for existing user accounts if missing
    await seedDefaultCategories(user.id)
    await seedDefaultAccounts(user.id)

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(`Error in getMe: ${error.message}`)
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user data.',
    })
  }
}
