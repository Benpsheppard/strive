// exerciseRoutes

const express = require('express')
const { getExercises } = require('../controllers/exerciseController')

const exerciseRouter = express.Router()

exerciseRouter.route('/').get(getExercises)

module.exports = { exerciseRouter }