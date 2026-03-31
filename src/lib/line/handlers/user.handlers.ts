// User Command Handlers
// Handles all user-facing commands for LINE bot

import { replyMessage, pushMessage, getUserProfile, getGroupMemberProfile } from '@/lib/line/client';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import { eventService } from '@/services/event.service';
import { registrationService } from '@/services/registration.service';
import { lineupService } from '@/services/lineup.service';
import * as msgTh from '@/lib/line/messages';
import * as msgEs from '@/lib/line/messages.es';
import * as msgEn from '@/lib/line/messages.en';
import type { User, Group, Event, Position } from '@/types';
import prisma from '@/lib/db/prisma';
import { isValidPosition, getPositionName, VALID_POSITIONS } from '@/lib/positions';


const getMsg = (context: any) => {
  if (!context || !context.lang) {
    // Default to Thai if no lang is provided
    return msgTh;
  }
  return context.lang === 'es' ? msgEs : (context.lang === 'en' ? msgEn : msgTh);
};

// Context passed to all handlers
export interface HandlerContext {
  lang?: "es" | "en" | "th";
  userId: string;
  groupId?: string;
  replyToken: string;
}

// Result of handler execution
export interface HandlerResult {
  success: boolean;
  message: string;
  shouldFollowUp?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Get or create user from LINE user ID */
async function getOrCreateUser(lineUserId: string): Promise<User> {
  let user = await userService.findByLineUserId(lineUserId);
  
  try {
    // Get the current LINE profile to ensure we have the latest display name
    const lineProfile = await getUserProfile(lineUserId);
    
    // If LINE profile returns empty display name or 'Unknown User', use LINE user ID as fallback
    const isLineProfileInvalid = !lineProfile.displayName || lineProfile.displayName === "Unknown User";
    const displayNameFromProfile = isLineProfileInvalid ? lineUserId : lineProfile.displayName;
    
    if (!user) {
      // Create new user with LINE profile data
      user = await userService.create({
        lineUserId,
        displayName: displayNameFromProfile,
        position1: 'CM', // Default position
      });
    } else {
      // Always update display name if we got a valid profile from LINE (unless it's already correct)
      // This ensures we fix any corrupted data in the database
      if (!isLineProfileInvalid && user.displayName !== lineProfile.displayName) {
        await userService.update(user.id, {
          displayName: lineProfile.displayName
        });
        // Refresh the user object
        user = await userService.findByLineUserId(lineUserId);
      } 
      // If LINE profile is invalid but user has invalid display name, fix it
      else if (isLineProfileInvalid && (!user.displayName || user.displayName === "Unknown User")) {
        await userService.update(user.id, {
          displayName: lineUserId
        });
        // Refresh the user object
        user = await userService.findByLineUserId(lineUserId);
      }
      // If LINE profile is invalid and user has valid display name, keep user's display name
    }
  } catch (error) {
    // If we can't get the LINE profile, use existing user data or create with default
    if (!user) {
      // If user doesn't exist and we can't get LINE profile, create with LINE ID as fallback name
      user = await userService.create({
        lineUserId,
        displayName: lineUserId, // Use LINE user ID as fallback instead of empty string
        position1: 'CM', // Default position
      });
    } else {
      // If user exists but we can't get LINE profile, 
      // update displayName if it's invalid (empty or "Unknown User")
      if (!user.displayName || user.displayName === "Unknown User") {
        await userService.update(user.id, {
          displayName: lineUserId
        });
        // Refresh the user object
        user = await userService.findByLineUserId(lineUserId);
      }
      // If displayName is already valid, we keep it as is
    }
  }
  
  return user;
}

/** Get user's groups */
async function getUserGroups(userId: string): Promise<Group[]> {
  return groupService.getByUserId(userId);
}

/** Get current open event for a group */
async function getCurrentOpenEvent(groupId: string): Promise<Event | null> {
  const events = await eventService.getUpcomingByGroupId(groupId);
  return events.find((e) => e.status === 'open') || null;
}

// ============================================================================
// User Commands
// ============================================================================

/**
 * Handle !apuntar / Inscribirme command
 * Register user for current open event
 */
export async function handleApuntar(context: HandlerContext): Promise<HandlerResult> {
  try {
    // Get or create user
    const user = await getOrCreateUser(context.userId);
    
    // Get user's groups
    const groups = await getUserGroups(user.id);
    
    if (groups.length === 0) {
      return {
        success: false,
        message: getMsg(context).notInGroupMessage(),
      };
    }
    
    // Find current open event in any of user's groups
    let openEvent: Event | null = null;
    for (const group of groups) {
      openEvent = await getCurrentOpenEvent(group.id);
      if (openEvent) break;
    }
    
    if (!openEvent) {
      return {
        success: false,
        message: getMsg(context).noOpenEventMessage(),
      };
    }
    
    // Check if already registered
    const isRegistered = await registrationService.isRegistered(openEvent.id, user.id);
    if (isRegistered) {
      return {
        success: false,
        message: getMsg(context).alreadyRegisteredMessage(),
      };
    }
    
    // Register for event
    const result = await registrationService.register({
      eventId: openEvent.id,
      userId: user.id,
    });
    
    // Check if registered or waitlisted
    const isWaitlisted = result.status === 'waitlisted';
    
    return {
      success: true,
      message: isWaitlisted 
        ? getMsg(context).waitlistSuccessMessage(openEvent)
        : getMsg(context).registrationSuccessMessage(openEvent),
    };
  } catch (error: any) {
    // Handle already registered error gracefully
    if (error?.code === 'ALREADY_REGISTERED') {
      return {
        success: false,
        message: getMsg(context).alreadyRegisteredMessage(),
      };
    }
    console.error('Error in handleApuntar:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !baja / Desinscribirme command
 * Unregister user from current event
 */
export async function handleBaja(context: HandlerContext): Promise<HandlerResult> {
  try {
    const user = await userService.findByLineUserId(context.userId);
    
    if (!user) {
      return {
        success: false,
        message: getMsg(context).notRegisteredMessage(),
      };
    }
    
    // Get user's groups
    const groups = await getUserGroups(user.id);
    
    if (groups.length === 0) {
      return {
        success: false,
        message: getMsg(context).notInGroupMessage(),
      };
    }
    
    // Find current open event in any of user's groups
    let openEvent: Event | null = null;
    for (const group of groups) {
      openEvent = await getCurrentOpenEvent(group.id);
      if (openEvent) break;
    }
    
    if (!openEvent) {
      return {
        success: false,
        message: getMsg(context).noOpenEventMessage(),
      };
    }
    
    // Check if registered
    const registration = await registrationService.getByEventAndUser(openEvent.id, user.id);
    if (!registration) {
      return {
        success: false,
        message: getMsg(context).notRegisteredMessage(),
      };
    }
    
    // Cancel registration
    await registrationService.cancel(registration.id);
    
    // Delete existing lineups for this event so admin must regenerate with current registrations
    await prisma.lineup.deleteMany({ where: { eventId: openEvent.id } });
    await prisma.teamAssignment.deleteMany({ where: { eventId: openEvent.id } });
    
    return {
      success: true,
      message: getMsg(context).registrationCancelledMessage(openEvent),
    };
  } catch (error) {
    console.error('Error in handleBaja:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !perfil command
 * Show user profile
 */
export async function handlePerfil(context: HandlerContext): Promise<HandlerResult> {
  try {
    const user = await getOrCreateUser(context.userId);
    const groups = await getUserGroups(user.id);
    
    return {
      success: true,
      message: getMsg(context).profileMessage(user, groups),
    };
  } catch (error) {
    console.error('Error in handlePerfil:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !alineacion command
 * Show user's lineup for current event
 */
export async function handleAlineacion(context: HandlerContext): Promise<HandlerResult> {
  try {
    const user = await userService.findByLineUserId(context.userId);
    
    if (!user) {
      return {
        success: false,
        message: getMsg(context).errorMessage(),
      };
    }
    
    // Get user's groups
    const groups = await getUserGroups(user.id);
    
    if (groups.length === 0) {
      return {
        success: false,
        message: getMsg(context).notInGroupMessage(),
      };
    }
    
    // Find current event in any of user's groups
    let currentEvent: Event | null = null;
    for (const group of groups) {
      currentEvent = await getCurrentOpenEvent(group.id);
      if (!currentEvent) {
        // Check for in_progress events
        const events = await eventService.getUpcomingByGroupId(group.id);
        currentEvent = events.find((e) => e.status === 'in_progress') || null;
      }
      if (currentEvent) break;
    }
    
    if (!currentEvent) {
      return {
        success: false,
        message: getMsg(context).noEventsMessage(),
      };
    }
    
    // Get lineup
    const teamAssignments = await lineupService.getTeamAssignments(currentEvent.id);
    const lineups = await lineupService.getByEventId(currentEvent.id);
    
    // Verify user is currently registered for this event (not cancelled)
    const currentRegistration = await registrationService.getByEventAndUser(currentEvent.id, user.id);
    if (!currentRegistration || currentRegistration.status !== 'registered') {
      return {
        success: false,
        message: getMsg(context).notRegisteredMessage(),
      };
    }
    
    // Fetch user names for all players in teamAssignments
    const allPlayerIds = Array.from(new Set(
      teamAssignments.flatMap(ta => [...ta.playerIds, ...ta.substitutes])
    ));
    
    // Fetch LINE profiles for all players and update their display names if needed
    const users = await userService.getUsersByIds(allPlayerIds);
    const userNameMap: Record<string, string> = {};
    
    // Check if display name is a fallback (lineUserId or invalid)
    const isDisplayNameInvalid = (name: string | undefined, lineUserId: string): boolean => {
      return !name || name === "Unknown User" || name === lineUserId;
    };
    
    // Helper to get LINE profile with fallback to group profile
    const getDisplayName = async (player: typeof users[0], groupId?: string): Promise<string> => {
      // If current display name is valid, use it
      if (!isDisplayNameInvalid(player.displayName, player.lineUserId)) {
        return player.displayName;
      }
      
      // Try to get LINE profile
      try {
        const lineProfile = await getUserProfile(player.lineUserId);
        if (lineProfile.displayName && lineProfile.displayName !== "Unknown User") {
          return lineProfile.displayName;
        }
      } catch (error) {
        // Continue to try group profile
      }
      
      // Try to get group member profile if we have a groupId
      if (groupId) {
        try {
          const groupProfile = await getGroupMemberProfile(groupId, player.lineUserId);
          if (groupProfile.displayName && groupProfile.displayName !== "Unknown User") {
            return groupProfile.displayName;
          }
        } catch (error) {
          // Both methods failed
        }
      }
      
      // Return original displayName or fallback
      return player.displayName || `Player ${player.id.substring(0, 6)}`;
    };
    
    for (const player of users) {
      const displayName = await getDisplayName(player, context.groupId);
      userNameMap[player.id] = displayName;
    }

    if (teamAssignments.length === 0) {
      return {
        success: false,
        message: getMsg(context).noLineupMessage(),
      };
    }
    
    return {
      success: true,
      message: getMsg(context).lineupMessage(currentEvent, teamAssignments, lineups, user.id, userNameMap),
    };
  } catch (error) {
    console.error('Error in handleAlineacion:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !horario command
 * Show event schedule
 */
export async function handleHorario(context: HandlerContext): Promise<HandlerResult> {
  try {
    const user = await userService.findByLineUserId(context.userId);
    
    // Get all groups if user exists, otherwise get all groups
    let groups: Group[];
    if (user) {
      groups = await getUserGroups(user.id);
    } else {
      groups = await groupService.getAll();
    }
    
    if (groups.length === 0) {
      return {
        success: true,
        message: getMsg(context).scheduleMessage([]),
      };
    }
    
    // Get events from all groups
    const allEvents: Event[] = [];
    for (const group of groups) {
      const events = await eventService.getUpcomingByGroupId(group.id);
      allEvents.push(...events);
    }
    
    // Sort by date
    allEvents.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    
    // Limit to next 10 events
    const upcomingEvents = allEvents.slice(0, 10);
    
    return {
      success: true,
      message: getMsg(context).scheduleMessage(upcomingEvents),
    };
  } catch (error) {
    console.error('Error in handleHorario:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !grupos command
 * List available groups
 */
export async function handleGrupos(context: HandlerContext): Promise<HandlerResult> {
  try {
    const groups = await groupService.getAll();
    
    return {
      success: true,
      message: getMsg(context).groupsListMessage(groups),
    };
  } catch (error) {
    console.error('Error in handleGrupos:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !unirse [groupId] command
 * Join a group
 */
export async function handleUnirse(context: HandlerContext, groupId: string): Promise<HandlerResult> {
  try {
    if (!groupId) {
      return {
        success: false,
        message: getMsg(context).invalidParametersMessage('unirse'),
      };
    }
    
    // Get or create user
    const user = await getOrCreateUser(context.userId);

    // Check if group exists (supports both internal ID and LINE group ID)
    const group = await groupService.findById(groupId);

    if (!group) {
      // Get user's groups to show available options
      const userGroups = await groupService.getByUserId(user.id);
      
      let helpText = '';
      if (userGroups.length > 0) {
        helpText = `\n\n📋 *Tus grupos disponibles:*\n` + 
          userGroups.map((g, i) => `${i + 1}. ${g.name} (ID: ${g.id.substring(0, 8)})`).join('\n');
      } else {
        helpText = `\n\n💡 *Consejo:* Usa !groups_list para ver tus grupos disponibles.`;
      }
      
      return {
        success: false,
        message: getMsg(context).groupNotFoundMessage(groupId) + helpText,
      };
    }
    
    // Check if already a member
    const isMember = await groupService.isMember(group.id, user.id);
    if (isMember) {
      return {
        success: false,
        message: getMsg(context).alreadyMemberMessage(group.name),
      };
    }
    
    // Add user to group using the actual group ID from database
    await groupService.addMember(group.id, user.id, 'member');
    
    return {
      success: true,
      message: getMsg(context).joinedGroupMessage(group),
    };
  } catch (error: any) {
    console.error('[ERROR] Error in handleUnirse:', error);
    
    // Handle specific error cases
    if (error?.statusCode === 404 || error?.code === 'GROUP_NOT_FOUND') {
      return {
        success: false,
        message: getMsg(context).groupNotFoundMessage(groupId),
      };
    }
    
    if (error?.code === 'ALREADY_MEMBER' || error?.message?.includes('already a member')) {
      return {
        success: false,
        message: 'ℹ️ *Ya eres miembro de este grupo*',
      };
    }
    
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !ayuda / !help command
 * Show help message
 */
export async function handleAyuda(context: HandlerContext): Promise<HandlerResult> {
  return {
    success: true,
    message: getMsg(context).helpMessage(),
  };
}

/**
 * Handle !start command
 * Welcome message for new users
 */
export async function handleStart(context: HandlerContext): Promise<HandlerResult> {
  try {
    const lineProfile = await getUserProfile(context.userId);
    return {
      success: true,
      message: getMsg(context).welcomeMessage(lineProfile.displayName),
    };
  } catch (error) {
    console.error('Error in handleStart:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Main user command dispatcher
 */
export async function handleUserCommand(
  command: string,
  args: string[],
  context: HandlerContext
): Promise<HandlerResult> {
  console.log(`[DEBUG] Received command: "${command}", args: ${JSON.stringify(args)}, lang: ${context.lang}`);

  const normalizedCommand = command.toLowerCase().replace(/^!/, '');

  switch (normalizedCommand) {
    // ============================================================
    // EVENT REGISTRATION COMMANDS (All users, NOT admin-only)
    // IMPORTANT: !register is for EVENT registration, NOT group setup
    // ============================================================
    case 'apuntar':
    case 'inscribirme':
    case 'register':  // This is for EVENT registration (English)
    case 'ลงทะเบียน':
    case 'สมัคร':
      return handleApuntar(context);

    // ============================================================
    // GROUP SETUP COMMANDS (Admin-only, for registering group)
    // ============================================================
    case 'setup':
    case 'config_group':
    case 'iniciar':
    case 'iniciar_grupo':
    case 'เริ่มต้น':
    case 'ลงทะเบียนกลุ่ม':
      return handleRegisterGroup(context);

    // ============================================================
    // UNREGISTER COMMANDS
    // ============================================================
    case 'baja':
    case 'desinscribirme':
    case 'unregister':
    case 'ยกเลิก':
      return handleBaja(context);

    // ============================================================
    // PROFILE & POSITION COMMANDS
    // ============================================================
    case 'perfil':
    case 'profile':
    case 'โปรไฟล์':
      return handlePerfil(context);

    case 'posicion':
    case 'position':
    case 'ตำแหน่ง':
      return handlePosicion(context, args);

    // ============================================================
    // EVENT INFO COMMANDS
    // ============================================================
    case 'alineacion':
    case 'lineup':
    case 'รายชื่อ':
    case 'ไลน์อัพ':
      return handleAlineacion(context);

    case 'horario':
    case 'schedule':
    case 'eventos':
    case 'อีเวนต์':
    case 'ตาราง':
      return handleHorario(context);

    // ============================================================
    // GROUP COMMANDS
    // ============================================================
    case 'grupos':
    case 'groups_list':
    case 'กลุ่ม':
      return handleGrupos(context);

    case 'unirse':
    case 'join':
    case 'เข้าร่วม':
      return handleUnirse(context, args[0]);

    // ============================================================
    // HELP & WELCOME COMMANDS
    // ============================================================
    case 'ayuda':
    case 'help':
    case 'ช่วย':
      return handleAyuda(context);

    case 'start':
    case 'เริ่ม':
      return handleStart(context);

    default:
      console.warn(`[WARN] Unknown command: "${normalizedCommand}"`);
      return {
        success: false,
        message: getMsg(context).invalidCommandMessage(),
      };
  }
}

/**
 * Handle !setup / !iniciar / !config_group command
 * Register current group in the database and make user the admin
 */
export async function handleRegisterGroup(context: HandlerContext): Promise<HandlerResult> {
  try {
    const groupId = context.groupId;
    console.log(`[DEBUG] handleRegisterGroup called with groupId: ${groupId}, userId: ${context.userId}`);
    
    if (!groupId) {
      return {
        success: false,
        message: getMsg(context).notInGroupMessage(),
      };
    }

    // Get sender profile to make them admin
    const user = await getOrCreateUser(context.userId);
    console.log(`[DEBUG] User created/found: ${user.id}, displayName: ${user.displayName}`);

    // Check if group already exists (by lineGroupId)
    const existingGroup = await groupService.getGroupById(groupId);
    console.log(`[DEBUG] Existing group: ${JSON.stringify(existingGroup)}`);

    if (existingGroup) {
      // Group exists - check if current user is already admin
      const isUserAdmin = await groupService.isAdmin(existingGroup.id, user.id);

      if (isUserAdmin) {
        // User is already admin
        return {
          success: false,
          message: getMsg(context).groupAlreadyRegisteredMessage(existingGroup.name),
        };
      }

      // If group has NO admin (null) OR placeholder admin, transfer admin to current user
      if (!existingGroup.adminUserId || existingGroup.adminUserId === 'system-placeholder') {
        const prisma = (await import('@/lib/db/prisma')).default;
        await prisma.group.update({
          where: { id: existingGroup.id },
          data: { adminUserId: user.id },
        });

        // Add/update user as admin member
        try {
          await groupService.updateMemberRole(existingGroup.id, user.id, 'admin');
        } catch (e) {
          // If not member, add as admin
          await groupService.addMember(existingGroup.id, user.id, 'admin');
        }

        return {
          success: true,
          message: getMsg(context).groupRegisteredMessage(existingGroup.name, existingGroup.id),
        };
      }

      // Group has a different admin - Since LINE API doesn't expose admin role,
      // we cannot verify if the current user is actually a LINE group admin.
      // The safest approach: only allow admin transfer if group has no real admin
      // (null or placeholder). If there's already a real admin, reject.
      return {
        success: false,
        message: getMsg(context).adminRequiredMessage(),
      };
    }

    // Group doesn't exist - create it with current user as admin
    const group = await groupService.createGroup(
      getMsg(context).defaultGroupName(),
      user.id,
      getMsg(context).defaultRegion(),
      '7',
      undefined, // internal ID (auto-generated)
      groupId    // lineGroupId
    );

    return {
      success: true,
      message: getMsg(context).groupRegisteredMessage(group.name, group.id),
    };
  } catch (error) {
    console.error('[ERROR] Error in handleRegisterGroup:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !posicion / !position / !ตำแหน่ง command
 * Set user's preferred positions
 */
export async function handlePosicion(context: HandlerContext, args: string[]): Promise<HandlerResult> {
  try {
    const user = await getOrCreateUser(context.userId);
    const lang = context.lang || 'th';
    const msg = getMsg(context);

    // If no arguments, show current positions and help
    if (args.length === 0) {
      const pos1Value = user.position1;
      const pos2Value = user.position2 || '';
      const pos3Value = user.position3 || '';

      const pos1Name = getPositionName(pos1Value, lang);
      const pos2Name = pos2Value ? getPositionName(pos2Value, lang) : (lang === 'es' ? 'Ninguna' : (lang === 'en' ? 'None' : 'ไม่ได้ตั้ง'));
      const pos3Name = pos3Value ? getPositionName(pos3Value, lang) : (lang === 'es' ? 'Ninguna' : (lang === 'en' ? 'None' : 'ไม่ได้ตั้ง'));

      let response = '';
      if (lang === 'es') {
        response = "👤 *Tus Posiciones actuales:*\n1. " + pos1Name + "\n2. " + pos2Name + "\n3. " + pos3Name + "\n\n";
        response += "💡 *Cómo cambiar cada una:*\nUsa: !posicion [Pos1] [Pos2] [Pos3]\nEjemplo: !posicion ST CM GK\n\n";
        response += "✅ *Valores válidos:*\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF";
      } else if (lang === 'en') {
        response = "👤 *Your current positions:*\n1. " + pos1Name + "\n2. " + pos2Name + "\n3. " + pos3Name + "\n\n";
        response += "💡 *How to change:*\nUse: !position [Pos1] [Pos2] [Pos3]\nExample: !position ST CM GK\n\n";
        response += "✅ *Valid values:*\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF";
      } else {
        response = "👤 *ตำแหน่งปัจจุบันของคุณ:*\n1. " + pos1Name + "\n2. " + pos2Name + "\n3. " + pos3Name + "\n\n";
        response += "💡 *วิธีเปลี่ยนตำแหน่ง:*\nใช้: !ตำแหน่ง [ตำแหน่ง1] [ตำแหน่ง2] [ตำแหน่ง3]\nตัวอย่าง: !ตำแหน่ง ST CM GK\n\n";
        response += "✅ *ค่าที่ใช้ได้:*\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF";
      }

      return { success: true, message: response };
    }

    // Validate and update positions
    const newPositions = [];
    for (const arg of args.slice(0, 3)) {
      const upperPos = arg.toUpperCase();
      if (isValidPosition(upperPos)) {
        newPositions.push(upperPos);
      }
    }

    if (newPositions.length === 0) {
      return {
        success: false,
        message: lang === 'es' 
          ? '⚠️ Debes especificar al menos una posición válida (ej: !posicion ST)' 
          : (lang === 'en' ? '⚠️ You must specify at least one valid position (e.g., !position ST)' : '⚠️ คุณต้องระบุอย่างน้อยหนึ่งตำแหน่งที่ถูกต้อง (เช่น !ตำแหน่ง ST)'),
      };
    }

    // Update user in DB
    await userService.update(user.id, {
      position1: newPositions[0],
      position2: newPositions[1] || null,
      position3: newPositions[2] || null,
    });

    // Success response
    const p1 = getPositionName(newPositions[0], lang);
    const p2 = newPositions[1] ? getPositionName(newPositions[1], lang) : '';
    const p3 = newPositions[2] ? getPositionName(newPositions[2], lang) : '';

    let successMsg = '';
    if (lang === 'es') {
      successMsg = "✅ *¡Posiciones actualizadas!*\n\n1. " + p1 + (p2 ? "\n2. " + p2 : "") + (p3 ? "\n3. " + p3 : "") + "\n\nEl bot las usará en el próximo !generar.";
    } else if (lang === 'en') {
      successMsg = "✅ *Positions updated!*\n\n1. " + p1 + (p2 ? "\n2. " + p2 : "") + (p3 ? "\n3. " + p3 : "") + "\n\nThe bot will use these for the next !generate.";
    } else {
      successMsg = "✅ *อัปเดตตำแหน่งเรียบร้อย!*\n\n1. " + p1 + (p2 ? "\n2. " + p2 : "") + (p3 ? "\n3. " + p3 : "") + "\n\nบอทจะใช้ข้อมูลนี้ในการ !จัดทีม ครั้งถัดไป";
    }

    return { success: true, message: successMsg };
  } catch (error) {
    console.error('Error in handlePosicion:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

