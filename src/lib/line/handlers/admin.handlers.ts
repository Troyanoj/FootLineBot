// Admin Command Handlers
// Handles all admin-facing commands for LINE bot

import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import { eventService } from '@/services/event.service';
import { registrationService } from '@/services/registration.service';
import { lineupService } from '@/services/lineup.service';
import { recurringEventService } from '@/services/recurring-event.service';
import * as msgTh from '@/lib/line/messages';
import * as msgEs from '@/lib/line/messages.es';
import * as msgEn from '@/lib/line/messages.en';
import type { User, Group, Event, GameType, CreateEventInput, UpdateEventInput } from '@/types';

// Advanced logging system for debugging
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

function logError(context: any, operation: string, error: any, details?: any) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    level: LOG_LEVELS.ERROR,
    operation,
    userId: context?.userId,
    groupId: context?.groupId,
    lang: context?.lang,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : String(error),
    details
  };
  console.error('========== FOOTLINE BOT ERROR ==========');
  console.error(JSON.stringify(errorInfo, null, 2));
  console.error('==========================================');
}

function logInfo(context: any, operation: string, details?: any) {
  const timestamp = new Date().toISOString();
  const info = {
    timestamp,
    level: LOG_LEVELS.INFO,
    operation,
    userId: context?.userId,
    groupId: context?.groupId,
    lang: context?.lang,
    details
  };
  console.log('========== FOOTLINE BOT INFO ==========');
  console.log(JSON.stringify(info, null, 2));
  console.log('========================================');
}

const getMsg = (context: any) => {
  if (!context || !context.lang) {
    // Default to Thai if no lang is provided
    return msgTh;
  }
  return context.lang === 'es' ? msgEs : (context.lang === 'en' ? msgEn : msgTh);
};

// Context passed to all handlers
export interface AdminHandlerContext {
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
    // args: [fecha, hora, duracion_total, min_por_partido, equipos, max_jugadores]
    if (args.length < 2) {
      return {
        success: false,
        message: `⚠️ *Formato incorrecto*

Usa: !crear_evento [fecha] [hora] [duracion] [min_partido] [equipos] [max_jugadores]

Ejemplo: !crear_evento 2024-12-25 18:00 90 20 2 14

📅 fecha: YYYY-MM-DD
⏰ hora: HH:MM
⏱️ duracion: minutos totales (ej: 90)
⏱️ min_partido: minutos por partido (ej: 20)
👥 equipos: número de equipos (ej: 2)
👥 max_jugadores: máximo de jugadores (ej: 14) - opcional`,
      };
    }
    
    const [fecha, hora, duracion, minPartido, equipos, maxJugadores] = args;
    
