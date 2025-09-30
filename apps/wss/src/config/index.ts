export const CONFIG = {
  WS_PORT: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080,
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || '',
  MAX_MESSAGE_LENGTH: 1000,
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
} as const;