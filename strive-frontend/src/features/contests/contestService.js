// contestService.js

// Imports
import axios from 'axios';

// API URL
const API_URL = '/api/contests/';

// Get the current monthly contest
const getContest = async () => {
  const response = await axios.get(API_URL + 'current');
  return response.data;
};

// Export
const contestService = {
  getContest,
};

export default contestService;