// exerciseService.js

// Imports
import axios from 'axios'
import workoutsService from '../workouts/workoutsService'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/exercises/'

// Get exercises
const getExercises = async () => {
    const response = await axios.get(API_URL)

    return response.data
}

const exerciseService = {
    getExercises
}

export default exerciseService