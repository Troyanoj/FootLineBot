import { Client, ClientConfig } from '@line/bot-sdk';

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

export const lineClient = new Client(clientConfig);

// Helper function to create a new LINE client instance (useful for testing)
export function createLineClient(accessToken: string): Client {
  return new Client({
    channelAccessToken: accessToken,
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  });
}

// Reply message types
export type ReplyMessage = {
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'imagemap' | 'flex' | 'template';
  [key: string]: unknown;
};

// Send reply message to a user
export async function replyMessage(
  replyToken: string,
  messages: ReplyMessage | ReplyMessage[]
): Promise<void> {
  await lineClient.replyMessage(replyToken, Array.isArray(messages) ? messages : [messages]);
}

// Push message to a user
export async function pushMessage(
  userId: string,
  messages: ReplyMessage | ReplyMessage[]
): Promise<void> {
  await lineClient.pushMessage(userId, Array.isArray(messages) ? messages : [messages]);
}

// Get user profile
export async function getUserProfile(userId: string): Promise<{
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
}> {
  return lineClient.getProfile(userId);
}

export default lineClient;
