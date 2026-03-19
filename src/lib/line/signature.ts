import crypto from 'crypto';

/**
 * Validate LINE webhook signature
 * @param body - Raw request body string
 * @param signature - X-Line-Signature header value
 * @returns true if signature is valid
 */
export function validateSignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    throw new Error('LINE_CHANNEL_SECRET is not defined');
  }

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === signature;
}

/**
 * Generate signature for testing
 * @param body - Raw request body string
 * @returns Generated signature
 */
export function generateSignature(body: string): string {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    throw new Error('LINE_CHANNEL_SECRET is not defined');
  }

  return crypto
    .createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64');
}
