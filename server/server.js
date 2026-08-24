import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import accountRoutes from './routes/accountRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import recurringTransactionRoutes from './routes/recurringTransactionRoutes.js'
import netWorthRoutes from './routes/netWorthRoutes.js'
import savingsGoalRoutes from './routes/savingsGoalRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import { runDatabaseMigration } from './utils/migration.js'
import cron from 'node-cron'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { errorHandler } from './middleware/errorHandler.js'
import { processRecurringTransactions } from './services/recurringTransactionService.js'
import { runNetWorthSnapshotJob } from './services/netWorthService.js'

// Load environment variables
dotenv.config()

const app = express()

// Middlewares
app.use(helmet())

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://expense-manager-one-rust.vercel.app'
]

if (process.env.CLIENT_URL) {
  allowedOrigins.push(...process.env.CLIENT_URL.split(',').map(o => o.trim()))
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())

// Rate limiting for sensitive operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
})
app.use('/api/auth/login', authLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/recurring-transactions', recurringTransactionRoutes)
app.use('/api/net-worth', netWorthRoutes)
app.use('/api/savings-goals', savingsGoalRoutes)
app.use('/api/reports', reportRoutes)

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy'
  })
})

const PORT = process.env.PORT || 5000

// Connect to MongoDB and then start server
const startServer = async () => {
  try {
    await connectDB()
    // Run database migrations for categories mapping
    await runDatabaseMigration()

    // Trigger missed recurring schedules check on boot
    await processRecurringTransactions()

    // Trigger net worth snapshots check on boot
    await runNetWorthSnapshotJob()

    // Setup hourly cron scheduler for recurring templates
    cron.schedule('0 * * * *', () => {
      processRecurringTransactions()
    })

    // Setup daily cron scheduler for net worth snapshots (at 1:00 AM)
    cron.schedule('0 1 * * *', () => {
      runNetWorthSnapshotJob()
    })

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })

    // Register central error handler (mounted last)
    app.use(errorHandler)

    const gracefulShutdown = () => {
      console.log('Received shutdown signal. Closing server resources...')
      server.close(async () => {
        console.log('HTTP server closed.')
        try {
          await mongoose.connection.close()
          console.log('MongoDB connection closed.')
          process.exit(0)
        } catch (err) {
          console.error('Error during MongoDB socket close:', err)
          process.exit(1)
        }
      })
    }
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`)
    process.exit(1)
  }
} 


startServer()
 

