// questRoutes.js

// Imports
const express = require('express');
const { genQuests, genQuest, getQuests, completeQuest, deleteQuest, checkQuestCompletion } = require('../controllers/questController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Initialise router
const questRouter = express.Router();

// Get quests route
questRouter.get('/', protect, getQuests);

// Generate 3 quests route
questRouter.post('/generate-quests', genQuests);

// Generate 1 quest route
questRouter.post('/generate-quest', genQuest);

// Check quest completion route
questRouter.post('/check-completion', protect, checkQuestCompletion);

// Complete quest route
questRouter.put('/complete/:questId', protect, completeQuest);

// Delete quest
questRouter.delete('/:questId', protect, deleteQuest);

module.exports = { questRouter };