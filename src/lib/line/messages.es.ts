import type { User, Event, Registration, Group, Lineup, TeamAssignment } from '@/types';

// ============================================================================
// Welcome & Help Messages
// ============================================================================

export const welcomeMessage = (displayName: string): string => {
  return `👋 ¡Hola ${displayName}! Bienvenido a FootLine Bot

⚽ Soy tu asistente para gestionar partidos de fútbol con tu grupo.

📋 *Comandos Disponibles:*

*Para Jugadores:*
• !apuntar o !inscribirme - Regístrate al partido actual
• !baja o !desinscribirme - Cancela tu registro
• !perfil - Mira tu perfil
• !posicion [p1] [p2] [p3] - Configura tus posiciones
• !alineacion - Mira la alineación del partido
• !horario - Mira el calendario de partidos
• !grupos - Mira tus grupos
• !unirse [id] - Únete a un grupo

*Para Administradores:*
• !crear_evento [fecha] [hora] [duracion] [min] [equipos] - Crea evento
• !configurar [5|7|11] - Configura el tipo de juego
• !generar - Arma los equipos automáticamente
• !cerrar - Cierra las inscripciones
• !tactica agregar [formación] - Añade formación
• !tactica quitar [formación] - Quita formación
• !recurrente agregar [Día] [Hora] - Crea partido semanal
• !recurrente pausar [Día] - Pausa la convocatoria
• !recurrente listar - Mira la cartelera recurrente

💡 Usa !ayuda para ver los comandos detallados.`;
};

export const helpMessage = (): string => {
  return `📋 *Comandos de FootLine*

*Para Jugadores:*
🔹 !apuntar o !register - Inscripción
🔹 !baja o !unregister - Darse de baja
🔹 !perfil o !profile - Ver tu perfil
🔹 !posicion o !position - Configurar posiciones
🔹 !alineacion o !lineup - Ver equipos
🔹 !horario o !schedule - Próximos partidos
🔹 !unirse [id] - Unirse a un grupo

*Para Administradores:*
🔹 !crear_evento o !create_event
🔹 !configurar o !config [5|7|11]
🔹 !generar o !generate - Crear equipos
🔹 !cerrar o !close - Cerrar lista
🔹 !expulsar o !kick @Usuario
🔹 !recurrente o !recurring - Eventos automáticos

📖 *Guía detallada con imágenes:*
https://app-omega-sand-14.vercel.app/help?lang=es`;
};

// ============================================================================

export const registrationSuccessMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = new Date(event.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `✅ *¡Inscripción Exitosa!*

📅 *Evento:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${time}
⏱️ *Duración:* ${event.totalDurationMinutes} min

¡Nos vemos en la cancha! ⚽`;
};

export const waitlistSuccessMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = new Date(event.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `⚠️ *Lista de Espera*

El evento está lleno. Has sido añadido a la lista de espera.

📅 *Evento:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${time}
👥 *Cupo máximo:* ${event.maxPlayers || 'Sin límite'}

Te avisaremos si alguien se da de baja. ⚽`;
};

export const registrationCancelSuccessMessage = (event: Event): string => {
  return `❌ *Baja confirmada*

Te has dado de baja de ${event.title || 'Partido'}.

¡Esperamos verte en el próximo juego! 👋`;
};

// Alias used by handlers
export const registrationCancelledMessage = registrationCancelSuccessMessage;

/** Registration closed message */
export const registrationClosedMessage = (): string => {
  return `🔒 *Registro Cerrado*

El registro para este evento ha sido cerrado.`;
};

export const noLineupMessage = (): string => {
  return `❌ *Alineaciones aún no generadas*

El administrador todavía no ha generado los equipos. Usa !ayuda.`;
};

export const registrationFailedNoEventMessage = (): string => {
  return `❌ *No hay eventos*

Actualmente no hay ningún partido abierto para inscribirse.`;
};

export const registrationFailedEventFullMessage = (): string => {
  return `❌ *¡Cupo Lleno!*

El partido ya completó su límite de jugadores.`;
};

export const registrationFailedAlreadyRegisteredMessage = (): string => {
  return `ℹ️ *Ya estás registrado*

No es necesario apuntarte de nuevo a este evento.`;
};

// Aliases for user.handlers.ts consistency
export const noOpenEventMessage = registrationFailedNoEventMessage;

/** No registrations for lineup message */
export const noRegistrationsForLineupMessage = (): string => {
  return `⚠️ *No hay inscritos*\n\nNo hay jugadores registrados para este evento`;
};

