import { EnvTypes } from "../types/index.js";

const requiredVars: string[] = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL',
];

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
    console.error(`[env] Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

const env: EnvTypes = {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: parseInt(process.env.PORT as string, 10) || 5000,
    CLIENT_URL: process.env.CLIENT_URL as string,

    MONGO_URI: process.env.MONGO_URI as string,
    MONGO_MIN_POOL_SIZE: parseInt((process.env.MONGO_MIN_POOL_SIZE as string), 10) || 5,
    MONGO_MAX_POOL_SIZE: parseInt((process.env.MONGO_MAX_POOL_SIZE as string), 10) || 20,

    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // SMTP_HOST: process.env.SMTP_HOST || '',
    // SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    // SMTP_USER: process.env.SMTP_USER || '',
    // SMTP_PASS: process.env.SMTP_PASS || '',
    // MAIL_FROM: process.env.MAIL_FROM || '',

    // PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || '',
    // PDF_STORAGE_PATH: process.env.PDF_STORAGE_PATH || './storage/pdfs',

    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string, 10) || 15 * 60 * 1000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100,
    RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX as string, 10) || 10,

    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
};

// module.exports = env;
export default env;