    // Validate date - Set time to noon to avoid timezone issues
    const eventDate = new Date(fecha);
    eventDate.setHours(12, 0, 0, 0);
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
        message: getMsg(context).adminRequiredMessage(),
      };
    }
    
    // Use first admin group
    const group = adminGroups[0];
    
    // Parse optional parameters
    const totalDuration = duracion ? parseInt(duracion, 10) : 90;
    const minutesPerMatch = minPartido ? parseInt(minPartido, 10) : 20;
    const teamsCount = equipos ? parseInt(equipos, 10) : 2;
    const maxPlayers = maxJugadores ? parseInt(maxJugadores, 10) : undefined;
    
    // Validate parameters
    if (isNaN(totalDuration) || isNaN(minutesPerMatch) || isNaN(teamsCount)) {
      return {
        success: false,
        message: '⚠️ Parámetros numéricos inválidos',
      };
    }
    
    if (maxJugadores && isNaN(maxPlayers!)) {
      return {
        success: false,
        message: '⚠️ Número de jugadores máximo inválido',
      };
    }
    
    // Prisma expects a DateTime for the startTime field
    // We need to create a proper DateTime by combining the event date with the time
    const [hours, minutes] = hora.split(':');
    const startTimeDate = new Date(eventDate);
    startTimeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    // Create event
    const eventInput: CreateEventInput = {
      groupId: group.id,
      eventDate,
      startTime: startTimeDate.toISOString(),
      totalDurationMinutes: totalDuration,
      minutesPerMatch,
      teamsCount,
      gameType: (group.defaultGameType as GameType) || '7',
      maxPlayers: maxPlayers,
    };
    
    const newEvent = await eventService.create(eventInput);
    
    return {
      success: true,
      message: getMsg(context).eventCreatedMessage(newEvent),
    };
  } catch (error) {
    logError(context, 'handleCrearEvento', error, { args });
    // Return more detailed error for debugging
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: getMsg(context).errorMessage(),
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
      const lang = context.lang || "th";
      const cmd = lang === "es" ? "configurar" : (lang === "en" ? "config" : "ตั้งค่า");
      return {
        success: false,
        message: getMsg(context).adminInvalidFormatMessage(cmd, "[5|7|11]"),
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
        message: getMsg(context).adminRequiredMessage(),
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
    logError(context, 'handleConfigurar', error, { args });
    return {
      success: false,
      message: `⚠️ *Error in handleConfigurar*: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

/**
 * Handle !tactica / !??????? command
 * Manage tactics/formations for the group
 * Format: !tactica [add|remove] [formation]
 * Thai: !??????? [?????|??] [formation]
 */
export async function handleTactica(
  context: AdminHandlerContext,
  args: string[]
): Promise<HandlerResult> {
  try {
    // Check if action is in Thai or Spanish/English
    const thaiActions: Record<string, string> = {
      '?????': 'add',
      '??': 'remove',
      '??????': 'remove',
    };
    
    const spanishActions: Record<string, string> = {
      'agregar': 'add',
      'quitar': 'remove',
      'add': 'add',
      'remove': 'remove',
    };
    
    if (args.length < 2) {
      return {
        success: false,
        message: `⚠️ *Formato incorrecto*

Usa: !tactica [agregar|quitar] [formación]
o: !tactica [add|remove] [formation]

Ejemplos:
• !tactica agregar 4-3-3
• !tactica agregar 3-2-1
• !tactica quitar 4-3-3

*Formaciones Disponibles:*
• Fútbol 7: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• Fútbol 5: 2-2, 1-2-1, 1-1-2, 2-1-1
• Fútbol 11: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3`,
      };
    }
    
    let action = args[0].toLowerCase();
    // Convert Thai action to English
    if (thaiActions[action]) {
      action = thaiActions[action];
    } else if (spanishActions[action]) {
      action = spanishActions[action];
    }
    
    const tactica = args.slice(1).join(' ');
    
    if (!['add', 'remove'].includes(action)) {
      return {
        success: false,
        message: '⚠️ *Acción inválida* Usa: agregar o quitar (add o remove)',
      };
    }
    
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: getMsg(context).adminRequiredMessage(),
      };
    }
    
    // Update first admin group
    const group = adminGroups[0];
    const currentTactics = group.tactics as Record<string, boolean> || {};
    
    let newTactics: Record<string, boolean>;
    let actionText: string;
    
    if (action === 'add') {
      newTactics = { ...currentTactics, [tactica]: true };
      actionText = 'Añadido';
    } else {
      newTactics = { ...currentTactics };
      delete newTactics[tactica];
      actionText = 'Eliminado';
    }
    
    await groupService.update(group.id, {
      tactics: newTactics,
    });
    
    return {
      success: true,
      message: `✅ *${actionText}*

📋 *Formación:* ${tactica}
👥 *Grupo:* ${group.name}

*Formaciones Disponibles:*
${Object.keys(newTactics).map((t) => `• ${t}`).join('\n') || 'No hay formaciones disponibles'}`,
    };
  } catch (error) {
    console.error('Error in handleTactica:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !recurrente / !recurring command
 * Manage recurring events for the group
 * Format: !recurrente [agregar|pausar|reanudar|eliminar|listar] [día] [hora] [duración]
 * Thai: !recurrente [?????|???|???|??|??] [???] [????]
 */
export async function handleRecurrente(
  context: AdminHandlerContext,
  args: string[]
): Promise<HandlerResult> {
  try {
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: getMsg(context).adminRequiredMessage(),
      };
    }
    
    const group = adminGroups[0];
    
    // Parse action (Thai or Spanish/English)
    const thaiActions: Record<string, string> = {
      '?????': 'agregar',
      '???': 'pausar',
      '???': 'reanudar',
      '??': 'listar',
      '??': 'eliminar',
    };
    
    const spanishActions: Record<string, string> = {
      'agregar': 'agregar',
      'pausar': 'pausar',
      'reanudar': 'reanudar',
      'eliminar': 'eliminar',
      'listar': 'listar',
      'add': 'agregar',
      'pause': 'pausar',
      'resume': 'reanudar',
      'delete': 'eliminar',
      'list': 'listar',
    };
    
    if (args.length === 0) {
      return {
        success: false,
        message: `⚠️ *Formato incorrecto*

Usa: !recurrente [agregar|pausar|reanudar|eliminar|listar] [día] [hora]
O: !recurring [add|pause|resume|delete|list]

*Comandos:*
• !recurrente agregar miércoles 18:00 - Crear partido semanal
• !recurrente pausar miércoles - Pausar partido semanal
• !recurrente reanudar miércoles - Reanudar partido semanal
• !recurrente eliminar miércoles - Eliminar programación
• !recurrente listar - Ver todos los eventos

*Días de la semana:*
Domingo, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado`,
      };
    }
    
    let action = args[0].toLowerCase();
    // Convert action to Spanish
    if (thaiActions[action]) {
      action = thaiActions[action];
    } else if (spanishActions[action]) {
      action = spanishActions[action];
    }
    
    // Handle listar action
    if (action === 'listar' || action === 'list') {
      const recurringEvents = await recurringEventService.getByGroupId(group.id);
      
      if (recurringEvents.length === 0) {
        return {
          success: true,
          message: `📋 *Eventos Recurrentes*

No hay eventos recurrentes configurados.

Usa !recurrente agregar para crear un partido semanal.`,
        };
      }
      
      let message = `📋 *Eventos Recurrentes Semanales:*\n\n`;
      recurringEvents.forEach((re: any, idx: number) => {
        const dayName = recurringEventService.getDayName(re.dayOfWeek, context.lang);
        const status = re.isActive ? '✅ Activo' : '⏸️ Pausado';
        message += `${idx + 1}. *${dayName}* ${re.startTime}\n`;
        message += `   ${status} | ${re.gameType}v${re.gameType} | ${re.teamsCount} equipos\n\n`;
      });
      
      return {
        success: true,
        message,
      };
    }
    
    // For other actions, we need more arguments
    if (args.length < 2) {
      return {
        success: false,
        message: `⚠️ *Día Requerido*\n\nUsa: !recurrente ${action} [día] [hora]\nEjemplo: !recurrente ${action} miércoles 18:00`,
      };
    }
    
    const dayInput = args[1];
    const dayOfWeek = recurringEventService.parseDayOfWeek(dayInput);
    
    if (dayOfWeek === null) {
      return {
        success: false,
        message: `⚠️ *Día Inválido*\n\nDías válidos: Domingo, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado`,
      };
    }
    
    // Get existing recurring event for this day
    const existingEvents = await recurringEventService.getByGroupId(group.id);
    const existingRecurring = existingEvents.find((re: any) => re.dayOfWeek === dayOfWeek);
    
    // Handle pausar action
    if (action === 'pausar' || action === 'pause') {
      if (!existingRecurring) {
        return {
          success: false,
          message: `⚠️ *Evento Recurrente No Encontrado*\n\nNo hay evento recurrente el ${recurringEventService.getDayName(dayOfWeek, context.lang)}`,
        };
      }
      
      await recurringEventService.pause(existingRecurring.id);
      
      return {
        success: true,
        message: `⏸️ *Evento Recurrente Pausado*\n\n${recurringEventService.getDayName(dayOfWeek, context.lang)} - La programación está pausada temporalmente\n\nUsa !recurrente reanudar para continuar`,
      };
    }
    
    // Handle reanudar action
    if (action === 'reanudar' || action === 'resume') {
      if (!existingRecurring) {
        return {
          success: false,
          message: `⚠️ *Evento Recurrente No Encontrado*\n\nNo hay evento recurrente el ${recurringEventService.getDayName(dayOfWeek, context.lang)}`,
        };
      }
      
      await recurringEventService.resume(existingRecurring.id);
      
      return {
        success: true,
        message: `✅ *Evento Recurrente Reanudado*\n\n${recurringEventService.getDayName(dayOfWeek, context.lang)} - La programación está activa nuevamente`,
      };
    }
    
    // Handle eliminar action
    if (action === 'eliminar' || action === 'delete') {
      if (!existingRecurring) {
        return {
          success: false,
          message: `⚠️ *Evento Recurrente No Encontrado*\n\nNo hay evento recurrente el ${recurringEventService.getDayName(dayOfWeek, context.lang)}`,
        };
      }
      
      await recurringEventService.delete(existingRecurring.id);
      
      return {
        success: true,
        message: `🗑️ *Evento Recurrente Eliminado*\n\n${recurringEventService.getDayName(dayOfWeek, context.lang)} - La programación semanal ha sido eliminada`,
      };
    }
    
    // Handle agregar action
    if (action === 'agregar' || action === 'add') {
      // Parse time
      const timeInput = args[2] || '18:00';
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!timeRegex.test(timeInput)) {
        return {
          success: false,
          message: `⚠️ *Hora Inválida*\n\nUsa formato HH:MM, ej: 18:00`,
        };
      }
      
      // Get game type from group default
      const totalDuration = args[3] ? parseInt(args[3], 10) : 120; 
      const minutesPerMatch = args[4] ? parseInt(args[4], 10) : 8; 
      const teamsCount = args[5] ? parseInt(args[5], 10) : 3; 
      const gameType = args[6] || '7'; 
      const maxPlayers = args[7] ? parseInt(args[7], 10) : 9;
      
      // Create recurring event
      await recurringEventService.create({
        groupId: group.id,
        dayOfWeek,
        startTime: timeInput,
        gameType,
        teamsCount, 
        totalDurationMinutes: totalDuration, 
        minutesPerMatch, 
        maxPlayers, 
      });
      
      return {
        success: true,
        message: `✅ *Evento Recurrente Creado*\n\n📅 Cada ${recurringEventService.getDayName(dayOfWeek, context.lang)}\n⏰ Hora: ${timeInput}\n⏱️ Duración: ${totalDuration} min\n⚽ Tipo: Fútbol ${gameType}\n👥 Equipos: ${teamsCount}\n👥 Máx. jugadores: ${maxPlayers}\n\n💡 El evento se creará automáticamente 3 días antes`,
      };
    }
    
    return {
      success: false,
      message: `⚠️ *Acción Inválida*\n\nUsa: agregar, pausar, reanudar, eliminar, listar`,
    };
    
  } catch (error) {
    console.error('Error in handleRecurrente:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
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
        message: getMsg(context).adminRequiredMessage(),
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
        message: getMsg(context).noOpenEventMessage(),
      };
    }
    
    // Get registrations
    const registrations = await registrationService.getConfirmedByEventId(currentEvent.id);
    
    if (registrations.length === 0) {
      return {
        success: false,
        message: getMsg(context).noRegistrationsForLineupMessage(),
      };
    }
    
    // Generate lineup
    const result = await lineupService.generateLineup(currentEvent.id);
    
    return {
      success: true,
      message: getMsg(context).lineupGeneratedWithDetailsMessage(
        currentEvent.title,
        result.teamAssignments.length,
        registrations.length
      ),
    };
  } catch (error) {
    console.error('Error in handleGenerar:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
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
        message: getMsg(context).adminRequiredMessage(),
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
      message: getMsg(context).registrationClosedMessage(),
    };
  } catch (error) {
    console.error('Error in handleCerrar:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
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
        message: getMsg(context).adminRequiredMessage(),
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
        message: getMsg(context).adminRequiredMessage(),
      };
    }
    
    // Delete event
    await eventService.delete(eventId);
    
    return {
      success: true,
      message: getMsg(context).eventDeletedMessage(event),
    };
  } catch (error) {
    console.error('Error in handleBorrarEvento:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
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
        message: '⚠️ Specify User ID',
      };
    }
    
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: getMsg(context).adminRequiredMessage(),
      };
    }
    
    // Remove member from first admin group
    const group = adminGroups[0];
    await groupService.removeMember(group.id, userIdToRemove);
    
    return {
      success: true,
      message: getMsg(context).userExpelledMessage(group.name),
    };
  } catch (error) {
    console.error('Error in handleExpulsar:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !borrar_grupo / !delete_group command
 * Delete the entire group from the database
 */
export async function handleBorrarGrupo(
  context: AdminHandlerContext
): Promise<HandlerResult> {
  try {
    // Get user and check admin status
    const adminGroups = await getUserAdminGroups(context.userId);
    
    if (adminGroups.length === 0) {
      return {
        success: false,
        message: getMsg(context).adminRequiredMessage(),
      };
    }
    
    // Delete first admin group
    const group = adminGroups[0];
    await groupService.delete(group.id);
    
    return {
      success: true,
      message: getMsg(context).groupDeletedMessage(group.name),
    };
  } catch (error) {
    console.error('Error in handleBorrarGrupo:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
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
    case '?????':
    case 'create_event':
      return handleCrearEvento(context, args);
    
    case 'configurar':
    case '???????':
    case 'config':
      return handleConfigurar(context, args);
    
    case 'tactica':
    case '???????':
    case 'tactics':
      return handleTactica(context, args);
    
    case 'generar':
    case 'generate':
    case '??????':
      return handleGenerar(context);
    
    case 'cerrar':
    case '???':
    case 'close':
      return handleCerrar(context);
    
    case 'borrar_evento':
    case '??':
    case 'delete_event':
      return handleBorrarEvento(context, args[0]);
    
    case 'expulsar':
    case 'kick':
      return handleExpulsar(context, args[0]);
    
    case 'borrar_grupo':
    case 'delete_group':
    case '???????':
    case 'delete-group':
      return handleBorrarGrupo(context);
    
    case 'recurrente':
    case 'recurring':
    case 'recurring_events':
      return handleRecurrente(context, args);
    
    default:
      return {
        success: false,
        message: getMsg(context).invalidCommandMessage(normalizedCommand),
      };
  }
}