/** Lineup generated with details message */
export const lineupGeneratedWithDetailsMessage = (eventTitle: string, teamsCount: number, playersCount: number): string => {
  return `✅ *Alineaciones generadas*\n\nEvento: ${eventTitle || 'Partido de Fútbol'}\nEquipos: ${teamsCount}\nJugadores: ${playersCount}\n\nUsa !alineacion para ver las alineaciones`;
};
export const alreadyRegisteredMessage = registrationFailedAlreadyRegisteredMessage;
export const notRegisteredMessage = (): string => `❌ *No estás registrado en este evento.*`;


// ============================================================================
// Group Messages
// ============================================================================

export const groupRegisteredMessage = (groupName: string, groupId: string): string => {
  return `✅ *¡Grupo Registrado!*

🏟️ *Grupo:* ${groupName}
🆔 *ID:* ${groupId}

Usa !crear_evento para iniciar.`;
};

export const groupDeletedMessage = (groupName: string): string => {
  return `🗑️ *¡Grupo eliminado!*

El grupo "${groupName}" ha sido eliminado del sistema.

Vuelve a agregar el bot y usa !setup para comenzar de nuevo.`;
};

export const groupAlreadyRegisteredMessage = (groupName: string): string => {
  return `ℹ️ *Grupo ya existe*

${groupName} ya está en el sistema.`;
};

export const groupNotRegisteredMessage = (): string => {
  return `❌ *Grupo no registrado*`;
};

export const groupNotFoundMessage = (groupId?: string): string => {
  let msg = `❌ *Grupo no encontrado*\n\n`;
  msg += `No se encontró el grupo con ID: ${groupId || 'no especificado'}\n\n`;
  msg += `📋 *Solución:*\n`;
  msg += `1. Pide al administrador del grupo que ejecute !register o !setup en el grupo de LINE\n`;
  msg += `2. Luego usa !join [ID] nuevamente\n\n`;
  msg += `Usa !grupos para ver los grupos disponibles.`;
  return msg;
};

export const alreadyMemberMessage = (groupName: string): string => {
  return `ℹ️ *Ya eres miembro*\n\nYa eres miembro del grupo ${groupName}.`;
};

// ============================================================================
// Event Messages
// ============================================================================

export const eventCreatedMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = new Date(event.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `✅ *¡Partido Creado!*

📅 *Evento:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${time}
⏱️ *Duración:* ${event.totalDurationMinutes} min
👥 *Equipos:* ${event.teamsCount}
👥 *Máx. jugadores:* ${event.maxPlayers || 'Sin límite'}
🆔 *ID:* ${event.id}

📝 Para eliminar este evento usa: !borrar_evento ${event.id}

📝 ¡A partir de este momento pueden usar !apuntar para jugar!`;
};

export const eventClosedMessage = (event: Event, registrations: any[]): string => {
  return `🔒 *¡Inscripciones Cerradas!*

👥 *Apuntados:* ${registrations.length} jugadores

¡Prepárense para el partido! ⚽`;
};

export const eventDeletedMessage = (event: Event): string => {
  return `✅ *Evento Eliminado!*

El evento "${event.title || event.id}" ha sido eliminado.`;
};

export const userExpelledMessage = (groupName: string): string => {
  return `✅ *Usuario Expulsado!*

El usuario ha sido eliminado del grupo "${groupName}".`;
};

export const eventDetailsMessage = (event: Event, registrations: any[]): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const playerList = registrations.map((r: any, i) => `${i + 1}. ${r.user?.displayName || 'Unknown'}`).join('\n');
  return `📋 *Detalle del Partido*

📆 *Fecha:* ${date}
⏰ *Hora:* ${event.startTime}
👥 *Apuntados:* ${registrations.length}/${event.maxPlayers || '∞'}

📝 *Lista:*
${playerList || 'Nadie apuntado aún'}

💡 ¡Usa !apuntar para entrar!`;
};

export const noEventsMessage = (): string => {
  return `📭 *Vacío*

No hay eventos próximos en este momento.`;
};

// ============================================================================
// Error Messages
// ============================================================================

export const errorMessage = (): string => {
  return `❌ *Error interno*

Algo salió mal procesando tu comando.`;
};

export const unknownCommandMessage = (command: string): string => {
  return `❓ *Comando no reconocido*

No reconozco el comando "${command}".
Usa !ayuda para ver los comandos válidos.`;
};

export const invalidParametersMessage = (command: string): string => {
  return `⚠️ *Parámetros incorrectos*

Revisa cómo usar !${command} con !ayuda.`;
};

// ============================================================================
// Profile Messages
// ============================================================================

export const profileMessage = (user: User, groups: Group[]): string => {
  return `👤 *Tu Perfil*

📛 *Nombre:* ${user.displayName}
⚽ *Pos 1:* ${user.position1 || 'N/A'}
⚽ *Pos 2:* ${user.position2 || 'N/A'}
⚽ *Pos 3:* ${user.position3 || 'N/A'}
⭐ *Nivel:* ${user.rating || 5}/10
⚽ *Partidos:* ${user.totalMatches || 0}`;
};

