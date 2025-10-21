// contestRoutes.js

// Imports
const express = require('express');
// const { protect } = require('../middleware/authMiddleware.js');
const { getContest } = require('../controllers/contestController.js');

// Initialise router
const contestRouter = express.Router();

// Get current contest
contestRouter.get('/current', getContest);

module.exports = { contestRouter };