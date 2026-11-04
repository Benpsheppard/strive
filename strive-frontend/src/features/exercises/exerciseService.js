// exerciseService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/exercises/'

const authConfig = (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {})

// Get the exercise library (plus the user's own exercises when a token is sent)
const getExercises = async (token) => {
    const response = await axios.get(API_URL, authConfig(token))

    return response.data
}

// Create a custom exercise
const createExercise = async (exerciseData, token) => {
    const response = await axios.post(API_URL, exerciseData, authConfig(token))

    return response.data
}

const exerciseService = {
    getExercises,
    createExercise
}

export default exerciseService
