// questRoutes.js

// Imports
const express = require('express');
const { genQuest, getQuests, completeQuest, deleteQuest, checkQuestCompletion } = require('../controllers/questController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Initialise router
const questRouter = express.Router();

questRouter.use(protect);

// Get quests route
questRouter.get('/', getQuests);

// Generate quest route
questRouter.post('/generate-quest', genQuest);

// Check quest completion route
questRouter.post('/check-completion', checkQuestCompletion);

// Complete quest route
questRouter.put('/complete/:questId', completeQuest);

// Delete quest
questRouter.delete('/:questId', deleteQuest);

module.exports = { questRouter };