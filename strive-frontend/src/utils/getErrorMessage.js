// getErrorMessage.js
// Pull the most useful message out of an axios error (server message first)

// True when trying the same request again later could succeed: no connection, a timeout,
// a server fault or rate limiting. Validation and permission errors (4xx) are not retryable.
export const isRetryableError = (error) => {
    const status = error?.response?.status
    if (!status) return true
    return status >= 500 || status === 408 || status === 429
}

export const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || error.toString()
