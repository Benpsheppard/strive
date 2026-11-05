// routineRoutes.js

const express = require('express')
const { getRoutines, createRoutine, updateRoutine, deleteRoutine } = require('../controllers/routineController.js')
const { protect } = require('../middleware/authMiddleware.js')
const { validateObjectId } = require('../middleware/validateObjectId.js')

const routineRouter = express.Router()

routineRouter.use(protect)

routineRouter.route('/')
    .get(getRoutines)
    .post(createRoutine)

routineRouter.route('/:id')
    .put(validateObjectId('id'), updateRoutine)
    .delete(validateObjectId('id'), deleteRoutine)

module.exports = { routineRouter }
