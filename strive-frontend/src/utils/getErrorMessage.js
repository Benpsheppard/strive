// getErrorMessage.js
// Pull the most useful message out of an axios error (server message first)

export const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || error.toString()
