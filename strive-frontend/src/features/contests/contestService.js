// contestService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = import.meta.env.VITE_API_URL + '/api/contests/'

// Get current contest
const getContest = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL + 'current', config)
  return response.data
}

// Get current contest's leaderboard
const getLeaderboard = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL + 'leaderboard', config)
  return response.data
}


// Export
const contestService = {
  getContest,
  getLeaderboard
}

export default contestService