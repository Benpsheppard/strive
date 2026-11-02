// index.js
// Quest types, keyed by questType. Each exposes { prompt, validate, normalise, check }.
// To add a quest type: add a module here, register it below and add it to the model's questType enum.

module.exports = {
    strength: require('./strength'),
    consistency: require('./consistency'),
    volume: require('./volume'),
    progressive: require('./progressive')
}
