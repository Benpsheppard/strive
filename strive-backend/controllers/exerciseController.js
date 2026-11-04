// exerciseController.js

// Imports
const asyncHandler = require('express-async-handler')

// Model Imports
const Exercise = require('../models/exerciseModel.js')
const {
    MUSCLE_GROUPS,
    SUB_MUSCLE_GROUPS,
    EQUIPMENT,
    LOGGABLE_TRACKING_MODES,
    generateSlug
} = require('../models/exerciseOptions.js')

const MAX_CUSTOM_EXERCISES = 50
const NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9 '’().,&+/-]{1,59}$/

/**
 * @desc    Get the exercise library, plus the caller's own custom exercises when logged in
 * @route   GET /api/exercises
 * @access  Public (custom exercises included when a valid token is sent)
 */
const getExercises = asyncHandler(async (req, res) => {
    const filter = req.user
        ? { $or: [{ isCustom: { $ne: true } }, { createdBy: req.user._id }] }
        : { isCustom: { $ne: true } }

    const exercises = await Exercise.find(filter)

    res.status(200).json(exercises)
})

/**
 * @desc    Create a custom exercise for the authenticated user
 * @route   POST /api/exercises
 * @access  Private
 */
const createExercise = asyncHandler(async (req, res) => {
    const { name, muscleGroup, subMuscleGroup = 'Other', equipment, trackingMode } = req.body || {}

    if (typeof name !== 'string' || !NAME_REGEX.test(name.trim())) {
        res.status(400)
        throw new Error('Name must be 2-60 characters using letters, numbers and basic punctuation')
    }

    if (!MUSCLE_GROUPS.includes(muscleGroup)) {
        res.status(400)
        throw new Error('Please choose a valid muscle group')
    }

    if (!SUB_MUSCLE_GROUPS.includes(subMuscleGroup)) {
        res.status(400)
        throw new Error('Invalid sub muscle group')
    }

    if (!LOGGABLE_TRACKING_MODES.includes(trackingMode)) {
        res.status(400)
        throw new Error('Please choose a valid way to track this exercise')
    }

    if (
        !Array.isArray(equipment) ||
        equipment.length < 1 ||
        equipment.length > 5 ||
        !equipment.every(item => EQUIPMENT.includes(item)) ||
        new Set(equipment).size !== equipment.length
    ) {
        res.status(400)
        throw new Error('Please choose between 1 and 5 valid pieces of equipment')
    }

    const cleanName = name.trim().replace(/\s+/g, ' ')
    const slug = generateSlug(cleanName)

    if (!slug) {
        res.status(400)
        throw new Error('Name must contain letters or numbers')
    }

    // Names can't clash with the library, or with the user's own exercises
    const libraryMatch = await Exercise.findOne({ slug, isCustom: { $ne: true } })
    if (libraryMatch) {
        res.status(409)
        throw new Error(`"${libraryMatch.name}" is already in the exercise library`)
    }

    const ownMatch = await Exercise.findOne({ slug: `${req.user._id}_${slug}` })
    if (ownMatch) {
        res.status(409)
        throw new Error('You already have a custom exercise with that name')
    }

    const customCount = await Exercise.countDocuments({ createdBy: req.user._id, isCustom: true })
    if (customCount >= MAX_CUSTOM_EXERCISES) {
        res.status(403)
        throw new Error(`You can create up to ${MAX_CUSTOM_EXERCISES} custom exercises`)
    }

    const exercise = await Exercise.create({
        name: cleanName,
        muscleGroup,
        subMuscleGroup,
        equipment,
        trackingMode,
        isCustom: true,
        createdBy: req.user._id
    })

    res.status(201).json(exercise)
})

module.exports = { getExercises, createExercise, MAX_CUSTOM_EXERCISES }
