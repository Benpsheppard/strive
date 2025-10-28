// questService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = '/api/quests/'

// Generate quest
const generateQuest = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const response = await axios.post(API_URL + 'generate-quest', null, config);
  return response.data.quest;
}

// Get all quests for the user
const getQuests = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const response = await axios.get(API_URL, config);
  console.log('getQuests FULL response:', response);
  console.log('getQuests response.data:', response.data);
  console.log('getQuests response.data.quests:', response.data.quests);
  return response.data.quests;
}

// Complete quest
const completeQuest = async (questId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.put(API_URL + 'complete/' + questId, {}, config);
  return response.data.newQuest;
};

// Delete quest
const deleteQuest = async (questId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.delete(API_URL + questId, config);
  return questId
};

// Check quest completion
const checkQuestCompletion = async (newWorkout, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` } 
  };
  const response = await axios.post(API_URL + 'check-completion', { newWorkout }, config);
  return response.data.updatedQuests;
};

const questService = {
  generateQuest,
  getQuests,
  completeQuest,
  deleteQuest,
  checkQuestCompletion
};

export default questService;
