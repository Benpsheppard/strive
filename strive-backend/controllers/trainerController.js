// trainerController.js
const asyncHandler = require('express-async-handler')
const Anthropic = require('@anthropic-ai/sdk')
const User = require('../models/userModel')
const Workout = require('../models/workoutModel')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const buildSuggestionPrompt = (user, workouts) => {
  const workoutDetails = workouts.length
    ? workouts.map((workout, index) => {
        const exerciseList = workout.exercises
          .map(ex => {
            const name = ex.exercise?.name || (ex.exercise && ex.exercise.toString()) || 'unknown'
            const sets = Array.isArray(ex.sets) ? `${ex.sets.length} sets` : ''
            return `${name}${sets ? ` (${sets})` : ''}`
          })
          .join(', ')

        return `Workout ${index + 1}: title="${workout.title}", date="${workout.date?.toISOString().slice(0, 10)}", duration=${workout.duration}min, exercises=[${exerciseList}], totalWeight=${workout.summary?.totalWeight || 0}, totalReps=${workout.summary?.totalReps || 0}`
      })
      .join('\n')
    : 'No workout history available.'

  return `
You are an AI Gym Personal Trainer.
Based on this user's workout history, generate exactly three personalized suggestions.
Each suggestion must be an object with "title" and "description" only.
Do not output any extra text outside the JSON array.

User:
- id: ${user._id}
- name: ${user.name || 'unknown'}

Workout history:
${workoutDetails}

Return only:
[
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."}
]
`
}

const generateSuggestions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const workouts = await Workout.find({ user: user.id })
    .populate('exercises.exercise')
    .sort({ date: -1 })
    .lean()

  const prompt = buildSuggestionPrompt(user, workouts)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    temperature: 0.8,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content?.[0]?.text || ''
  const cleaned = text.replace(/```json|```/gi, '').trim()

  let suggestions
  try {
    suggestions = JSON.parse(cleaned)
  } catch (error) {
    throw new Error(`AI returned invalid JSON: ${error.message}`)
  }

  if (!Array.isArray(suggestions) || suggestions.length !== 3) {
    throw new Error('AI response must be an array of exactly 3 suggestions')
  }

  suggestions.forEach((suggestion, index) => {
    if (!suggestion.title || !suggestion.description) {
      throw new Error(`Suggestion ${index + 1} must include title and description`)
    }
  })

  res.status(200).json({ suggestions })
})

module.exports = { generateSuggestions }