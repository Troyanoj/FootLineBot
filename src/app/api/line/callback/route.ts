import { NextRequest, NextResponse } from 'next/server';
import { validateSignature } from '@/lib/line/signature';
import { replyMessage, pushMessage, getUserProfile, getGroupMemberProfile } from '@/lib/line/client';
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
  const trimmed = text.trim();
  const commandPrefix = /^(!|\/|！)/;

  if (!commandPrefix.test(trimmed)) {
    return null;
  }

  const withoutPrefix = trimmed.replace(commandPrefix, '').trim();
  // Remove zero-width characters and other invisible formatting characters that can cause comparison issues
  const cleaned = withoutPrefix.replace(/[\u200B-\u200D\uFEFF]/g, '');
  const parts = cleaned.split(/\s+/).filter(part => part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

/** Check if user is admin */
async function isUserAdmin(userId: string, groupId?: string): Promise<boolean> {
  try {
    console.log(`[DEBUG] Checking admin status for userId: ${userId}, groupId: ${groupId}`);
    const user = await userService.findByLineUserId(userId);

    if (!user) {
      console.log(`[DEBUG] User not found in database for LINE userId: ${userId}`);
      return false;
    }

    // First check database for admin status
    const groups = await groupService.getByUserId(user.id);
    
    for (const group of groups) {
      if (await groupService.isAdmin(group.id, user.id)) {
        console.log(`[DEBUG] User IS admin of group (DB): ${group.id}`);
        return true;
      }
    }

    // If not admin in DB, check LINE API for group admin status
    // Only do this if we have a groupId and user is a member of that specific group in DB
    if (groupId) {
      // Check if user is a member of this group in DB
      const group = await groupService.getGroupById(groupId);
      if (group) {
        const isMember = await groupService.isMember(group.id, user.id);
        if (isMember) {
          // User is a member, check if they should be admin
          // If adminUserId in DB matches this user, grant admin
          if (group.adminUserId === user.id) {
            console.log(`[DEBUG] User IS admin of group (DB adminUserId): ${group.id}`);
            return true;
          }
        }
        
        // If not admin in DB, try LINE API only if user is a member
        if (isMember) {
          console.log(`[DEBUG] Checking LINE API for admin status in group: ${groupId}`);
          try {
            const lineProfile = await getGroupMemberProfile(groupId, userId);
            
            if (lineProfile.role === 'admin') {
              console.log(`[INFO] User IS admin in LINE group: ${groupId}`);
              
              // Update member role to admin
              await groupService.updateMemberRole(group.id, user.id, 'admin');
              console.log(`[INFO] Updated user ${userId} to admin in group ${group.id}`);
              return true;
            }
          } catch (apiError) {
            console.warn(`[WARN] Could not check LINE API for admin status:`, apiError);
            // Don't fail - continue with DB check
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error(`[ERROR] Error in isUserAdmin:`, error);
    return false;
  }
}

/** Get LINE user profile and ensure user exists in DB */
async function ensureUserExists(lineUserId: string): Promise<void> {
  try {
    let user = await userService.findByLineUserId(lineUserId);

    if (!user) {
      const lineProfile = await getUserProfile(lineUserId);

      await userService.create({
        lineUserId,
        displayName: lineProfile.displayName,
        position1: 'CM',
      });
      console.log(`[INFO] Created new user: ${lineUserId}`);
    }
  } catch (error) {
    console.error('[ERROR] Error ensuring user exists:', error);
  }
}

/** Send response to user via LINE */
async function sendResponse(
  replyToken: string, 
  result: HandlerResult,
  context?: { 
    userId?: string; 
    groupId?: string; 
    isAdmin?: boolean; 
    lang?: 'es' | 'en' | 'th'
  }
): Promise<void> {
  try {
    const userType = context?.isAdmin ? 'admin' : (context?.userId ? 'normal' : 'unknown');
    const chatType = context?.groupId ? 'group' : '1:1';
    const userId = context?.userId || 'unknown';
    
    console.log(`[DEBUG] Sending reply to LINE [${userType}|${chatType}|${userId.substring(0, 8)}...] with token: ${replyToken?.substring(0, 10)}...`);
    await replyMessage(replyToken, {
      type: 'text',
      text: result.message,
    });
    console.log(`[DEBUG] Reply sent successfully [${userType}|${chatType}|${userId}]`);
  } catch (error) {
    const userType = context?.isAdmin ? 'admin' : (context?.userId ? 'normal' : 'unknown');
    const chatType = context?.groupId ? 'group' : '1:1';
    const userId = context?.userId || 'unknown';
    
    console.error(`[ERROR] Failed to send response [${userType}|${chatType}|${userId}]:`, {
      error: error?.message || 'Unknown error',
      status: error?.status,
      statusCode: error?.statusCode,
      code: error?.code,
      timestamp: new Date().toISOString()
    });
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
  if (!groupId) {
    console.log('[DEBUG] [JoinEvent] Bot joined but no groupId/roomId found');
    return;
  }
  
  console.log(`[INFO] [JoinEvent] Bot joined group/room: ${groupId}`);

  // AUTO-REGISTER GROUP IN DATABASE
  try {
    // Check if group already exists in DB
    const existingGroup = await groupService.getGroupById(groupId);

    if (!existingGroup) {
      // Group doesn't exist - create it automatically with lineGroupId
      const autoGroupName = `Football Group ${groupId.substring(0, 8)}`;

      // First, ensure we have a system placeholder user
      let systemUser = await userService.findByLineUserId('system-placeholder');
      if (!systemUser) {
        systemUser = await userService.create({
          lineUserId: 'system-placeholder',
          displayName: 'System Placeholder',
          position1: 'CM',
        });
      }

      // Create the group with NO admin initially
      // The first admin to use !setup will become the admin
      const newGroup = await groupService.createGroup(
        autoGroupName,
        systemUser.id, // Use system user as creator (not admin)
        'Auto-registered',
        '7',
        undefined, // internal id (uuid will be generated)
        groupId    // lineGroupId for push notifications
      );

      // Don't set admin - leave adminUserId as null so first !setup becomes admin
      console.log(`[INFO] [JoinEvent] Auto-registered group: ${newGroup.id} (${newGroup.name}) with lineGroupId: ${groupId}, adminUserId: null`);

      // Send welcome message to the group using pushMessage
      try {
        const welcomeMessage = {
          type: 'text' as const,
          text: `🎉 Welcome to FootLine Bot!\n\n` +
                `Your group has been registered with ID: ${groupId.substring(0, 8)}\n\n` +
                `📋 *Quick Start:*\n` +
                `1. Admin: Use !setup to claim admin rights\n` +
                `2. Players: Use !join ${groupId.substring(0, 8)} to join\n` +
                `3. Admin: Use !create_event to create a match\n` +
                `4. Players: Use !register to sign up\n\n` +
                `Type !help for all commands.`
        };

        // Push message to the group
        await pushMessage(groupId, welcomeMessage);
        console.log(`[INFO] [JoinEvent] Welcome message sent to group ${groupId}`);
      } catch (msgError) {
        console.error(`[ERROR] [JoinEvent] Failed to send welcome message:`, msgError);
      }
    } else {
      console.log(`[INFO] [JoinEvent] Group already exists: ${existingGroup.name}`);
      
      // Update lineGroupId if it's missing
      if (!existingGroup.lineGroupId) {
        await groupService.update(existingGroup.id, { lineGroupId: groupId });
        console.log(`[INFO] [JoinEvent] Updated lineGroupId for existing group: ${existingGroup.id}`);
      }
    }
  } catch (error: any) {
    // Ignore duplicate group errors - this is expected if bot leaves/joins multiple times
    if (error?.code === 'DUPLICATE_GROUP' || error?.message?.includes('already exists')) {
      console.log(`[DEBUG] [JoinEvent] Group already registered, ignoring duplicate`);
    } else {
      console.error(`[ERROR] [JoinEvent] Error auto-registering group:`, error);
    }
    // Don't fail the event - just log the error
  }
}

/** Handle leave event - bot removed from group/room */
async function handleLeaveEvent(event: LineWebhookEvent): Promise<void> {
  const groupId = event.source.groupId || event.source.roomId;
  console.log(`[INFO] Bot left group/room: ${groupId}`);
}

/** Handle message event - process user commands */
async function handleMessageEvent(event: LineWebhookEvent): Promise<void> {
  const { source, message, replyToken } = event;

  // DEBUG: Log full source object to diagnose groupId issues
  console.log('[INFO] === WEBHOOK DEBUG ===');
  console.log('[INFO] Source type:', event.source.type);
  console.log('[INFO] Source groupId:', (event.source as any).groupId);
  console.log('[INFO] Source roomId:', (event.source as any).roomId);
  console.log('[INFO] Source userId:', event.source.userId);
  console.log('[INFO] Reply token present:', !!replyToken);

  if (!source.userId || !message || message.type !== 'text' || !replyToken) {
    console.warn(`[WARN] Missing required fields for message event`, {
      hasUserId: !!source.userId,
      hasMessage: !!message,
      messageType: message?.type,
      hasReplyToken: !!replyToken,
    });
    return;
  }

  const text = message.text?.trim() || '';
  const userId = source.userId;
  const groupId = source.groupId || source.roomId || undefined;

  // ENSURE GROUP EXISTS IN DATABASE (handle race conditions where join event hasn't been fully processed)
  // AND AUTO-ADD USER AS MEMBER IF NEEDED
  if (groupId) {
    try {
      // First, ensure the user exists in our database
      let user = await userService.findByLineUserId(userId);
      if (!user) {
        const lineProfile = await getUserProfile(userId);
        user = await userService.create({
          lineUserId: userId,
          displayName: lineProfile.displayName,
          position1: 'CM', // Default position
        });
        console.log(`[INFO] Created new user: ${userId}`);
      }
      
      // Use internal user ID for group operations
      const internalUserId = user.id;
      
      // Check if group exists in our database
      const existingGroup = await groupService.getGroupById(groupId);
      
      if (!existingGroup) {
        console.log(`[INFO] Group ${groupId} not found in DB, creating it now...`);
        
        // First, ensure we have a system placeholder user
        let systemUser = await userService.findByLineUserId('system-placeholder');
        if (!systemUser) {
          systemUser = await userService.create({
            lineUserId: 'system-placeholder',
            displayName: 'System Placeholder',
            position1: 'CM',
          });
        }
        
        // Create the group with system placeholder as temporary admin
        const autoGroupName = `Football Group ${groupId.substring(0, 8)}`;
        const newGroup = await groupService.createGroup(
          autoGroupName,
          systemUser.id,
          'Auto-registered',
          '7',
          undefined, // internal id (uuid will be generated)
          groupId    // lineGroupId for push notifications
        );
        
        console.log(`[INFO] [MessageEvent] Auto-created group: ${newGroup.id} (${newGroup.name}) with lineGroupId: ${groupId}`);
        
        // Send welcome message to the group using pushMessage
        try {
          const welcomeMessage = {
            type: 'text' as const,
            text: `🎉 Welcome to FootLine Bot!\n\n` +
                  `Your group has been registered with ID: ${groupId.substring(0, 8)}\n\n` +
                  `📋 *Quick Start:*\n` +
                  `1. Admin: Use !setup to claim admin rights\n` +
                  `2. Players: Use !join ${groupId.substring(0, 8)} to join\n` +
                  `3. Admin: Use !create_event to create a match\n` +
                  `4. Players: Use !register to sign up\n\n` +
                  `Type !help for all commands.`,
          };
          
          // Push message to the group
          await pushMessage(groupId, welcomeMessage);
          console.log(`[INFO] [MessageEvent] Welcome message sent to group ${groupId}`);
        } catch (msgError) {
          console.error(`[ERROR] [MessageEvent] Failed to send welcome message:`, msgError);
        }
      } else {
        // Group exists, check if user is already a member
        const isMember = await groupService.isMember(groupId, internalUserId);
        if (!isMember) {
          // Add user as a regular member (skip user check since we already verified the user exists)
          await groupService.addMemberToGroup(existingGroup.id, internalUserId, 'member', true);
          console.log(`[INFO] Auto-added user ${userId} as member to group ${groupId}`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] Failed to ensure group exists or add user as member:`, error);
      // Continue processing even if this fails
    }
  }

  console.log(`[DEBUG] Processing message: "${text.substring(0, 50)}" from userId: ${userId}`);

  // Parse command from message
  const parsed = parseCommand(text);

  if (!parsed) {
    // Not a command - ignore the message completely
    console.log(`[DEBUG] Ignoring non-command message: "${text.substring(0, 50)}"`);
    return;
  }

  const { command, args } = parsed;
  console.log(`[INFO] Command received: ${command}, args: ${args.length}`);

  // Check if user is admin for admin commands
  const isAdmin = await isUserAdmin(userId, groupId);

  // Determine language based on command keywords
  // Spanish commands
  const spanishCommands = [
    'apuntar', 'inscribirme', 'baja', 'desinscribirme', 'perfil', 'alineacion', 'horario', 'grupos', 'unirse',
    'posicion', 'ayuda', 'crear_evento', 'configurar', 'tactica', 'generar', 'cerrar', 'borrar_evento', 'expulsar',
    'recurrente', 'borrar_grupo', 'iniciar', 'setup', 'config_group', 'start'
  ];
  
  // English commands
  const englishCommands = [
    'register', 'unregister', 'profile', 'lineup', 'schedule', 'groups_list', 'join',
    'position', 'help', 'create_event', 'config', 'tactics', 'generate', 'close', 'delete_event', 'kick',
    'recurring', 'recurring_events', 'delete_group', 'delete-group', 'setup', 'config_group', 'start'
  ];
  
  // Thai commands
  const thaiCommands = [
    'ลงทะเบียน', 'สมัคร', 'ยกเลิก', 'โปรไฟล์', 'รายชื่อ', 'ไลน์อัพ', 'อีเวนต์', 'ตาราง', 'กลุ่ม', 'เข้าร่วม',
    'ตำแหน่ง', 'ช่วย', 'สร้าง', 'ตั้งค่า', 'กลยุทธ์', 'จัดทีม', 'ปิด', 'ลบ', 'ลบกลุ่ม', 'เริ่มต้น', 'เริ่ม'
  ];

  let lang: 'es' | 'en' | 'th' = 'th'; // Default to Thai
  
  // Check language based on command - ORDER MATTERS: EN first, then ES, then TH
  // This ensures !setup in English gets English response, not Spanish
  if (englishCommands.includes(command)) {
    lang = 'en';
  } else if (spanishCommands.includes(command)) {
    lang = 'es';
  } else if (thaiCommands.includes(command)) {
    lang = 'th';
  }

  // Define admin commands in all languages
  const adminCommands = [
    // Spanish
    'crear_evento', 'configurar', 'tactica', 'táctica', 'generar', 'cerrar', 'borrar_evento', 'expulsar',
    'recurrente', 'borrar_grupo',
    // English
    'create_event', 'config', 'tactics', 'generate', 'close', 'delete_event', 'kick',
    'recurring', 'recurring_events', 'delete_group', 'delete-group',
    // Thai
    'สร้าง', 'ตั้งค่า', 'กลยุทธ์', 'ปิด', 'ลบ', 'ลบกลุ่ม', 'เริ่มต้น'
  ];

  // Group setup commands - These should NOT require admin status because they're used to CLAIM admin rights
  const groupSetupCommands = [
    'setup', 'config_group', 'iniciar', 'iniciar_grupo', 'เริ่มต้น', 'ลงทะเบียนกลุ่ม'
  ];

  // User commands for registering to events (NOT admin-only)
  const userEventCommands = [
    // Spanish
    'apuntar', 'inscribirme', 'baja', 'desinscribirme',
    // English  
    'register', 'unregister',
    // Thai
    'ลงทะเบียน', 'สมัคร', 'ยกเลิก'
  ];

  console.log(`[DEBUG] Language detected: ${lang}, isAdmin: ${isAdmin}, command: ${command}`);

  // Initialize context that will be used throughout the function
  const context: HandlerContext & { lang: 'es' | 'en' | 'th' } = {
    userId,
    groupId,
    replyToken,
    lang,
  };
  
  let result: HandlerResult;
  
  // Check if it's a group setup command - these should NOT require admin status initially
  // because they're used to CLAIM admin rights
  if (groupSetupCommands.includes(command)) {
    // For group setup commands, we still check LINE API to see if user is actually admin in the group
    // If they are, we grant them admin rights
    result = await handleUserCommand(command, args, context);
  } else if (adminCommands.includes(command) && !userEventCommands.includes(command)) {
    // Handle admin command
    if (!isAdmin) {
      const msgFile = lang === 'es' ? msgEs : (lang === 'en' ? msgEn : msgTh);
      result = {
        success: false,
        message: msgFile.adminRequiredMessage(),
      };
      console.warn(`[WARN] Admin command ${command} rejected for non-admin user ${userId}`);
    } else {
      result = await handleAdminCommand(command, args, context);
    }
  } else {
    // Handle user command (including event registration)
    result = await handleUserCommand(command, args, context);
  }

  // Send response
  console.log(`[DEBUG] Sending response: success=${result.success}`);
  await sendResponse(replyToken, result, context);
}

/** Handle postback event - process quick reply actions */
async function handlePostbackEvent(event: LineWebhookEvent): Promise<void> {
  const { replyToken, postback } = event;

  if (!replyToken || !postback?.data) {
    return;
  }

  const data = postback.data;
  const userId = event.source.userId;
  const groupId = event.source.groupId || event.source.roomId || undefined;

  console.log(`[DEBUG] Received postback from ${userId}: ${data}`);

  // Parse postback data and handle accordingly
  try {
    const params = new URLSearchParams(data);
    const action = params.get('action');

    if (action === 'register' && userId && replyToken) {
      // Handle quick reply registration - default to Thai language
      const context: HandlerContext & { lang: 'es' | 'en' | 'th' } = {
        userId,
        groupId,
        replyToken,
        lang: 'th', // Default to Thai for postbacks
      };
      const result = await handleUserCommand('register', [], context);
      await sendResponse(replyToken, result, context);
    }
  } catch (error) {
    console.error('[ERROR] Error handling postback:', error);
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
