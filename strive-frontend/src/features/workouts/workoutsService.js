// workoutsService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/workouts/'

// Create new workout
const createWorkout = async (workoutData, token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	const response = await axios.post(API_URL, workoutData, config)

	return response.data
}

// Get user workouts
const getWorkouts = async (token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	const response = await axios.get(API_URL, config)

	return response.data
}

// Delete user workout
const deleteWorkout = async (workoutId, token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	const response = await axios.delete(API_URL + workoutId, config)

	return response.data
}

// Add exercise to workout
const addExercise = async (workoutId, exercise, token) => {
	const config = {
		headers: { 
			Authorization: `Bearer ${token}` 
		}
	}

	const response = await axios.put(API_URL + workoutId + '/exercises', exercise, config)
	
	return response.data
}

const workoutsService = {
	createWorkout,
	getWorkouts,
	deleteWorkout,
	addExercise
}

export default workoutsService