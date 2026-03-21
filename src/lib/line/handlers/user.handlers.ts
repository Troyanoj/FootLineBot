// User Command Handlers
// Handles all user-facing commands for LINE bot

import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
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

const getMsg = (context: any) =>
  context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);

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
  
  if (!user) {
    // Get LINE profile
    const lineProfile = await getUserProfile(lineUserId);
    
    // Create user with default values
    user = await userService.create({
      lineUserId,
      displayName: lineProfile.displayName,
      position1: 'CM', // Default position
    });
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
    await registrationService.register({
      eventId: openEvent.id,
      userId: user.id,
    });
    
    return {
      success: true,
      message: getMsg(context).registrationSuccessMessage(openEvent),
    };
  } catch (error) {
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
        message: 'No estás registrado. Usa !apuntar para inscribirte.',
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
        message: 'No tienes perfil. Usa !perfil para crear uno.',
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
        message: 'No hay eventos activos actualmente.',
      };
    }
    
    // Get lineup
    const teamAssignments = await lineupService.getTeamAssignments(currentEvent.id);
    const lineups = await lineupService.getByEventId(currentEvent.id);
    
    if (teamAssignments.length === 0) {
      return {
        success: false,
        message: getMsg(context).noLineupMessage(),
      };
    }
    
    return {
      success: true,
      message: getMsg(context).lineupMessage(currentEvent, teamAssignments, lineups, user.id),
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
    
    // Check if group exists
    const group = await groupService.findById(groupId);
    
    if (!group) {
      return {
        success: false,
        message: 'El grupo no existe. Usa !grupos para ver los disponibles.',
      };
    }
    
    // Check if already a member
    const isMember = await groupService.isMember(groupId, user.id);
    if (isMember) {
      return {
        success: false,
        message: `Ya eres miembro del grupo ${group.name}.`,
      };
    }
    
    // Add user to group
    await groupService.addMember(groupId, user.id, 'member');
    
    return {
      success: true,
      message: getMsg(context).joinedGroupMessage(group),
    };
  } catch (error) {
    console.error('Error in handleUnirse:', error);
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
  const normalizedCommand = command.toLowerCase().replace(/^!/, '');
  
  switch (normalizedCommand) {
    case 'apuntar':
    case 'inscribirme':
    case 'register':
      return handleApuntar(context);
    
    case 'baja':
    case 'desinscribirme':
    case 'unregister':
      return handleBaja(context);
    
    case 'perfil':
    case 'profile':
      return handlePerfil(context);
    
    case 'alineacion':
    case 'lineup':
      return handleAlineacion(context);
    
    case 'horario':
    case 'schedule':
      return handleHorario(context);
    
    case 'grupos':
    case 'groups_list':
      return handleGrupos(context);
    
    case 'unirse':
    case 'join':
      return handleUnirse(context, args[0]);
    
    case 'ayuda':
    case 'help':
      return handleAyuda(context);
    
    case 'start':
      return handleStart(context);
    
    default:
      return {
        success: false,
        message: getMsg(context).invalidCommandMessage(),
      };
  }
}
