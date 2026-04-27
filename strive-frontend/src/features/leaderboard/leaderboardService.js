// leaderboardService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/leaderboard/'

// Get leaderboard
const getLeaderboard = async (metric, token) => {
    const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		}
	}

	const response = await axios.get(`${API_URL}?metric=${metric}`, config)

	return response.data
}

const leaderboardService = {
    getLeaderboard
}

export default leaderboardService