export const notAdminMessage = (): string => {
  return `⛔ *Sin Autorización*

Este comando es exclusivo para organizadores.`;
};

// Alias for route.ts consistency
export const adminRequiredMessage = notAdminMessage;

export const adminInvalidFormatMessage = (command: string, example: string): string => {
  return `⚠️ *Formato Incorrecto*

Usa: !${command} ${example}

Ejemplo: !${command} 2024-12-25 18:00 90 20 2`;
};

export const adminConfigUpdatedMessage = (type: string): string => {
  return `✅ *Configuración actualizada*

Tipo de juego por defecto: Fútbol ${type}

Este cambio afecta a los nuevos eventos creados.`;
};

/** Tactica format error message */
export const tacticaFormatMessage = (): string => {
  return `⚠️ *Formato Incorrecto*

Usa: !tactica [agregar|quitar] [formación]
o: !tactica [add|remove] [formation]

Ejemplos:
• !tactica agregar 4-3-3
• !tactica agregar 3-2-1
• !tactica quitar 4-3-3

*Formaciones Disponibles:*
• Fútbol 7: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• Fútbol 5: 2-2, 1-2-1, 1-1-2, 2-1-1
• Fútbol 11: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3`;
};

/** Tactica invalid action message */
export const tacticaInvalidActionMessage = (): string => {
  return `⚠️ *Acción inválida* Usa: agregar o quitar (add o remove)`;
};

/** Tactica added message */
export const tacticaAddedMessage = (): string => {
  return 'Añadido';
};

/** Tactica removed message */
export const tacticaRemovedMessage = (): string => {
  return 'Eliminado';
};

/** Tactica success message */
export const tacticaSuccessMessage = (actionText: string, formation: string, groupName: string, availableFormations: string[]): string => {
  return `✅ *${actionText}*

📋 *Formación:* ${formation}
👥 *Grupo:* ${groupName}

*Formaciones Disponibles:*
${availableFormations.map((t) => `• ${t}`).join('\n') || 'No hay formaciones disponibles'}`;
};

// ============================================================================
// Recurrente Messages (Spanish)
// ============================================================================

/** Recurrente format error message */
export const recurrenteFormatMessage = (): string => {
  return `⚠️ *Formato Incorrecto*

Usa: !recurrente [agregar|pausar|reanudar|eliminar|listar] [día] [hora]
O: !recurring [add|pause|resume|delete|list]

*Comandos:*
• !recurrente agregar miércoles 18:00 - Crear partido semanal
• !recurrente pausar miércoles - Pausar partido semanal
• !recurrente reanudar miércoles - Reanudar partido semanal
• !recurrente eliminar miércoles - Eliminar programación
• !recurrente listar - Ver todos los eventos

*Días de la semana:*
Domingo, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado`;
};

/** Recurrente empty list message */
export const recurrenteEmptyListMessage = (): string => {
  return `📋 *Eventos Recurrentes*

No hay eventos recurrentes configurados.

Usa !recurrente agregar para crear un partido semanal.`;
};

/** Recurrente list message */
export const recurrenteListMessage = (events: any[], getDayName: (day: number) => string): string => {
  if (events.length === 0) {
    return recurrenteEmptyListMessage();
  }
  let message = `📋 *Eventos Recurrentes Semanales:*\n\n`;
  events.forEach((re: any, idx: number) => {
    const dayName = getDayName(re.dayOfWeek);
    const status = re.isActive ? '✅ Activo' : '⏸️ Pausado';
    message += `${idx + 1}. *${dayName}* ${re.startTime}\n`;
    message += `   ${status} | ${re.gameType}v${re.gameType} | ${re.teamsCount} equipos\n\n`;
  });
  return message;
};

/** Recurrente day required message */
export const recurrenteDayRequiredMessage = (action: string): string => {
  return `⚠️ *Día Requerido*\n\nUsa: !recurrente ${action} [día] [hora]\nEjemplo: !recurrente ${action} miércoles 18:00`;
};

/** Recurrente invalid day message */
export const recurrenteInvalidDayMessage = (): string => {
  return `⚠️ *Día Inválido*\n\nDías válidos: Domingo, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado`;
};

/** Recurrente not found message */
export const recurrenteNotFoundMessage = (dayName: string): string => {
  return `⚠️ *Evento Recurrente No Encontrado*\n\nNo hay evento recurrente el ${dayName}`;
};

/** Recurrente paused message */
export const recurrentePausedMessage = (dayName: string): string => {
  return `⏸️ *Evento Recurrente Pausado*\n\n${dayName} - La programación está pausada temporalmente\n\nUsa !recurrente reanudar para continuar`;
};

/** Recurrente resumed message */
export const recurrenteResumedMessage = (dayName: string): string => {
  return `✅ *Evento Recurrente Reanudado*\n\n${dayName} - La programación está activa nuevamente`;
};

