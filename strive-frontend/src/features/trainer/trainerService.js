// trainerService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/trainer/'

// Get suggestions
const getSuggestions = async () => {
    const response = await axios.get(API_URL)

    return response.data
}

const trainerService = {
    getSuggestions
}

export default trainerService