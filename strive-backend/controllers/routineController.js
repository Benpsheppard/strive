// routineController.js
// Saved routines: lists of exercises to start a workout from

const asyncHandler = require('express-async-handler')

const Routine = require('../models/routineModel.js')
const Exercise = require('../models/exerciseModel.js')
const { isObjectId } = require('../utils/isObjectId.js')

const MAX_ROUTINES = 30
const MAX_ROUTINES_GUEST = 3
const MAX_EXERCISES = 30
const MAX_NAME_LENGTH = 60

// What the app needs to show and start an exercise
const EXERCISE_FIELDS = 'name muscleGroup subMuscleGroup trackingMode equipment isCustom'

const populateRoutine = (query) => query.populate('exercises.exercise', EXERCISE_FIELDS)

// Checks the request body. Returns { error } or { name?, exercises? } ready to store.
// Exercises must be library exercises or the caller's own custom ones, and the equipment hint
// (if any) must be one the exercise actually has.
const validateRoutineInput = async (body, userId, { requireAll }) => {
    const result = {}

    if (requireAll || body.name !== undefined) {
        if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > MAX_NAME_LENGTH) {
            return { error: `Name must be 1-${MAX_NAME_LENGTH} characters` }
        }
        result.name = body.name.trim().replace(/\s+/g, ' ')
    }

    if (requireAll || body.exercises !== undefined) {
        const { exercises } = body

        if (!Array.isArray(exercises) || exercises.length < 1 || exercises.length > MAX_EXERCISES) {
            return { error: `A routine needs between 1 and ${MAX_EXERCISES} exercises` }
        }

        const ids = []
        for (const item of exercises) {
            if (!item || typeof item !== 'object' || !isObjectId(item.exercise)) {
                return { error: 'Each exercise must reference a valid exercise id' }
            }
            if (item.selectedEquipment !== undefined && item.selectedEquipment !== null && typeof item.selectedEquipment !== 'string') {
                return { error: 'Equipment must be text' }
            }
            ids.push(item.exercise)
        }

        if (new Set(ids).size !== ids.length) {
            return { error: 'An exercise can only appear once in a routine' }
        }

        const found = await Exercise.find({ _id: { $in: ids } }).select('equipment isCustom createdBy')
        const byId = new Map(found.map(ex => [String(ex._id), ex]))

        const clean = []
        for (const item of exercises) {
            const exercise = byId.get(item.exercise)

            // Someone else's custom exercise looks exactly like one that doesn't exist
            if (!exercise || (exercise.isCustom && String(exercise.createdBy) !== String(userId))) {
                return { error: 'One of the exercises was not found' }
            }

            const equipment = item.selectedEquipment ? item.selectedEquipment.trim() : undefined
            if (equipment && !exercise.equipment.includes(equipment)) {
                return { error: 'That equipment is not available for one of the exercises' }
            }

            clean.push({ exercise: item.exercise, ...(equipment ? { selectedEquipment: equipment } : {}) })
        }

        result.exercises = clean
    }

    return result
}

// A routine name is unique per member, ignoring capital letters
const nameTaken = async (userId, name, exceptId) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const existing = await Routine.findOne({
        user: userId,
        name: new RegExp(`^${escaped}$`, 'i'),
        ...(exceptId ? { _id: { $ne: exceptId } } : {})
    })
    return Boolean(existing)
}

// Loads the caller's routine. Anyone else's is reported as not found so ids can't be probed.
const findOwnRoutine = async (req, res) => {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user.id })

    if (!routine) {
        res.status(404)
        throw new Error('Routine not found')
    }

    return routine
}

/**
 * @desc    The user's routines, most recently changed first
 * @route   GET /api/routines
 * @access  Private
 */
const getRoutines = asyncHandler(async (req, res) => {
    const routines = await populateRoutine(Routine.find({ user: req.user.id }).sort({ updatedAt: -1 }))

    res.status(200).json(routines)
})

/**
 * @desc    Create a routine
 * @route   POST /api/routines
 * @access  Private
 */
const createRoutine = asyncHandler(async (req, res) => {
    const { error, name, exercises } = await validateRoutineInput(req.body || {}, req.user.id, { requireAll: true })
    if (error) {
        res.status(400)
        throw new Error(error)
    }

    const limit = req.user.isGuest ? MAX_ROUTINES_GUEST : MAX_ROUTINES
    if ((await Routine.countDocuments({ user: req.user.id })) >= limit) {
        res.status(403)
        throw new Error(req.user.isGuest
            ? `Guest accounts can save up to ${MAX_ROUTINES_GUEST} routines. Create a free account for more.`
            : `You can save up to ${MAX_ROUTINES} routines`)
    }

    if (await nameTaken(req.user.id, name)) {
        res.status(409)
        throw new Error('You already have a routine with that name')
    }

    const routine = await Routine.create({ user: req.user.id, name, exercises })

    res.status(201).json(await populateRoutine(Routine.findById(routine._id)))
})

/**
 * @desc    Rename a routine and/or replace its exercises
 * @route   PUT /api/routines/:id
 * @access  Private
 */
const updateRoutine = asyncHandler(async (req, res) => {
    const routine = await findOwnRoutine(req, res)

    const { error, name, exercises } = await validateRoutineInput(req.body || {}, req.user.id, { requireAll: false })
    if (error) {
        res.status(400)
        throw new Error(error)
    }

    if (name === undefined && exercises === undefined) {
        res.status(400)
        throw new Error('Nothing to update')
    }

    if (name !== undefined) {
        if (await nameTaken(req.user.id, name, routine._id)) {
            res.status(409)
            throw new Error('You already have a routine with that name')
        }
        routine.name = name
    }
    if (exercises !== undefined) routine.exercises = exercises

    await routine.save()

    res.status(200).json(await populateRoutine(Routine.findById(routine._id)))
})

/**
 * @desc    Delete a routine
 * @route   DELETE /api/routines/:id
 * @access  Private
 */
const deleteRoutine = asyncHandler(async (req, res) => {
    const routine = await findOwnRoutine(req, res)
    await routine.deleteOne()

    res.status(200).json({ id: req.params.id, message: 'Routine deleted' })
})

module.exports = { getRoutines, createRoutine, updateRoutine, deleteRoutine, MAX_ROUTINES, MAX_ROUTINES_GUEST, MAX_EXERCISES }
