import { Client, ClientConfig, Message } from '@line/bot-sdk';

// Token cache with expiration
interface TokenCache {
  accessToken: string;
  expiresAt: number; // Timestamp when token expires
  issuedAt: number;  // Timestamp when token was issued
}

let lineClient: Client | null = null;
let tokenCache: TokenCache | null = null;

/**
 * Get or refresh LINE access token
 * LINE access tokens typically expire after 30 days
 * This function checks if we need to refresh and handles it
 */
async function getValidAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Check if we have a valid cached token
  // Refresh if less than 24 hours remaining (proactive refresh)
  const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  if (tokenCache && tokenCache.expiresAt - now > REFRESH_THRESHOLD_MS) {
    return tokenCache.accessToken;
  }
  
  // Token needs refresh or doesn't exist
  const newToken = process.env.LINE_ACCESS_TOKEN;
  
  if (!newToken) {
    throw new Error('LINE_ACCESS_TOKEN is not configured in environment variables');
  }
  
  // LINE long-lived tokens typically expire after 30 days
  // We'll cache with a conservative 29-day expiration
  const TOKEN_LIFETIME_MS = 29 * 24 * 60 * 60 * 1000; // 29 days
  
  tokenCache = {
    accessToken: newToken,
    issuedAt: now,
    expiresAt: now + TOKEN_LIFETIME_MS,
  };
  
  console.log(`[LINE Token] Token ${tokenCache ? 'refreshed' : 'loaded'}. Valid until: ${new Date(tokenCache.expiresAt).toISOString()}`);
  
  return newToken;
}

/**
 * Create or get LINE client with valid token
 */
function getLineClient(): Client {
  const token = tokenCache?.accessToken || process.env.LINE_ACCESS_TOKEN;
  
  if (!token) {
    throw new Error('LINE_ACCESS_TOKEN is not configured');
  }

  const clientConfig: ClientConfig = {
    channelAccessToken: token,
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  };
  
  if (!lineClient) {
    lineClient = new Client(clientConfig);
  }
  
  return lineClient;
}

/**
 * Force refresh the LINE client with a new token
 * Use this when you suspect the token has been invalidated
 */
export function refreshLineClient(): Client {
  lineClient = null;
  tokenCache = null;
  return getLineClient();
}

/**
 * Get token cache status (for debugging/monitoring)
 */
export function getTokenStatus(): { 
  hasToken: boolean; 
  expiresAt?: string; 
  issuedAt?: string;
  timeRemaining?: string;
} {
  if (!tokenCache) {
    return { hasToken: false };
  }
  
  const now = Date.now();
  const remaining = tokenCache.expiresAt - now;
  
  return {
    hasToken: true,
    expiresAt: new Date(tokenCache.expiresAt).toISOString(),
    issuedAt: new Date(tokenCache.issuedAt).toISOString(),
    timeRemaining: `${Math.floor(remaining / (1000 * 60 * 60))} hours`,
  };
}

// Helper function to create a new LINE client instance (useful for testing)
export function createLineClient(accessToken: string): Client {
  return new Client({
    channelAccessToken: accessToken,
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  });
}

// Reply message types
export type ReplyMessage = Message;

// Send reply message to a user
export async function replyMessage(
  replyToken: string,
  messages: ReplyMessage | ReplyMessage[]
): Promise<void> {
  await getLineClient().replyMessage(replyToken, Array.isArray(messages) ? messages : [messages]);
}

// Push message to a user or group
export async function pushMessage(
  targetId: string,
  messages: ReplyMessage | ReplyMessage[]
): Promise<void> {
  await getLineClient().pushMessage(targetId, Array.isArray(messages) ? messages : [messages]);
}

// Broadcast message to all users (requires broadcast permission)
export async function broadcastMessage(
  messages: ReplyMessage | ReplyMessage[]
): Promise<void> {
  await getLineClient().broadcast(Array.isArray(messages) ? messages : [messages]);
}

