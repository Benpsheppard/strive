// questService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/quests/'

// Get user quests
const getQuests = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL, config)

    return response.data
}

// Generate quests
const generateQuests = async (duration, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL + `generate/${duration}`, {}, config)

    return response.data
}

// Check quest completion
const checkQuestCompletion = async (workoutData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL + 'check-completion', { newWorkout: workoutData }, config)

    return response.data
}

const questService = {
    getQuests,
    generateQuests,
    checkQuestCompletion
}

export default questService