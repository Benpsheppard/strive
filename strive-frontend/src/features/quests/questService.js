// questService.js

// Imports
import axios from 'axios'

// API URL
const API_URL = '/api/quests/'

// Generate three quests
const generateQuests = async (userId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const response = await axios.post(API_URL + 'generate-quests', { userId }, config);
  return response.data.quests;
}

// Generate a single quest (e.g., when one is completed)
const generateQuest = async (userId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const response = await axios.post(API_URL + 'generate-quest', { userId }, config);
  return response.data.quest;
}

// Get all quests for the user
const getQuests = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const response = await axios.get(API_URL, config);
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
  generateQuests,
  generateQuest,
  getQuests,
  completeQuest,
  deleteQuest,
  checkQuestCompletion
};

export default questService;
