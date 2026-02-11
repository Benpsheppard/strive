// server.js
// File to run server for Strive

// Imports
const express = require('express')                                     
const dotenv = require('dotenv').config()                             
const colors = require('colors')                                   
const path = require('path')                                          
const helmet = require('helmet')  
const cors = require('cors')

// Function Imports
const connectDB = require('./config/db.js')                       
const { errorHandler } = require('./middleware/errorMiddleware.js')   

// Router Imports
const { workoutRouter } = require('./routes/workoutRoutes.js')        
const { userRouter } = require('./routes/userRoutes.js')              
const { questRouter } = require('./routes/questRoutes.js')
const { contestRouter } = require('./routes/contestRoutes.js')
const { devRouter } = require('./routes/devRoutes.js')

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

app.use(cors({
  origin: '*'
}))

// Routes
app.use('/api/workouts', workoutRouter)
app.use('/api/users', userRouter)
app.use('/api/quests', questRouter)
app.use('/api/contests', contestRouter)
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