// Get user profile with comprehensive error handling and logging
export async function getUserProfile(userId: string): Promise<{
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
}> {
  try {
    console.log(`[INFO] [getUserProfile] Fetching profile for userId: ${userId}`);
    const profile = await getLineClient().getProfile(userId);
    console.log(`[INFO] [getUserProfile] Successfully fetched profile: ${profile.displayName}`);
    return profile;
  } catch (error: any) {
    // Detailed error logging for diagnosis
    const errorDetails = {
      userId,
      message: error?.message || 'Unknown error',
      status: error?.status,
      statusCode: error?.statusCode,
      code: error?.code,
      details: error?.details,
      timestamp: new Date().toISOString(),
    };

    // Handle 404 - User not found in LINE API
    const is404 = error.status === 404 || error.statusCode === 404;
    if (is404) {
      console.warn(`[WARN] [getUserProfile] User not found in LINE API (404): ${userId}`);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        statusMessage: undefined,
      };
    }

    // Handle 401 - Invalid/expired access token
    const is401 = error.status === 401 || error.statusCode === 401;
    if (is401) {
      console.error(`[ERROR] [getUserProfile] LINE API authentication failed (401) for user ${userId}. Check LINE_ACCESS_TOKEN in Vercel.`);
      console.error(`[ERROR] [getUserProfile] Error details:`, errorDetails);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        statusMessage: undefined,
      };
    }

    // Handle 403 - Insufficient permissions
    const is403 = error.status === 403 || error.statusCode === 403;
    if (is403) {
      console.error(`[ERROR] [getUserProfile] LINE API permission denied (403) for user ${userId}. Bot may not have profile permission.`);
      console.error(`[ERROR] [getUserProfile] Error details:`, errorDetails);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        statusMessage: undefined,
      };
    }

    // Handle timeout and network errors
    const isNetworkError = error.code === 'ETIMEDOUT' ||
                           error.code === 'ECONNRESET' ||
                           error.code === 'ECONNREFUSED' ||
                           error.message?.includes('timeout') ||
                           error.message?.includes('network');
    if (isNetworkError) {
      console.warn(`[WARN] [getUserProfile] Network error for user ${userId}: ${error.message}`);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        statusMessage: undefined,
      };
    }

    // Handle rate limiting (429)
    const is429 = error.status === 429 || error.statusCode === 429;
    if (is429) {
      console.warn(`[WARN] [getUserProfile] LINE API rate limited (429) for user ${userId}`);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        statusMessage: undefined,
      };
    }

    // For any other error, log full details and return default profile
    console.error(`[ERROR] [getUserProfile] Unexpected error for user ${userId}:`, errorDetails);

    // Return default profile for any unhandled error to ensure the bot continues working
    return {
      displayName: 'Unknown User',
      userId: userId,
      pictureUrl: undefined,
      statusMessage: undefined,
    };
  }
}

// Get group member profile (includes role in group)
export async function getGroupMemberProfile(
  groupId: string,
  userId: string
): Promise<{
  displayName: string;
  userId: string;
  pictureUrl?: string;
  role?: 'member' | 'admin';
}> {
  try {
    console.log(`[INFO] [getGroupMemberProfile] Fetching profile for userId: ${userId} in group: ${groupId}`);
    const profile = await getLineClient().getGroupMemberProfile(groupId, userId);
    console.log(`[INFO] [getGroupMemberProfile] Successfully fetched profile: ${profile.displayName}`);
    return profile;
  } catch (error: any) {
    const errorDetails = {
      groupId,
      userId,
      message: error?.message || 'Unknown error',
      status: error?.status,
      statusCode: error?.statusCode,
      code: error?.code,
      details: error?.details,
      timestamp: new Date().toISOString(),
    };

    // Handle 404 - User/Group not found
    const is404 = error.status === 404 || error.statusCode === 404;
    if (is404) {
      console.warn(`[WARN] [getGroupMemberProfile] User or group not found (404): userId=${userId}, groupId=${groupId}`);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        role: undefined,
      };
    }

    // Handle 401 - Invalid/expired access token
    const is401 = error.status === 401 || error.statusCode === 401;
    if (is401) {
      console.error(`[ERROR] [getGroupMemberProfile] LINE API authentication failed (401). Check LINE_ACCESS_TOKEN.`);
      console.error(`[ERROR] [getGroupMemberProfile] Error details:`, errorDetails);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        role: undefined,
      };
    }

    // Handle 400 - Bad request (usually group not found or bot not in group)
    const is400 = error.status === 400 || error.statusCode === 400;
    if (is400) {
      console.warn(`[WARN] [getGroupMemberProfile] Bad request (400): groupId=${groupId}, userId=${userId}. Bot may not be in group or group ID is invalid.`);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        role: undefined,
      };
    }

    // Handle 403 - Insufficient permissions
    const is403 = error.status === 403 || error.statusCode === 403;
    if (is403) {
      console.error(`[ERROR] [getGroupMemberProfile] LINE API permission denied (403). Bot may not have group permission.`);
      console.error(`[ERROR] [getGroupMemberProfile] Error details:`, errorDetails);
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        role: undefined,
      };
    }

    // For any other error, log and return default
    console.error(`[ERROR] [getGroupMemberProfile] Unexpected error:`, errorDetails);
    return {
      displayName: 'Unknown User',
      userId: userId,
      pictureUrl: undefined,
      role: undefined,
    };
  }
}

export default getLineClient;
