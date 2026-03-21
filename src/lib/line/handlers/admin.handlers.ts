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

const getMsg = (context: any) =>
  context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);

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
        message: getMsg(context).adminRequiredMessage(),
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
      message: getMsg(context).eventCreatedMessage(newEvent),
    };
  } catch (error) {
    console.error('Error in handleCrearEvento:', error);
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
    console.error('Error in handleConfigurar:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}

/**
 * Handle !tactica / !กลยุทธ์ command
 * Manage tactics/formations for the group
 * Format: !tactica [add|remove] [formation]
 * Thai: !กลยุทธ์ [เพิ่ม|ลบ] [formation]
 */
export async function handleTactica(
  context: AdminHandlerContext,
  args: string[]
): Promise<HandlerResult> {
  try {
    // Check if action is in Thai or Spanish/English
    const thaiActions: Record<string, string> = {
      'เพิ่ม': 'add',
      'ลบ': 'remove',
      'เอาออก': 'remove',
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
        message: `⚠️ *รูปแบบไม่ถูกต้อง*

ใช้: !กลยุทธ์ [เพิ่ม|ลบ] [การจัดวาง]
หรือ: !tactica [add|remove] [formation]

ตัวอย่าง:
• !กลยุทธ์ เพิ่ม 4-3-3
• !กลยุทธ์ เพิ่ม 3-2-1
• !กลยุทธ์ ลบ 4-3-3

*การจัดวางที่ใช้ได้:*
• ฟุตบอล 7 คน: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• ฟุตบอล 5 คน: 2-2, 1-2-1, 1-1-2, 2-1-1
• ฟุตบอล 11 คน: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3`,
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
        message: '⚠️ *การดำเนินการไม่ถูกต้อง* ใช้: เพิ่ม หรือ ลบ (add หรือ remove)',
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
      actionText = 'เพิ่มแล้ว';
    } else {
      newTactics = { ...currentTactics };
      delete newTactics[tactica];
      actionText = 'ลบแล้ว';
    }
    
    await groupService.update(group.id, {
      tactics: newTactics,
    });
    
    return {
      success: true,
      message: `✅ *${actionText}*

📋 *การจัดวาง:* ${tactica}
👥 *กลุ่ม:* ${group.name}

*การจัดวางที่ใช้ได้:*
${Object.keys(newTactics).map((t) => `• ${t}`).join('\n') || 'ยังไม่มีการจัดวาง'}`,
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
 * Thai: !recurrente [เพิ่ม|พัก|ต่อ|ลบ|ดู] [วัน] [เวลา]
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
      'เพิ่ม': 'agregar',
      'พัก': 'pausar',
      'ต่อ': 'reanudar',
      'ดู': 'listar',
      'ลบ': 'eliminar',
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
        message: `⚠️ *รูปแบบไม่ถูกต้อง*

ใช้: !recurrente [เพิ่ม|พัก|ต่อ|ลบ|ดู] [วัน] [เวลา]
หรือ: !recurrente [agregar|pausar|reanudar|eliminar|listar]

*คำสั่ง:*
• !recurrente เพิ่ม พุธ 18:00 - สร้างเหตุการณ์ทุกวันพุธ
• !recurrente พัก พุธ - พักเหตุการณ์ชั่วคราว
• !recurrente ต่อ พุธ - กลับมาจัดอีกครั้ง
• !recurrente ลบ พุธ - ลบการจัดทุกสัปดาห์
• !recurrente ดู - ดูรายการทั้งหมด

*วันในสัปดาห์:*
อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`,
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
          message: `📋 *เหตุการณ์ประจำ*

ยังไม่มีเหตุการณ์ประจำที่ตั้งค่าไว้

ใช้คำสั่ง !recurrente เพิ่ม เพื่อสร้างเหตุการณ์ทุกสัปดาห์`,
        };
      }
      
      let message = `📋 *เหตุการณ์ประจำทุกสัปดาห์:*\n\n`;
      recurringEvents.forEach((re: any, idx: number) => {
        const dayName = recurringEventService.getDayNameThai(re.dayOfWeek);
        const status = re.isActive ? '✅ � active' : '⏸️ พักอยู่';
        message += `${idx + 1}. *${dayName}* ${re.startTime}\n`;
        message += `   ${status} | ${re.gameType}v${re.gameType} | ${re.teamsCount} ทีม\n\n`;
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
        message: `⚠️ *ต้องระบุวัน*\n\nใช้: !recurrente ${action} [วัน] [เวลา]\nตัวอย่าง: !recurrente ${action} พุธ 18:00`,
      };
    }
    
    const dayInput = args[1];
    const dayOfWeek = recurringEventService.parseDayOfWeek(dayInput);
    
    if (dayOfWeek === null) {
      return {
        success: false,
        message: `⚠️ *วันไม่ถูกต้อง*\n\nวันที่ใช้ได้: อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`,
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
          message: `⚠️ *ไม่พบเหตุการณ์ประจำ*\n\nไม่มีเหตุการณ์ประจำในวัน${recurringEventService.getDayNameThai(dayOfWeek)}`,
        };
      }
      
      await recurringEventService.pause(existingRecurring.id);
      
      return {
        success: true,
        message: `⏸️ *พักเหตุการณ์ประจำแล้ว*\n\nวัน${recurringEventService.getDayNameThai(dayOfWeek)} - การจัดอีเวนต์ถูกพักไว้ชั่วคราว\n\nใช้คำสั่ง !recurrente ต่อ ${dayInput} เพื่อกลับมาจัดอีกครั้ง`,
      };
    }
    
    // Handle reanudar action
    if (action === 'reanudar' || action === 'resume') {
      if (!existingRecurring) {
        return {
          success: false,
          message: `⚠️ *ไม่พบเหตุการณ์ประจำ*\n\nไม่มีเหตุการณ์ประจำในวัน${recurringEventService.getDayNameThai(dayOfWeek)}`,
        };
      }
      
      await recurringEventService.resume(existingRecurring.id);
      
      return {
        success: true,
        message: `✅ *กลับมาจัดอีกครั้งแล้ว*\n\nวัน${recurringEventService.getDayNameThai(dayOfWeek)} - การจัดอีเวนต์กลับมาทำงานแล้ว`,
      };
    }
    
    // Handle eliminar action
    if (action === 'eliminar' || action === 'delete') {
      if (!existingRecurring) {
        return {
          success: false,
          message: `⚠️ *ไม่พบเหตุการณ์ประจำ*\n\nไม่มีเหตุการณ์ประจำในวัน${recurringEventService.getDayNameThai(dayOfWeek)}`,
        };
      }
      
      await recurringEventService.delete(existingRecurring.id);
      
      return {
        success: true,
        message: `🗑️ *ลบเหตุการณ์ประจำแล้ว*\n\nวัน${recurringEventService.getDayNameThai(dayOfWeek)} - การจัดทุกสัปดาห์ถูกลบแล้ว`,
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
          message: `⚠️ *เวลาไม่ถูกต้อง*\n\nใช้รูปแบบ HH:MM เช่น 18:00`,
        };
      }
      
      // Get game type from group default
      const gameType = (group as any).defaultGameType || '7';
      
      // Create recurring event
      await recurringEventService.create({
        groupId: group.id,
        dayOfWeek,
        startTime: timeInput,
        gameType,
        teamsCount: 2,
        totalDurationMinutes: 90,
        minutesPerMatch: 20,
      });
      
      return {
        success: true,
        message: `✅ *สร้างเหตุการณ์ประจำแล้ว*\n\n📅 ทุก${recurringEventService.getDayNameThai(dayOfWeek)}
⏰ เวลา: ${timeInput}
⚽ ประเภท: ฟุตบอล ${gameType} คน

💡 ใช้คำสั่ง !recurrente พัก ${dayInput} เพื่อพักการจัดชั่วคราว`,
      };
    }
    
    return {
      success: false,
      message: `⚠️ *การดำเนินการไม่ถูกต้อง*\n\nใช้: เพิ่ม, พัก, ต่อ, ลบ, ดู`,
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
      message: `✅ *Evento eliminado*

El evento "${event.title || event.id}" ha sido eliminado.`,
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
        message: '⚠️ Especifica el ID del usuario a expulsar.',
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
      message: `✅ *Usuario expulsado*

El usuario ha sido eliminado del grupo ${group.name}.`,
    };
  } catch (error) {
    console.error('Error in handleExpulsar:', error);
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
    case 'สร้าง':
    case 'create_event':
      return handleCrearEvento(context, args);
    
    case 'configurar':
    case 'ตั้งค่า':
    case 'config':
      return handleConfigurar(context, args);
    
    case 'tactica':
    case 'กลยุทธ์':
    case 'tactics':
      return handleTactica(context, args);
    
    case 'generar':
    case 'generate':
    case 'จัดทีม':
      return handleGenerar(context);
    
    case 'cerrar':
    case 'ปิด':
    case 'close':
      return handleCerrar(context);
    
    case 'borrar_evento':
    case 'ลบ':
    case 'delete_event':
      return handleBorrarEvento(context, args[0]);
    
    case 'expulsar':
    case 'kick':
      return handleExpulsar(context, args[0]);
    
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
