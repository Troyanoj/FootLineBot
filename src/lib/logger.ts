/**
 * Logging utility for FootLineBot
 * 
 * Provides conditional logging based on environment:
 * - Development: All logs enabled
 * - Production: Only warnings and errors
 * 
 * Usage:
 *   logger.debug('Detailed info', data)
 *   logger.info('General info', data)
 *   logger.warn('Warning', data)
 *   logger.error('Error', data)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

// Determine current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.DEBUG === 'true' || process.env.LOG_LEVEL === 'debug';

// Log levels that should always be shown in production
const PRODUCTION_LOG_LEVELS: LogLevel[] = ['warn', 'error'];

// Log levels for development
const DEVELOPMENT_LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

// Get current log levels based on environment
const getCurrentLogLevels = (): LogLevel[] => {
  if (isDevelopment || isDebugEnabled) {
    return DEVELOPMENT_LOG_LEVELS;
  }
  return PRODUCTION_LOG_LEVELS;
};

// Check if a log level should be shown
const shouldLog = (level: LogLevel): boolean => {
  const levels = getCurrentLogLevels();
  return levels.includes(level);
};

// Format timestamp for logs
const formatTimestamp = (): string => {
  return new Date().toISOString();
};

// Create logger instance
export const logger: Logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(`[${formatTimestamp()}] DEBUG:`, ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.log(`[${formatTimestamp()}] INFO:`, ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(`[${formatTimestamp()}] WARN:`, ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (shouldLog('error')) {
      console.error(`[${formatTimestamp()}] ERROR:`, ...args);
    }
  },
};

// Export convenience methods for specific contexts
export const webhookLogger = {
  request: (data: any) => logger.debug('[Webhook] Incoming request:', data),
  event: (type: string, source: string) => logger.info('[Webhook] Processing event:', { type, source }),
  error: (error: any) => logger.error('[Webhook] Error processing event:', error),
};

export const commandLogger = {
  received: (command: string, args: string[], lang: string) => 
    logger.debug('[Command] Received:', { command, args, lang }),
  executed: (command: string, success: boolean) => 
    logger.info('[Command] Executed:', { command, success }),
  error: (command: string, error: any) => 
    logger.error('[Command] Error:', { command, error }),
};

export const groupLogger = {
  joined: (groupId: string) => logger.info('[Group] Bot joined:', groupId),
  registered: (groupId: string, groupName: string) => 
    logger.info('[Group] Registered:', { groupId, groupName }),
  left: (groupId: string) => logger.info('[Group] Bot left:', groupId),
  error: (action: string, error: any) => logger.error('[Group] Error:', { action, error }),
};

export default logger;
