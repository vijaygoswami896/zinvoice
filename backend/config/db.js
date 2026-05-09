'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../middleware/logger');

const MONGO_OPTIONS = {
    minPoolSize: env.MONGO_MIN_POOL_SIZE,
    maxPoolSize: env.MONGO_MAX_POOL_SIZE,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
};

mongoose.set('strict', true);
mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => {
    logger.info({ msg: 'MongoDB connected', host: mongoose.connection.host });
});

mongoose.connection.on('error', (err) => {
    logger.error({ err, msg: 'MongoDB connection error' });
});

mongoose.connection.on('disconnected', () => {
    logger.warn({ msg: 'MongoDB disconnected — attempting reconnect' });
});

mongoose.connection.on('reconnected', () => {
    logger.info({ msg: 'MongoDB reconnected' });
});

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI, MONGO_OPTIONS);
    } catch (err) {
        logger.error({ err, msg: 'Initial MongoDB connection failed' });
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();
    logger.info({ msg: 'MongoDB connection closed' });
};

module.exports = { connectDB, disconnectDB };