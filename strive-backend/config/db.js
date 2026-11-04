// db.js

const mongoose = require('mongoose')

// Development and test use the separate test database, never the production one.
// Errors are rethrown (with the credentials-safe message only) so the caller decides what to do.
const connectDB = async () => {
    const usesTestDatabase = ['development', 'test'].includes(process.env.NODE_ENV)

    if (usesTestDatabase && !process.env.MONGO_URI_TEST) {
        throw new Error(`MONGO_URI_TEST must be set when NODE_ENV=${process.env.NODE_ENV}`)
    }

    const uri = usesTestDatabase ? process.env.MONGO_URI_TEST : process.env.MONGO_URI

    try {
        const conn = await mongoose.connect(uri)
        console.log(`MongoDB connected (${process.env.NODE_ENV}): ${conn.connection.host}`)
        return conn
    } catch (error) {
        // The full error can include the connection string, so only pass on its message
        throw new Error(`Could not connect to MongoDB: ${error.message.replace(/mongodb(\+srv)?:\/\/\S+/g, '[connection string hidden]')}`)
    }
}

module.exports = connectDB
