// server.js

// Imports
require('dotenv').config()
const express = require('express')                                                       
const colors = require('colors')                                   
const path = require('path')                                          
const helmet = require('helmet')  
const cors = require('cors')

// Function Imports
const connectDB = require('./config/db.js')                       
const { errorHandler } = require('./middleware/errorMiddleware.js')   

// Router Imports
const { workoutRouter } = require('./routes/workoutRoutes.js') 
const { exerciseRouter } = require('./routes/exerciseRoutes.js')       
const { userRouter } = require('./routes/userRoutes.js')              
const { questRouter } = require('./routes/questRoutes.js')
const { devRouter } = require('./routes/devRoutes.js')

// .env variables validation
const requiredEnv = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
]

const missing = requiredEnv.filter(key => !process.env[key])
if (missing.length > 0) {
	console.error(`Missing .env keys: ${missing.join(', ')}`)
	process.exit(1)
}

if (!['development','production','test'].includes(process.env.NODE_ENV)) {
	console.error(`NODE_ENV invalid: ${process.env.NODE_ENV}`)
	process.exit(1)
}

if (process.env.NODE_ENV === 'production' && !/^https?:\/\/.+/.test(process.env.FRONTEND_URL)) {
	console.error(`FRONTEND_URL invalid: ${process.env.FRONTEND_URL}`)
	process.exit(1)
}

// Variables
const port = process.env.PORT || 5050

// Connect to database
connectDB()

// Initialise app
const app = express()

// Middleware
app.use(express.json()) 
app.use(express.urlencoded({ extended: false }))

// Helmet HTTP security
app.use(helmet())

// Custom Content Security Policy to allow Umami analytics
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "https://cloud.umami.is"],
			connectSrc: ["'self'", "https://cloud.umami.is", "https://api-gateway.umami.dev"],
			imgSrc: ["'self'", "data:"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: [],
		},
	})
)

// CORS
if (process.env.NODE_ENV === 'production') {
    app.use(cors({
      	origin: process.env.FRONTEND_URL,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		optionsSuccessStatus: 200
    }))
} else {
    app.use(cors({
      	origin: 'http://localhost:3000',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		optionsSuccessStatus: 200
    }))
}

// Routes
app.use('/api/workouts', workoutRouter)
app.use('/api/exercises', exerciseRouter)
app.use('/api/users', userRouter)
app.use('/api/quests', questRouter)
app.use('/api/dev', devRouter)

// Production configuration
if (process.env.NODE_ENV === 'production') {
	console.log("Production mode")
	app.use(express.static(path.join(__dirname, '..', 'strive-frontend', 'dist')))
	app.get(/.*/, (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', 'strive-frontend', 'dist', 'index.html'))
	})
}

// Custom Error Handler initialisation
app.use(errorHandler)

// Port listener
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})