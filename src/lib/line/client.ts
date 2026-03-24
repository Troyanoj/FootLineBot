import { Client, ClientConfig, Message } from '@line/bot-sdk';

let lineClient: Client | null = null;

function getLineClient(): Client {
  if (!lineClient) {
    const token = process.env.LINE_ACCESS_TOKEN;
    if (!token) {
      throw new Error('LINE_ACCESS_TOKEN is not configured');
    }
    
    const clientConfig: ClientConfig = {
      channelAccessToken: token,
      channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    };
    lineClient = new Client(clientConfig);
  }
  return lineClient;
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

// Push message to a user
export async function pushMessage(
  userId: string,
  messages: ReplyMessage | ReplyMessage[]
): Promise<void> {
  await getLineClient().pushMessage(userId, Array.isArray(messages) ? messages : [messages]);
}

// Get user profile with error handling
export async function getUserProfile(userId: string): Promise<{
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
}> {
  try {
    return await getLineClient().getProfile(userId);
  } catch (error: any) {
    // Log the error for debugging
    console.error(`Failed to get profile for user ${userId}:`, error.message);
    
    // If it's a 404 error, return a default profile
    if (error.status === 404) {
      return {
        displayName: 'Unknown User',
        userId: userId,
        pictureUrl: undefined,
        statusMessage: undefined,
      };
    }
    
    // Re-throw other errors
    throw error;
  }
}

export default getLineClient;
