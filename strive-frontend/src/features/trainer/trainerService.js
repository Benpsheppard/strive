// trainerService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/trainer/'

// Get suggestions
const getSuggestions = async (token) => {
    const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

    const response = await axios.get(API_URL, config)

    return response.data.suggestions
}

const trainerService = {
    getSuggestions
}

export default trainerService