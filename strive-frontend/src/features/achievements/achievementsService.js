// achievementsService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/achievements/'

const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

// Every achievement with the user's unlocks (locked secrets come back masked)
const getAchievements = async (token) => {
    const response = await axios.get(API_URL, authConfig(token))
    return response.data
}

// Tell the server the user did something worth an achievement (e.g. found an easter egg)
const reportEvent = async (event, token) => {
    const response = await axios.post(API_URL + 'event', { event }, authConfig(token))
    return response.data
}

const achievementsService = {
    getAchievements,
    reportEvent
}

export default achievementsService
