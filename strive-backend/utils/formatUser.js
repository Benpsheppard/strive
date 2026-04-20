// formatUser.js

const formatUser = (user, token = null) => {
    const formatted = {
        _id: user.id || user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        useImperial: user.useImperial,
        isGuest: user.isGuest,
        lastWorkout: user.lastWorkout,
        level: user.level,
        strivepoints: user.strivepoints,
        momentum: user.momentum,
        streak: user.streak,
        target: user.target,
        height: user.height,
        weight: user.weight,
    }

    if (token) formatted.token = token

    return formatted
}

module.exports = formatUser