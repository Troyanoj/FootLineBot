import { NextRequest, NextResponse } from 'next/server';
import { validateSignature } from '@/lib/line/signature';
import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
import {
  handleUserCommand,
  handleAdminCommand,
  HandlerContext,
  HandlerResult,
} from '@/lib/line/handlers';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import type { LineWebhookBody, LineWebhookEvent } from '@/types';
import * as msg from '@/lib/line/messages';

// ============================================================================
// Helper Functions
// ============================================================================

/** Parse command and arguments from text message */
function parseCommand(text: string): { command: string; args: string[] } | null {
  // Check if message starts with command prefix
  const trimmed = text.trim();
  const commandPrefix = /^(!|\/|！)/;
  
  if (!commandPrefix.test(trimmed)) {
    return null;
  }
  
  // Remove prefix and split by spaces
  const withoutPrefix = trimmed.replace(commandPrefix, '');
  const parts = withoutPrefix.split(/\s+/);
  
  if (parts.length === 0 || !parts[0]) {
    return null;
  }
  
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  return { command, args };
}

/** Check if user is admin (placeholder - checks group admin status) */
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await userService.findByLineUserId(userId);
    if (!user) return false;
    
    const groups = await groupService.getByUserId(user.id);
    for (const group of groups) {
      if (await groupService.isAdmin(group.id, user.id)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/** Get LINE user profile and ensure user exists in DB */
async function ensureUserExists(lineUserId: string): Promise<void> {
  try {
    let user = await userService.findByLineUserId(lineUserId);
    
    if (!user) {
      // Get LINE profile
      const lineProfile = await getUserProfile(lineUserId);
      
      // Create user with default values
      await userService.create({
        lineUserId,
        displayName: lineProfile.displayName,
        position1: 'CM', // Default position
      });
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

/** Send response to user via LINE */
async function sendResponse(replyToken: string, result: HandlerResult): Promise<void> {
  try {
    await replyMessage(replyToken, {
      type: 'text',
      text: result.message,
    });
  } catch (error) {
    console.error('Error sending response:', error);
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/** Handle follow event - user added LINE Official Account */
async function handleFollowEvent(event: LineWebhookEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;
  
  console.log(`User ${userId} followed the account`);
  
  try {
    // Ensure user exists in database
    await ensureUserExists(userId);
    
    // Get LINE profile for welcome message
    const lineProfile = await getUserProfile(userId);
    
    // Send welcome message (only if we have a reply token)
    if (event.replyToken) {
      await replyMessage(event.replyToken, {
        type: 'text',
        text: msg.welcomeMessage(lineProfile.displayName),
      });
    }
  } catch (error) {
    console.error('Error handling follow event:', error);
  }
}

/** Handle unfollow event - user blocked LINE Official Account */
async function handleUnfollowEvent(event: LineWebhookEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;
  
  console.log(`User ${userId} unfollowed the account`);
  
  // Could update user status in database if needed
  // For now, just log the event
}

/** Handle join event - bot added to group/room */
async function handleJoinEvent(event: LineWebhookEvent): Promise<void> {
  const groupId = event.source.groupId || event.source.roomId;
  console.log(`Bot joined group/room: ${groupId}`);
  
  // Send welcome message
  try {
    // Get the bot's display name
    const welcomeText = "สวัสดีครับ! ⚽ ผมคือ FootLineBot ผู้ช่วยจัดการแมตซ็อกเกอร์ฟุตบอลของคุณ\n\nใช้คำสั่งต่อไปนี้:\n• !help - ดูคำสั่งทั้งหมด\n• !register - ลงทะเบียนกลุ่มนี้\n• !ช่วย - ดูคำสั่งภาษาไทย\n\nยินดีช่วยจัดการแมตซ์ของคุณครับ!";
    
    // Note: In group chats, we need to use pushMessage instead of replyMessage
    // But we need a userId to push. For now, just log.
    console.log('Bot joined group, welcome message ready');
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

/** Handle leave event - bot removed from group/room */
async function handleLeaveEvent(event: LineWebhookEvent): Promise<void> {
  const groupId = event.source.groupId || event.source.roomId;
  console.log(`Bot left group/room: ${groupId}`);
  
  // Could clean up group data here
}

/** Handle message event - process user commands */
async function handleMessageEvent(event: LineWebhookEvent): Promise<void> {
  const { source, message, replyToken } = event;
  
  if (!source.userId || !message || message.type !== 'text' || !replyToken) {
    return;
  }
  
  const text = message.text?.trim() || '';
  const userId = source.userId;
  
  console.log(`Received message from ${userId}: ${text}`);
  
  // Parse command from message
  const parsed = parseCommand(text);
  
  if (!parsed) {
    // Not a command, could ignore or respond with help
    // For now, respond with help suggestion
    await replyMessage(replyToken, {
      type: 'text',
      text: 'Usa !ayuda para ver los comandos disponibles.',
    });
    return;
  }
  
  const { command, args } = parsed;
  
  // Check if user is admin for admin commands
  const isAdmin = await isUserAdmin(userId);
  
  // Determine if this is an admin command
  const adminCommands = [
    'crear_evento',
    'configurar',
    'tactica',
    'generar',
    'cerrar',
    'borrar_evento',
    'expulsar',
    'recurrente',
    'recurring',
    // Thai aliases
    'กลยุทธ์',
    'จัดทีม',
    'สร้าง',
    'ตั้งค่า',
    'ปิด',
    'ลบ',
  ];
  
  let result: HandlerResult;
  
  if (adminCommands.includes(command)) {
    // Handle admin command
    if (!isAdmin) {
      result = {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    } else {
      const context: HandlerContext = {
        userId,
        replyToken,
      };
      result = await handleAdminCommand(command, args, context);
    }
  } else {
    // Handle user command
    const context: HandlerContext = {
      userId,
      replyToken,
    };
    result = await handleUserCommand(command, args, context);
  }
  
  // Send response
  await sendResponse(replyToken, result);
}

/** Handle postback event - process quick reply actions */
async function handlePostbackEvent(event: LineWebhookEvent): Promise<void> {
  const { replyToken, postback } = event;
  
  if (!replyToken || !postback?.data) {
    return;
  }
  
  const data = postback.data;
  const userId = event.source.userId;
  
  console.log(`Received postback from ${userId}: ${data}`);
  
  // Parse postback data and handle accordingly
  // Example: action=register, eventId=xxx
  try {
    const params = new URLSearchParams(data);
    const action = params.get('action');
    
    if (action === 'register' && userId && replyToken) {
      // Handle quick reply registration
      const context: HandlerContext = {
        userId,
        replyToken,
      };
      const result = await handleUserCommand('apuntar', [], context);
      await sendResponse(replyToken, result);
    }
  } catch (error) {
    console.error('Error handling postback:', error);
  }
}

// ============================================================================
// Main Webhook Handler
// ============================================================================

/** Process individual webhook events */
async function handleWebhookEvent(event: LineWebhookEvent): Promise<void> {
  const { type, source } = event;
  
  // Only handle events from users (not from groups/rooms for now)
  if (source.type !== 'user') {
    console.log(`Skipping event from ${source.type}`);
    return;
  }
  
  switch (type) {
    case 'follow':
      await handleFollowEvent(event);
      break;
    
    case 'unfollow':
      await handleUnfollowEvent(event);
      break;
    
    case 'join':
      await handleJoinEvent(event);
      break;
    
    case 'leave':
      await handleLeaveEvent(event);
      break;
    
    case 'message':
      await handleMessageEvent(event);
      break;
    
    case 'postback':
      await handlePostbackEvent(event);
      break;
    
    default:
      console.log(`Unhandled event type: ${type}`);
  }
}

// ============================================================================
// Route Handlers
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get signature from header
    const signature = request.headers.get('x-line-signature');
    if (!signature) {
      console.error('Missing x-line-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    // Get raw body for signature validation
    const rawBody = await request.text();
    
    // Validate signature
    const isValid = validateSignature(rawBody, signature);
    if (!isValid) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse webhook body
    const body: LineWebhookBody = JSON.parse(rawBody);
    
    // Log received events
    console.log(`Received ${body.events.length} events from LINE`);
    
    // Process each event sequentially (to avoid rate limits)
    for (const event of body.events) {
      try {
        await handleWebhookEvent(event);
      } catch (error) {
        console.error('Error processing event:', error);
        // Continue with other events even if one fails
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'LINE callback endpoint',
    message: 'Send POST requests with LINE webhook events',
    endpoints: {
      POST: 'Process LINE webhook events',
      GET: 'This help message',
    },
  });
}
