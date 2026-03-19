// Admin Command Handlers
// Handles all admin-facing commands for LINE bot

import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import { eventService } from '@/services/event.service';
import { registrationService } from '@/services/registration.service';
import { lineupService } from '@/services/lineup.service';
import * as msg from '@/lib/line/messages';
import type { User, Group, Event, GameType, CreateEventInput, UpdateEventInput } from '@/types';

// Context passed to all handlers
export interface AdminHandlerContext {
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

/** Check if user is admin of a group */
async function checkGroupAdmin(userId: string, groupId: string): Promise<boolean> {
  return groupService.isAdmin(groupId, userId);
}

/** Get user's groups where they are admin */
async function getUserAdminGroups(userId: string): Promise<Group[]> {
  const user = await userService.findByLineUserId(userId);
  if (!user) return [];
  
  const allGroups = await groupService.getAll();
  const adminGroups: Group[] = [];
  
  for (const group of allGroups) {
    if (await groupService.isAdmin(group.id, user.id)) {
      adminGroups.push(group);
    }
  }
  
  return adminGroups;
}

// ============================================================================
// Admin Commands
// ============================================================================

/**
 * Handle !crear_evento command
 * Create a new event
 * Format: !crear_evento [fecha] [hora] [duracion_total] [min_por_partido] [equipos]
 * Example: !crear_evento 2024-12-25 18:00 90 20 2
 */
export async function handleCrearEvento(
  context: AdminHandlerContext,
  args: string[]
): Promise<HandlerResult> {
  try {
    // Parse arguments
    // args: [fecha, hora, duracion_total, min_por_partido, equipos]
    if (args.length < 2) {
      return {
        success: false,
        message: `⚠️ *Formato incorrecto*

Usa: !crear_evento [fecha] [hora] [duracion] [min_partido] [equipos]

Ejemplo: !crear_evento 2024-12-25 18:00 90 20 2

• fecha: YYYY-MM-DD
• hora: HH:MM
• duracion: minutos totales (ej: 90)
• min_partido: minutos por partido (ej: 20)
• equipos: número de equipos (ej: 2)`,
      };
    }
    
    const [fecha, hora, duracion, minPartido, equipos] = args;
    
    // Validate date
    const eventDate = new Date(fecha);
    if (isNaN(eventDate.getTime())) {
      return {
        success: false,
        message: '⚠️ Fecha inválida. Usa formato YYYY-MM-DD',
      };
    }
    
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(hora)) {
      return {
        success: false,
        message: '⚠️ Hora inválida. Usa formato HH:MM',
      };
    }
    
    // Get user and check admin status
    const user = await getOrCreateUser(context.userId);
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Use first admin group
    const group = adminGroups[0];
    
    // Parse optional parameters
    const totalDuration = duracion ? parseInt(duracion, 10) : 90;
    const minutesPerMatch = minPartido ? parseInt(minPartido, 10) : 20;
    const teamsCount = equipos ? parseInt(equipos, 10) : 2;
    
    // Validate parameters
    if (isNaN(totalDuration) || isNaN(minutesPerMatch) || isNaN(teamsCount)) {
      return {
        success: false,
        message: '⚠️ Parámetros numéricos inválidos',
      };
    }
    
    // Create event
    const eventInput: CreateEventInput = {
      groupId: group.id,
      eventDate,
      startTime: hora,
      totalDurationMinutes: totalDuration,
      minutesPerMatch,
      teamsCount,
      gameType: group.defaultGameType as GameType || '7',
    };
    
    const newEvent = await eventService.create(eventInput);
    
    return {
      success: true,
      message: msg.eventCreatedMessage(newEvent),
    };
  } catch (error) {
    console.error('Error in handleCrearEvento:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !configurar command
 * Configure game type for the group
 * Format: !configurar [tipo_juego]
 */
export async function handleConfigurar(
  context: AdminHandlerContext,
  args: string[]
): Promise<HandlerResult> {
  try {
    if (args.length === 0) {
      return {
        success: false,
        message: `⚠️ *Formato incorrecto*

Usa: !configurar [tipo_juego]

Tipos válidos: 5, 7, 11

Ejemplo: !configurar 7`,
      };
    }
    
    const gameType = args[0] as GameType;
    
    // Validate game type
    if (!['5', '7', '11'].includes(gameType)) {
      return {
        success: false,
        message: '⚠️ Tipo de juego inválido. Usa: 5, 7, o 11',
      };
    }
    
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Update first admin group
    const group = adminGroups[0];
    await groupService.update(group.id, {
      defaultGameType: gameType,
    });
    
    return {
      success: true,
      message: `✅ *Configuración actualizada*

Tipo de juego por defecto: Fútbol ${gameType}

Este cambio afecta a los nuevos eventos creados.`,
    };
  } catch (error) {
    console.error('Error in handleConfigurar:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !tactica command
 * Manage tactics for the group
 * Format: !tactica [agregar|quitar] [tactica]
 */
export async function handleTactica(
  context: AdminHandlerContext,
  args: string[]
): Promise<HandlerResult> {
  try {
    if (args.length < 2) {
      return {
        success: false,
        message: `⚠️ *Formato incorrecto*

Usa: !tactica [agregar|quitar] [táctica]

Ejemplos:
• !tactica agregar 4-3-3
• !tactica agregar posesión
• !tactica quitar 4-3-3`,
      };
    }
    
    const action = args[0].toLowerCase();
    const tactica = args.slice(1).join(' ');
    
    if (!['agregar', 'quitar', 'add', 'remove'].includes(action)) {
      return {
        success: false,
        message: '⚠️ Acción inválida. Usa: agregar o quitar',
      };
    }
    
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Update first admin group
    const group = adminGroups[0];
    const currentTactics = group.tactics as Record<string, boolean> || {};
    
    let newTactics: Record<string, boolean>;
    let actionText: string;
    
    if (action === 'agregar' || action === 'add') {
      newTactics = { ...currentTactics, [tactica]: true };
      actionText = 'agregada';
    } else {
      newTactics = { ...currentTactics };
      delete newTactics[tactica];
      actionText = 'eliminada';
    }
    
    await groupService.update(group.id, {
      tactics: newTactics,
    });
    
    return {
      success: true,
      message: `✅ *Táctica ${actionText}*

Táctica: ${tactica}
Grupo: ${group.name}

*Tácticas disponibles:*
${Object.keys(newTactics).map((t) => `• ${t}`).join('\n') || 'Sin tácticas'}`,
    };
  } catch (error) {
    console.error('Error in handleTactica:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !generar command
 * Generate lineups for current event
 */
export async function handleGenerar(context: AdminHandlerContext): Promise<HandlerResult> {
  try {
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Find current open event in any admin group
    let currentEvent: Event | null = null;
    for (const group of adminGroups) {
      const events = await eventService.getUpcomingByGroupId(group.id);
      currentEvent = events.find((e) => e.status === 'open') || null;
      if (currentEvent) break;
    }
    
    if (!currentEvent) {
      return {
        success: false,
        message: '⚠️ No hay eventos abiertos para generar alineaciones.',
      };
    }
    
    // Get registrations
    const registrations = await registrationService.getConfirmedByEventId(currentEvent.id);
    
    if (registrations.length === 0) {
      return {
        success: false,
        message: '⚠️ No hay inscritos para generar alineaciones.',
      };
    }
    
    // Generate lineup
    const result = await lineupService.generateLineup(currentEvent.id);
    
    return {
      success: true,
      message: `✅ *Alineaciones generadas*

Evento: ${currentEvent.title || 'Partido de Fútbol'}
Equipos: ${result.teamAssignments.length}
Jugadores: ${registrations.length}

Usa !alineacion para ver las alineaciones.`,
    };
  } catch (error) {
    console.error('Error in handleGenerar:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !cerrar command
 * Close registration for current event
 */
export async function handleCerrar(context: AdminHandlerContext): Promise<HandlerResult> {
  try {
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Find current open event in any admin group
    let currentEvent: Event | null = null;
    for (const group of adminGroups) {
      const events = await eventService.getUpcomingByGroupId(group.id);
      currentEvent = events.find((e) => e.status === 'open') || null;
      if (currentEvent) break;
    }
    
    if (!currentEvent) {
      return {
        success: false,
        message: '⚠️ No hay eventos abiertos para cerrar.',
      };
    }
    
    // Close registration
    await eventService.closeRegistration(currentEvent.id);
    
    // Get registration count
    const count = await registrationService.getCountByEventId(currentEvent.id);
    
    return {
      success: true,
      message: msg.registrationClosedMessage({
        ...currentEvent,
        status: 'closed',
        maxPlayers: count,
      } as Event),
    };
  } catch (error) {
    console.error('Error in handleCerrar:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !borrar_evento command
 * Delete an event
 */
export async function handleBorrarEvento(
  context: AdminHandlerContext,
  eventId?: string
): Promise<HandlerResult> {
  try {
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    if (!eventId) {
      return {
        success: false,
        message: '⚠️ Especifica el ID del evento. Usa !horario para ver los eventos.',
      };
    }
    
    // Check if event belongs to admin group
    const event = await eventService.findById(eventId);
    if (!event) {
      return {
        success: false,
        message: '⚠️ Evento no encontrado.',
      };
    }
    
    const isAdmin = adminGroups.some((g) => g.id === event.groupId);
    if (!isAdmin) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Delete event
    await eventService.delete(eventId);
    
    return {
      success: true,
      message: `✅ *Evento eliminado*

El evento "${event.title || event.id}" ha sido eliminado.`,
    };
  } catch (error) {
    console.error('Error in handleBorrarEvento:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

/**
 * Handle !expulsar command
 * Remove a member from group
 */
export async function handleExpulsar(
  context: AdminHandlerContext,
  userIdToRemove?: string
): Promise<HandlerResult> {
  try {
    if (!userIdToRemove) {
      return {
        success: false,
        message: '⚠️ Especifica el ID del usuario a expulsar.',
      };
    }
    
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: msg.adminRequiredMessage(),
      };
    }
    
    // Remove member from first admin group
    const group = adminGroups[0];
    await groupService.removeMember(group.id, userIdToRemove);
    
    return {
      success: true,
      message: `✅ *Usuario expulsado*

El usuario ha sido eliminado del grupo ${group.name}.`,
    };
  } catch (error) {
    console.error('Error in handleExpulsar:', error);
    return {
      success: false,
      message: msg.errorMessage(),
    };
  }
}

// ============================================================================
// Main Admin Command Dispatcher
// ============================================================================

/**
 * Main admin command dispatcher
 */
export async function handleAdminCommand(
  command: string,
  args: string[],
  context: AdminHandlerContext
): Promise<HandlerResult> {
  const normalizedCommand = command.toLowerCase().replace(/^!/, '');
  
  switch (normalizedCommand) {
    case 'crear_evento':
      return handleCrearEvento(context, args);
    
    case 'configurar':
      return handleConfigurar(context, args);
    
    case 'tactica':
      return handleTactica(context, args);
    
    case 'generar':
      return handleGenerar(context);
    
    case 'cerrar':
      return handleCerrar(context);
    
    case 'borrar_evento':
      return handleBorrarEvento(context, args[0]);
    
    case 'expulsar':
      return handleExpulsar(context, args[0]);
    
    default:
      return {
        success: false,
        message: msg.invalidCommandMessage(),
      };
  }
}
