export interface EnvTypes {
    NODE_ENV: string;
    PORT: number;
    CLIENT_URL: string;
    MONGO_URI: string;
    MONGO_MIN_POOL_SIZE: number;
    MONGO_MAX_POOL_SIZE: number;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_AUTH_MAX: number;
    LOG_LEVEL: string;
    isProd: boolean;
    isDev: boolean;
    isTest: boolean;
}
