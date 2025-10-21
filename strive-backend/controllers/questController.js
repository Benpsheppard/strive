// questController.js

const asyncHandler = require('express-async-handler');
const Anthropic = require('@anthropic-ai/sdk');
const Quest = require('../models/questModel');
const User = require('../models/userModel');
const Workout = require('../models/workoutModel');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// @desc    Generate three quests
// @route   POST /api/quests/generate-quests
// @access  Private
const genQuests = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let existingQuests = await Quest.find({ user: userId, expiry: { $gte: new Date() } });
    if (existingQuests.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 300)); // wait 0.3s
        existingQuests = await Quest.find({ user: userId, expiry: { $gte: new Date() } });
    }

    if (existingQuests.length > 0) {
        return res.status(200).json({
            message: "Active quests already exist — returning existing ones.",
            quests: existingQuests
        });
    }

    const recentWorkouts = await Workout.find({ user: userId })
        .sort({ date: -1 })
        .limit(10);

    if (recentWorkouts.length === 0) {
        res.status(400);
        throw new Error('No workouts found for this user');
    }

    const summary = recentWorkouts.map(w => ({
        date: w.date,
        exercises: w.exercises.map(e => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight
        }))
    }));

    const unitSystem = user.useImperial ? "imperial (lbs)" : "metric (kg)";

    // --- MOCK MODE ---
    if (process.env.USE_MOCK_AI === 'true') {
        const mockQuests = [
            {
                title: "Iron Resolve",
                duration: "weekly",
                difficulty: "medium",
                description: "Complete 3 full-body sessions this week with consistent effort."
            },
            {
                title: "Momentum Maker",
                duration: "daily",
                difficulty: "easy",
                description: "Add one extra set to your favourite lift today."
            },
            {
                title: "Titan's Challenge",
                duration: "monthly",
                difficulty: "hard",
                description: "Increase your squat PR by 5% before the month ends."
            }
        ];

        const questsData = mockQuests.map(q => ({
            user: userId,
            title: q.title,
            duration: q.duration,
            difficulty: q.difficulty.toLowerCase(),
            description: q.description,
            expiry: new Date(Date.now() +
                (q.duration === 'daily' ? 1 : q.duration === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000)
        }));

        const savedQuests = await Quest.insertMany(questsData);
        return res.status(200).json({
            message: "Mock quests generated!",
            quests: savedQuests
        });
    }

    // --- ANTHROPIC CLAUDE API CALL ---
    const prompt = `You are an AI fitness coach. 
        The user tracks their workouts using the ${unitSystem} system, so anything you generate should reflect that.
        Based on the user's recent workouts, generate 3 creative fitness quests.
        Each quest should be in valid JSON format with these fields:
        [
            {
                "title": "string",
                "duration": "daily | weekly | monthly",
                "difficulty": "light | easy | medium | hard | impossible",
                "description": "string",
                "completion": {
                    "exercise": "String",
                    "weight": "Number",
                    "reps": "Number"
                }
            }
        ]

        The "title" should be short (1 - 6 words), creative and inspiring.
        The "description" should be 1 - 2 sentences with a clear objective.
        The "description" should follow a similar theme to the title and encourage the user to complete the quest. 
        The "description" should outline what the user needs to complete in order to complete the quest.
        The "difficulty" should be one of "light", "easy", "medium", "hard", or "impossible"
        The "difficulty" should be determined by looking at the users current progress.
        The "duration" should reflect the "difficulty", the easier quests should be daily or weekly and harder quests should be weekly or monthly.
        The "duration" should be one of "daily", "weekly" or "monthly".
        The "completion" object must include the exact exercise name.
        The first letter of each word in the exercise name must be capitalised (e.g. "Bicep Curls", "Leg Press").
        If an exercise contains a hyphen, treat the entire hyphenated term as one word — only the first letter before the hyphen should be capitalised, and the rest remain lowercase (e.g. "T-bar Row", not "T-Bar Row" or "T-Bar row").
        Do not alter or invent exercise names — always use the same capitalization and spelling as shown in the user's workout history.
        Respond ONLY with a valid JSON array of 3 objects, no extra text. Do NOT include anything other than the outlined fields above. Do NOT include explanations, quotes or notes.

        User workouts: ${JSON.stringify(summary)}

        Remember: Exercise names in quests must match exactly with those in the user's workouts — including capitalization and hyphen usage (e.g., "T-bar Row", "Bicep Curls").
    `;

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    });

    let text = response.content[0].text;

    // Remove markdown code blocks if present
    text = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .replace(/^\s*Here are.*?:/i, '')
        .trim();

    let questsArray;
    try {
        questsArray = JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse AI response: ", text)
        res.status(500);
        throw new Error("Failed to parse AI response: ", text);
    }

    const questsData = questsArray.map(q => ({
        user: userId,
        title: q.title,
        duration: q.duration,
        difficulty: q.difficulty.toLowerCase(),
        description: q.description,
        expiry: new Date(Date.now() +
            (q.duration === 'daily' ? 1 : q.duration === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000),
        completion: {
            exercise: q.completion.exercise,
            weight: q.completion.weight,
            reps: q.completion.reps
        }
    }));

    const savedQuests = await Quest.insertMany(questsData);

    res.status(200).json({
        message: "Three quests generated!",
        quests: savedQuests
    });
});

