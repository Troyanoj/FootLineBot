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
• !perfil - Mira tu perfil y posiciones
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
  return `📋 *Comandos Completos*

*Para Jugadores:*
🔹 !apuntar o !inscribirme - Anótate al partido
🔹 !baja o !desinscribirme - Date de baja
🔹 !perfil - Configura tu posición y ve tu nivel
🔹 !alineacion - Mira la lista de equipos
🔹 !horario - Próximos partidos
🔹 !grupos - Tus grupos
🔹 !unirse [id] - Unirse a grupo

*Para Administradores:*
🔹 !crear_evento [fecha] [hora] [duracion] [min_partido] [equipos] - Crear evento
🔹 !configurar [5|7|11] - Tipo de juego
🔹 !generar - Arma equipos por rating
🔹 !cerrar - Cierra la lista
🔹 !tactica agregar [formación] - Nueva táctica
🔹 !tactica quitar [formación] - Quitar táctica
🔹 !recurrente - Eventos semanales

*Formaciones comunes:*
• Fútbol 7: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• Fútbol 11: 4-4-2, 4-3-3, 3-5-2`;
};

// ============================================================================

export const registrationSuccessMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return `✅ *¡Inscripción Exitosa!*

📅 *Evento:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${event.startTime}
⏱️ *Duración:* ${event.totalDurationMinutes} min

¡Nos vemos en la cancha! ⚽`;
};

export const registrationCancelSuccessMessage = (event: Event): string => {
  return `❌ *Baja confirmada*

Te has dado de baja de ${event.title || 'Partido'}.

¡Esperamos verte en el próximo juego! 👋`;
};

// Alias used by handlers
export const registrationCancelledMessage = registrationCancelSuccessMessage;

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

// ============================================================================
// Group Messages
// ============================================================================

export const groupRegisteredMessage = (groupName: string, groupId: string): string => {
  return `✅ *¡Grupo Registrado!*

🏟️ *Grupo:* ${groupName}
🆔 *ID:* ${groupId}

Usa !crear_evento para iniciar.`;
};

export const groupAlreadyRegisteredMessage = (groupName: string): string => {
  return `ℹ️ *Grupo ya existe*

${groupName} ya está en el sistema.`;
};

export const groupNotRegisteredMessage = (): string => {
  return `❌ *Grupo no registrado*`;
};

// ============================================================================
// Event Messages
// ============================================================================

export const eventCreatedMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return `✅ *¡Partido Creado!*

📅 *Evento:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${event.startTime}
⏱️ *Duración:* ${event.totalDurationMinutes} min
👥 *Equipos:* ${event.teamsCount} 
👨 *Por equipo:* ${Math.ceil((event.maxPlayers || 0) / (event.teamsCount || 1))}

📝 ¡A partir de este momento pueden usar !apuntar para jugar!`;
};

export const eventClosedMessage = (event: Event, registrations: Registration[]): string => {
  return `🔒 *¡Inscripciones Cerradas!*

👥 *Apuntados:* ${registrations.length} jugadores

¡Prepárense para el partido! ⚽`;
};

export const eventDetailsMessage = (event: Event, registrations: Registration[]): string => {
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
⭐ *Nivel:* ${user.rating || 5}/10
⚽ *Partidos:* ${user.totalMatches || 0}`;
};

export const notAdminMessage = (): string => {
  return `⛔ *Sin Autorización*

Este comando es exclusivo para organizadores.`;
};

export const notInGroupMessage = (): string => {
  return `ℹ️ *Requiere grupo*

Este comando solo sirve dentro de un grupo registrado.`;
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
