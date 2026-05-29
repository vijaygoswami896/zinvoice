/**
 * HTTP request/response logger using pino-http.
 * Attaches a unique requestId to each request and logs
 * method, url, status, and response time.
 *
 * Skips logging for health-check endpoints to reduce noise.
 */
declare const requestLogger: import("pino-http").HttpLogger<any, any, never>;
export default requestLogger;