/** Recurrente deleted message */
export const recurrenteDeletedMessage = (dayName: string): string => {
  return `🗑️ *Evento Recurrente Eliminado*\n\n${dayName} - La programación semanal ha sido eliminada`;
};

/** Recurrente invalid time message */
export const recurrenteInvalidTimeMessage = (): string => {
  return `⚠️ *Hora Inválida*\n\nUsa formato HH:MM, ej: 18:00`;
};

/** Recurrente created message */
export const recurrenteCreatedMessage = (
  dayName: string,
  time: string,
  totalDuration: number,
  minutesPerMatch: number,
  teamsCount: number,
  gameType: string,
  maxPlayers: number
): string => {
  return `✅ *Evento Recurrente Creado*\n\n📅 Cada ${dayName}\n⏰ Hora: ${time}\n⏱️ Duración: ${totalDuration} min\n⚽ Tipo: Fútbol ${gameType}\n👥 Equipos: ${teamsCount}\n👥 Máx. jugadores: ${maxPlayers}\n\n💡 El evento se creará automáticamente 3 días antes`;
};

/** Recurrente invalid action message */
export const recurrenteInvalidActionMessage = (): string => {
  return `⚠️ *Acción Inválida*\n\nUsa: agregar, pausar, reanudar, eliminar, listar`;
};

export const notInGroupMessage = (): string => {
  return `ℹ️ *Requiere grupo*

Este comando solo puede usarse dentro de un grupo de LINE.`;
};

/** Default group name */
export const defaultGroupName = (): string => {
  return 'Nuevo Grupo de Fútbol';
};

/** Default region */
export const defaultRegion = (): string => {
  return 'España';
};

export const scheduleMessage = (events: Event[]): string => {
  if (events.length === 0) return `📭 *No hay partidos agendados*`;
  let msg = `📅 *Próximos Partidos:*\n\n`;
  events.forEach((e, i) => {
    const d = new Date(e.eventDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    msg += `${i+1}. ${e.title || 'Partido'} - ${d} ${e.startTime}\n`;
  });
  return msg;
};

export const groupsListMessage = (groups: Group[]): string => {
  if (groups.length === 0) return `📋 *Sin Grupos*`;
  let msg = `📋 *Tus grupos:*\n\n`;
  groups.forEach((g, i) => {
    msg += `${i+1}. ${(g as any).name || 'Grupo'} (ID: ${g.id.substring(0,8)})\n`;
  });
  return msg;
};

export const joinedGroupMessage = (group?: Group): string => {
  return `👋 *¡FootLineBot se unió al grupo!*

📋 Usa !ayuda para ver todos los comandos.`;
};

export const invalidCommandMessage = (command?: string): string => {
  return `⚠️ *Comando Inválido*

Usa !ayuda para saber cómo hablarme.`;
};

function getPositionEs(position: string): string {
  const positions: Record<string, string> = {
    'GK': 'Portero',
    'CB': 'Líbero',
    'LB': 'Lat Izq',
    'RB': 'Lat Der',
    'CDM': 'Contención',
    'CM': 'Mediocentro',
    'CAM': 'Mediapunta',
    'LM': 'Volante Izq',
    'RM': 'Volante Der',
    'LW': 'Extremo Izq',
    'RW': 'Extremo Der',
    'CF': 'Falso 9',
    'ST': 'Delantero',
    'DC': 'Defensa Central',
    'DEF': 'Defensa',
    'MID': 'Medio',
    'FWD': 'Delantero',
  };
  return positions[position] || position;
}

export const lineupGeneratedMessage = (lineup: any, teams: any[]): string => {
  return `✅ *Alineaciones generadas*
Usa !alineacion para revisar las formaciones.`;
};

export const lineupMessage = (
  event: Event,
  teamAssignments?: any[],
  lineups?: any[],
  userId?: string
): string => {
  if (!lineups || lineups.length === 0) {
    return `⚽ *Alineaciones aún no generadas. Dile al Administrador que use !generar*`;
  }
  let message = `⚽ *Formaciones Oficiales*\n\n`;
  
  // Quick format
  const teamsCount = lineups.length || 2;
  for (let i = 1; i <= teamsCount; i++) {
    const lineup = lineups.find((l: any) => l.teamNumber === i);
    if (!lineup) continue;
    const assignments = lineup.positionAssignments || {};
    message += `🏟️ *Equipo ${i}:*\n`;
    for (const [pos, ids] of Object.entries(assignments)) {
      const posName = getPositionEs(pos);
      message += `• ${posName}: ${(ids as string[]).length} Jugador(es)\n`;
    }
    message += '\n';
  }
  message += `\n*Nota:* Ve la lista completa abriendo la URL del evento.`;
  return message;
};