// @desc    Generate one quest
// @route   POST /api/quests/generate-quest
// @access  Private
const genQuest = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const recentWorkouts = await Workout.find({ user: userId })
        .sort({ date: -1 })
        .limit(10);

    if (recentWorkouts.length === 0) {
        res.status(400);
        throw new Error('No workouts found for this user');
    }

    const summary = recentWorkouts.map(w => ({
        date: w.date,
        exercises: w.exercises.map(e => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight
        }))
    }));

    const unitSystem = user.useImperial ? "imperial (lbs)" : "metric (kg)";

    // --- MOCK MODE ---
    if (process.env.USE_MOCK_AI === 'true') {
        const mockQuest = {
            title: "Iron Resolve",
            duration: "weekly",
            difficulty: "medium",
            description: "Complete 3 full-body sessions this week with consistent effort."
        };

        const questData = {
            user: userId,
            title: mockQuest.title,
            duration: mockQuest.duration,
            difficulty: mockQuest.difficulty.toLowerCase(),
            description: mockQuest.description,
            expiry: new Date(Date.now() +
                (mockQuest.duration === 'daily' ? 1 : mockQuest.duration === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000)
        };

        const savedQuest = await Quest.create(questData);
        return res.status(200).json({
            message: "Mock quest generated!",
            quest: savedQuest
        });
    }

    // --- ANTHROPIC CLAUDE API CALL ---
    const prompt = `You are an AI fitness coach. 
        The user tracks their workouts using the ${unitSystem} system, so anything you generate should reflect that.
        Based on the user's recent workouts, generate 1 creative fitness quest.
        The quest should be in valid JSON format with these fields:
        {
            "title": "string",
            "duration": "daily | weekly | monthly",
            "difficulty": "light | easy | medium | hard | impossible",
            "description": "string",
            "completion": {
                "exercise": "String",
                "weight": "Number",
                "reps": "Number"
            }
        }

        The "title" should be short (1 - 6 words), creative and inspiring.
        The "description" should be 1 - 2 sentences with a clear objective.
        The "description" should follow a similar theme to the title and encourage the user to complete the quest. 
        The "description" should outline what the user needs to complete in order to complete the quest.
        The "difficulty" should be one of "light", "easy", "medium", "hard", or "impossible"
        The "difficulty" should be determined by looking at the users current progress.
        The "duration" should reflect the "difficulty", the easier quests should be daily or weekly and harder quests should be weekly or monthly.
        The "duration" should be one of "daily", "weekly" or "monthly".
        The "completion" object must include the exact exercise name.
        The first letter of each word in the exercise name must be capitalised (e.g. "Bicep Curls", "Leg Press").
        If an exercise contains a hyphen, treat the entire hyphenated term as one word — only the first letter before the hyphen should be capitalised, and the rest remain lowercase (e.g. "T-bar Row", not "T-Bar Row" or "T-Bar row").
        Do not alter or invent exercise names — always use the same capitalization and spelling as shown in the user's workout history.
        Respond ONLY with a valid JSON object (not an array), no extra text. Do NOT include anything other than the outlined fields above. Do NOT include explanations, quotes or notes.

        User workouts: ${JSON.stringify(summary)}

        Remember: Exercise names in quests must match exactly with those in the user's workouts — including capitalization and hyphen usage (e.g., "T-bar Row", "Bicep Curls").
    `;

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    });

    let text = response.content[0].text;

    // Remove markdown code blocks if present
    text = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .replace(/^\s*Here are.*?:/i, '')
        .trim();

    let questObject;
    try {
        questObject = JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse AI response: ", text)
        res.status(500);
        throw new Error("Failed to parse AI response: ", text);
    }

    const questData = {
        user: userId,
        title: questObject.title,
        duration: questObject.duration,
        difficulty: questObject.difficulty.toLowerCase(),
        description: questObject.description,
        expiry: new Date(Date.now() +
            (questObject.duration === 'daily' ? 1 : questObject.duration === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000),
        completion: {
            exercise: questObject.completion.exercise,
            weight: questObject.completion.weight,
            reps: questObject.completion.reps
        }
    };

    const savedQuest = await Quest.create(questData);

    res.status(200).json({
        message: "Quest generated!",
        quest: savedQuest
    });
});

