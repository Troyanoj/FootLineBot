// User Command Handlers
// Handles all user-facing commands for LINE bot

import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import { eventService } from '@/services/event.service';
import { registrationService } from '@/services/registration.service';
import { lineupService } from '@/services/lineup.service';
import * as msg from '@/lib/line/messages';
import type { User, Group, Event, Position } from '@/types';
import prisma from '@/lib/db/prisma';

// Context passed to all handlers
export interface HandlerContext {
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
        message: msg.notInGroupMessage(),
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
        message: msg.noOpenEventMessage(),
      };
    }
    
    // Check if already registered
    const isRegistered = await registrationService.isRegistered(openEvent.id, user.id);
    if (isRegistered) {
      return {
        success: false,
        message: msg.alreadyRegisteredMessage(),
      };
    }
    
    // Register for event
    await registrationService.register({
      eventId: openEvent.id,
      userId: user.id,
    });
    
    return {
      success: true,
      message: msg.registrationSuccessMessage(openEvent),
    };
  } catch (error) {
    console.error('Error in handleApuntar:', error);
    return {
      success: false,
      message: msg.errorMessage(),
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
        message: msg.notInGroupMessage(),
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
        message: msg.noOpenEventMessage(),
      };
    }
    
    // Check if registered
    const registration = await registrationService.getByEventAndUser(openEvent.id, user.id);
    if (!registration) {
      return {
        success: false,
        message: msg.notRegisteredMessage(),
      };
    }
    
    // Cancel registration
    await registrationService.cancel(registration.id);
    
    return {
      success: true,
      message: msg.registrationCancelledMessage(openEvent),
    };
  } catch (error) {
    console.error('Error in handleBaja:', error);
    return {
      success: false,
      message: msg.errorMessage(),
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
      message: msg.profileMessage(user, groups),
    };
  } catch (error) {
    console.error('Error in handlePerfil:', error);
    return {
      success: false,
      message: msg.errorMessage(),
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
        message: msg.notInGroupMessage(),
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
        message: msg.noLineupMessage(),
      };
    }
    
    return {
      success: true,
      message: msg.lineupMessage(currentEvent, teamAssignments, lineups, user.id),
    };
  } catch (error) {
    console.error('Error in handleAlineacion:', error);
    return {
      success: false,
      message: msg.errorMessage(),
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
        message: msg.scheduleMessage([]),
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
      message: msg.scheduleMessage(upcomingEvents),
    };
  } catch (error) {
    console.error('Error in handleHorario:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !grupos command
 * List available groups
 */
export async function handleGrupos(): Promise<HandlerResult> {
  try {
    const groups = await groupService.getAll();
    
    return {
      success: true,
      message: msg.groupsListMessage(groups),
    };
  } catch (error) {
    console.error('Error in handleGrupos:', error);
    return {
      success: false,
      message: msg.errorMessage(),
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
        message: msg.invalidParametersMessage('unirse'),
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
      message: msg.joinedGroupMessage(group),
    };
  } catch (error) {
    console.error('Error in handleUnirse:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !ayuda / !help command
 * Show help message
 */
export async function handleAyuda(): Promise<HandlerResult> {
  return {
    success: true,
    message: msg.helpMessage(),
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
      message: msg.welcomeMessage(lineProfile.displayName),
    };
  } catch (error) {
    console.error('Error in handleStart:', error);
    return {
      success: false,
      message: msg.errorMessage(),
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
      return handleApuntar(context);
    
    case 'baja':
    case 'desinscribirme':
      return handleBaja(context);
    
    case 'perfil':
      return handlePerfil(context);
    
    case 'alineacion':
      return handleAlineacion(context);
    
    case 'horario':
      return handleHorario(context);
    
    case 'grupos':
      return handleGrupos();
    
    case 'unirse':
      return handleUnirse(context, args[0]);
    
    case 'ayuda':
    case 'help':
      return handleAyuda();
    
    case 'start':
      return handleStart(context);
    
    default:
      return {
        success: false,
        message: msg.invalidCommandMessage(),
      };
  }
}
