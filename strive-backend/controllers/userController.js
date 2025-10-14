// userController.js
// File to handle user functionality

// Imports
const asyncHandler = require('express-async-handler');    // Import asyncHandler
const User = require('../models/userModel.js');      // Import user schema model 
const jwt = require('jsonwebtoken');    // Import JWT for authentication
const bcrypt = require('bcryptjs');     // Import bcrypt for hashing passwords
const validator = require('validator');     // Import validator for input validation
const Workout = require('../models/workoutModel.js'); // Import workout model

// @desc    Register user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // Get user info
    let { username, email, password } = req.body;

    // Check if all info exists
    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check email is in email format
    if (!validator.isEmail(email)) {
        res.status(400);
        throw new Error('Invalid email address');
    }

    // Check password is long enough
    if (!validator.isStrongPassword(password)) {
        res.status(400);
        throw new Error('Password must satisfy all criteria.');
    }

    // Normalize email
    email = validator.normalizeEmail(email);

    // Look if email and username exists already
    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username })

    // Check if email already exists
    if (emailExists){
        res.status(400);
        throw new Error('Email already exists');
    }

    // Check if username already exists
    if (usernameExists){
        res.status(400);
        throw new Error('Username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);  // generating a hash string to add to unhashed password
    const hashPassword = await bcrypt.hash(password, salt);     // hash users password using salt

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashPassword
    })
    
    // Verify user creation
    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            token: genToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    // Get user details
    const { username, email, password } = req.body;
    identifier = username || email;

    if (!identifier || !password) {
        res.status(400);
        throw new Error('Please provide username/email and password');
    }

    // Determine if identifier is email
    const isEmail = validator.isEmail(identifier);

    // Check for username
    const user = isEmail 
        ? await User.findOne({ email: validator.normalizeEmail(identifier) })
        : await User.findOne({ username: identifier });

    // Check username and password match
    if (user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            token: genToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error('Invalid user credentials');
    }
});

// @desc    Register user
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // Return user info
    res.status(200).json(req.user);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    // Get user from database
    const user = await User.findById(req.params.id);

    // Check if user exists
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if the authenticated user is deleting their own account
    if (user._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this account');
    }

    // Delete all workouts associated with the user
    await Workout.deleteMany({ user: req.params.id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({ 
        id: req.params.id,
        message: 'User and associated workouts deleted successfully' 
    });
});

// Generate JWT token
const genToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
};

// Export functions
module.exports = { registerUser, loginUser, getMe, deleteUser };