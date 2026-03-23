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
import * as msgTh from '@/lib/line/messages';
import * as msgEs from '@/lib/line/messages.es';
import * as msgEn from '@/lib/line/messages.en';

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
    console.log(`[DEBUG] Checking admin status for userId: ${userId}`);
    const user = await userService.findByLineUserId(userId);
    
    if (!user) {
      console.log(`[DEBUG] User not found in database for LINE userId: ${userId}`);
      return false;
    }
    
    console.log(`[DEBUG] User found: ${user.id}, ${user.displayName}`);
    const groups = await groupService.getByUserId(user.id);
    console.log(`[DEBUG] User is member of ${groups.length} groups`);
    
    for (const group of groups) {
      console.log(`[DEBUG] Checking if user is admin of group: ${group.id}, ${group.name}`);
      if (await groupService.isAdmin(group.id, user.id)) {
        console.log(`[DEBUG] User IS admin of group: ${group.id}`);
        return true;
      }
    }
    console.log(`[DEBUG] User is NOT admin of any group`);
    return false;
  } catch (error) {
    console.error(`[DEBUG] Error in isUserAdmin:`, error);
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
    console.log(`[DEBUG] Sending reply to LINE with token: ${replyToken?.substring(0, 10)}...`);
    await replyMessage(replyToken, {
      type: 'text',
      text: result.message,
    });
    console.log(`[DEBUG] Reply sent successfully`);
  } catch (error) {
    console.error('[DEBUG] Error sending response:', error);
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
        text: msgTh.welcomeMessage(lineProfile.displayName),
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
    console.log(`[DEBUG] Missing required fields: userId=${!!source.userId}, message=${!!message}, type=${message?.type}, replyToken=${!!replyToken}`);
    return;
  }
  
  // DEBUG: Log raw message object to diagnose undefined command issue
  console.log(`[DEBUG] Raw message object:`, JSON.stringify(message));
  console.log(`[DEBUG] message.text type: ${typeof message.text}, value: ${message.text}`);
  
  const text = message.text?.trim() || '';
  const userId = source.userId;
  const groupId = source.groupId || source.roomId || undefined;
  
  console.log(`[DEBUG] Processed text: "${text}", userId: ${userId}, groupId: ${groupId}`);
  
  // Parse command from message
  const parsed = parseCommand(text);
  
  // DEBUG: Log parse result
  console.log(`[DEBUG] parseCommand result:`, parsed);
  
  if (!parsed) {
    // Not a command - ignore the message completely
    // The bot should only respond to commands that start with ! or /
    console.log(`[DEBUG] Ignoring non-command message: "${text}"`);
    return;
  }
  
  const { command, args } = parsed;
  
  console.log(`[DEBUG] Command: ${command}, Args: ${JSON.stringify(args)}`);
  
  // Check if user is admin for admin commands
  const isAdmin = await isUserAdmin(userId);
  console.log(`[DEBUG] isAdmin result: ${isAdmin}`);
  
  // Determine if this is an admin command
  const adminCommands = [
    'crear_evento', 'configurar', 'tactica', 'generar', 'cerrar', 'borrar_evento', 'expulsar', 'recurrente', 'recurring', 'borrar_grupo',
    'กลยุทธ์', 'จัดทีม', 'สร้าง', 'ตั้งค่า', 'ปิด', 'ลบ', 'ลบกลุ่ม',
    'create_event', 'config', 'tactics', 'generate', 'close', 'delete_event', 'kick', 'recurring_events', 'delete_group', 'delete-group'
  ];
  
  // Check if it's a Spanish command based on keywords
  const isSpanish = [
    'crear_evento', 'configurar', 'tactica', 'generar', 'cerrar', 'borrar_evento', 'expulsar', 'recurrente', 'recurring', 'borrar_grupo',
    'ayuda', 'apuntar', 'inscribirme', 'baja', 'desinscribirme', 'perfil', 'alineacion', 'horario', 'grupos', 'unirse',
    'posicion', 'iniciar',
  ].includes(command);

  const isEnglish = [
    'create_event', 'config', 'tactics', 'generate', 'close', 'delete_event', 'kick', 'recurring_events', 'delete_group', 'delete-group',
    'help', 'register', 'unregister', 'profile', 'lineup', 'schedule', 'groups_list', 'join',
    'position', 'setup', 'config_group',
  ].includes(command);
  
  let lang: 'es' | 'en' | 'th' = 'th';
  if (isSpanish) lang = 'es';
  else if (isEnglish) lang = 'en';
  
  let result: HandlerResult;
  if (adminCommands.includes(command)) {
    // Handle admin command
    if (!isAdmin) {
      const msgFile = lang === 'es' ? msgEs : (lang === 'en' ? msgEn : msgTh);
      result = {
        success: false,
        message: msgFile.adminRequiredMessage(),
      };
    } else {
      const context: HandlerContext & { lang: 'es' | 'en' | 'th' } = {
        userId,
        groupId,
        replyToken,
        lang,
      };
      console.log(`[DEBUG] Admin context: userId=${userId}, groupId=${groupId}`);
      result = await handleAdminCommand(command, args, context as any);
    }
  } else {
    // Handle user command
    const context: HandlerContext & { lang: 'es' | 'en' | 'th' } = {
      userId,
      groupId,
      replyToken,
      lang,
    };
    console.log(`[DEBUG] User context: userId=${userId}, groupId=${groupId}`);
    result = await handleUserCommand(command, args, context as any);
  }
  
  // Send response
  console.log(`[DEBUG] Sending response: success=${result.success}, message=${result.message.substring(0, 100)}...`);
  await sendResponse(replyToken, result);
  console.log(`[DEBUG] Response sent`);
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
  
  console.log(`Processing event: ${type} from ${source.type}`);
  
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
    // Log all headers for debugging
    console.log('=== LINE Webhook Called ===');
    console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
    
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
    console.log('Raw body:', rawBody);
    console.log('Signature:', signature);
    console.log('Channel secret:', process.env.LINE_CHANNEL_SECRET ? 'present' : 'MISSING');
    
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