// @desc    Get all quests for a user
// @route   GET /api/quests/:userId
// @access  Private
const getQuests = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Check if quests are expired
    await updateExpiredQuests();

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Fetch quests that haven't expired
    const quests = await Quest.find({
        user: userId,
        expiry: { $gte: new Date() }
    }).sort({ expiry: 1 });

    res.status(200).json({
        quests
    });
});

// @desc    Get a single quest by ID
// @route   GET /api/quests/quest/:questId
// @access  Private
const getQuest = asyncHandler(async (req, res) => {
    const { questId } = req.params;

    const quest = await Quest.findById(questId);
    if (!quest) {
        res.status(404);
        throw new Error('Quest not found');
    }

    res.status(200).json({
        quest
    });
});

// @desc    Mark quest as complete
// @route   PUT /api/quests/complete/:questId
// @access  Private
const completeQuest = asyncHandler(async (req, res) => {
    const { questId } = req.params;

    const quest = await Quest.findById(questId);

    if (!quest) {
        res.status(404);
        throw new Error('Quest not found');
    }

    // Update quest status
    quest.status = 'completed';
    await quest.save();

    res.status(200).json({
        message: 'Quest marked as complete!',
        completedQuest: quest,
    });
});

// @desc    Delete quest and reward user if completed
// @route   DELETE /api/quests/:questId
// @access  Private
const deleteQuest = asyncHandler(async (req, res) => {
  const { questId } = req.params;
  const userId = req.user.id;

  const quest = await Quest.findById(questId);
  const user = await User.findById(userId);

  if (!quest || !user) {
    res.status(404);
    throw new Error('Quest or user not found');
  }

  // Delete the quest
  await Quest.findByIdAndDelete(questId);

  res.status(200).json({
    message: quest.status === 'completed' ? 'Quest completed!' : 'Quest deleted!',
    deletedQuestId: questId,
    updatedUser: {
      strivepoints: user.strivepoints,
      level: user.level,
    },
  });
});

// @desc    Check if quests are completed using AI
// @route   POST /api/quests/check-completion
// @access  Private
const checkQuestCompletion = asyncHandler(async (req, res) => {
  const { newWorkout } = req.body; // the workout just submitted
  const userId = req.user.id;

  const quests = await Quest.find({ user: userId, status: 'active' });
  if (!quests.length) return res.status(200).json({ updatedQuests: [] });

  const updatedQuests = [];

  for (const quest of quests) {
    const { exercise, weight, reps } = quest.completion;

    // find matching exercise in the newWorkout
    const match = newWorkout.exercises.find(e => e.name.toLowerCase() === exercise.toLowerCase());
    if (!match) continue;

    // check if any set meets the target
    const completed = match.sets.some(s => s.weight >= weight && s.reps >= reps);
    if (completed) {
      quest.status = 'completed';
      await quest.save();
      updatedQuests.push({ questId: quest._id, completed: true, reward: quest.reward });
    }
  }

  res.status(200).json({ updatedQuests });
});

// @desc    Mark expired quests
const updateExpiredQuests = async () => {
  const now = new Date();
  await Quest.updateMany(
    { status: 'active', expiry: { $lt: now } }, // only active quests past expiry
    { $set: { status: 'expired' } }
  );
};


module.exports = { 
    genQuests, genQuest, 
    getQuests, getQuest,
    completeQuest, deleteQuest,
    checkQuestCompletion 
};