// LINE Message Templates
// These templates are used to send formatted responses to LINE users

import type { User, Event, Registration, Group, Lineup, TeamAssignment } from '@/types';

// ============================================================================
// Welcome & Help Messages
// ============================================================================

/** Welcome message for new users */
export const welcomeMessage = (displayName: string): string => {
  return `👋 ¡Hola ${displayName}! Bienvenido a FootLine Bot.

�⚽ Soy tu asistente para organizar partidos de fútbol con tu grupo.

📋 *Comandos disponibles:*

*Usuario:*
• !apuntar / Inscribirme - Apuntarte al evento actual
• !baja / Desinscribirme - Darte de baja del evento actual
• !perfil - Ver tu perfil y posiciones
• !alineacion - Ver tu alineación en el evento actual
• !horario - Ver el calendario de eventos
• !grupos - Listar grupos disponibles
• !unirse [id_grupo] - Unirse a un grupo

*Administrador:*
• !crear_evento - Crear un nuevo evento
• !configurar - Configurar tipo de juego
• !tactica - Gestionar tácticas
• !generar - Generar alineaciones
• !cerrar - Cerrar inscripciones

💡 *Consejos:*
- Usa !ayuda para ver este mensaje
- Contacta al admin del grupo para más información`;
};

/** Help message */
export const helpMessage = (): string => {
  return `📋 *Ayuda de Comandos*

*Usuario:*
🔹 !apuntar o Inscribirme - Apúntate al evento actual
🔹 !baja o Desinscribirme - Cancela tu inscripción
🔹 !perfil - Muestra tu perfil y posiciones preferidas
🔹 !alineacion - Ve tu posición en el equipo
🔹 !horario - Consulta los próximos eventos
🔹 !grupos - Lista los grupos disponibles
🔹 !unirse [id] - Únete a un grupo

*Administrador:*
🔹 !crear_evento [fecha] [hora] [duracion] [min_partido] [equipos] - Crear evento
🔹 !configurar [5|7|11] - Configurar tipo de juego
🔹 !tactica [agregar|quitar] [táctica] - Gestionar tácticas
🔹 !generar - Generar alineaciones automáticas
🔹 !cerrar - Cerrar inscripciones al evento

*Notas:*
- Los comandos funcionan con ! o /
- Algunos comandos requieren estar en un grupo`;
};

// ============================================================================
// Registration Messages
// ============================================================================

/** Registration success message */
export const registrationSuccessMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `✅ *¡Inscripción confirmada!*

📅 *Evento:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${event.startTime}
⏱️ *Duración:* ${event.totalDurationMinutes} minutos
⚽ *Tipo:* Fútbol ${event.gameType || '7'}

¡Nos vemos en el campo! 🏃⚽`;
};

/** Registration cancelled message */
export const registrationCancelledMessage = (event: Event): string => {
  return `❌ *Inscripción cancelada*

Te has dado de baja del evento: ${event.title || 'Partido de Fútbol'}

¡Espero verte en el próximo partido! 👋`;
};

/** Registration error - no open event */
export const noOpenEventMessage = (): string => {
  return `⚠️ *No hay eventos abiertos actualmente*

No hay ningún evento con inscripciones abiertas.
Usa !horario para ver los próximos eventos o contacta al administrador.`;
};

/** Registration error - already registered */
export const alreadyRegisteredMessage = (): string => {
  return `⚠️ *Ya estás inscrito*

Ya tienes una inscripción activa para este evento.
Usa !baja para cancelar tu inscripción.`;
};

/** Registration error - not registered */
export const notRegisteredMessage = (): string => {
  return `⚠️ *No estás inscrito*

No tienes inscripción en el evento actual.
Usa !apuntar para inscribirte.`;
};

// ============================================================================
// Profile Messages
// ============================================================================

/** User profile display message */
export const profileMessage = (user: User, groups?: Group[]): string => {
  let message = `👤 *Tu Perfil*

📛 *Nombre:* ${user.displayName}
⭐ *Rating:* ${user.rating}/5.0
⚽ *Partidos jugados:* ${user.totalMatches}
⏱️ *Minutos jugados:* ${user.totalPlayedMinutes}

🏃 *Posiciones:*
1️⃣ *Principal:* ${user.position1}
${user.position2 ? `2️⃣ *Secundaria:* ${user.position2}` : ''}
${user.position3 ? `3️⃣ *Terciaria:* ${user.position3}` : ''}`;

  if (groups && groups.length > 0) {
    message += `\n\n📂 *Grupos:*\n${groups.map((g) => `• ${g.name}`).join('\n')}`;
  }

  return message;
};

/** Profile update success message */
export const profileUpdateSuccessMessage = (): string => {
  return `✅ *Perfil actualizado*

Tu perfil ha sido modificado correctamente.
Usa !perfil para ver los cambios.`;
};

// ============================================================================
// Lineup Messages
// ============================================================================

/** Lineup display message */
export const lineupMessage = (
  event: Event,
  teamAssignments: TeamAssignment[],
  lineups: Lineup[],
  userId?: string
): string => {
  let message = `📋 *Alineación - ${event.title || 'Partido de Fútbol'}*\n\n`;

  // Group players by team
  for (const team of teamAssignments) {
    message += `*Equipo ${team.teamNumber}:*\n`;
    message += `Titulares: ${team.playerIds.length > 0 ? team.playerIds.join(', ') : 'Por asignar'}\n`;
    message += `Suplentes: ${team.substitutes.length > 0 ? team.substitutes.join(', ') : 'No hay'}\n\n`;
  }

  if (userId) {
    // Find user's team and position
    for (const team of teamAssignments) {
      const teamIndex = team.playerIds.indexOf(userId);
      if (teamIndex !== -1) {
        message += `\n🏃 *Tu posición:* Equipo ${team.teamNumber}, Titular\n`;
        break;
      }
      const subIndex = team.substitutes.indexOf(userId);
      if (subIndex !== -1) {
        message += `\n🏃 *Tu posición:* Equipo ${team.teamNumber}, Suplente\n`;
        break;
      }
    }
  }

  return message;
};

/** No lineup available message */
export const noLineupMessage = (): string => {
  return `⚠️ *Alineación no disponible*

Las alineaciones aún no han sido generadas.
Contacta al administrador para generar las alineaciones.`;
};

// ============================================================================
// Event Messages
// ============================================================================

/** Event schedule message */
export const scheduleMessage = (events: Event[]): string => {
  if (events.length === 0) {
    return `📅 *No hay eventos programados*

No hay eventos programados en este momento.
Contacta al administrador para crear uno.`;
  }

  let message = `📅 *Próximos Eventos*\n\n`;

  events.forEach((event, index) => {
    const date = new Date(event.eventDate).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const status = event.status === 'open' ? '✅ Abierta' : '❌ Cerrada';
    message += `${index + 1}. *${event.title || 'Partido'}*\n`;
    message += `   📆 ${date} • ⏰ ${event.startTime}\n`;
    message += `   ⚽ ${event.gameType || '7'} • 📊 ${status}\n\n`;
  });

  return message;
};

/** Event created message */
export const eventCreatedMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `✅ *Evento creado*

📅 *Título:* ${event.title || 'Partido de Fútbol'}
📆 *Fecha:* ${date}
⏰ *Hora:* ${event.startTime}
⏱️ *Duración:* ${event.totalDurationMinutes} minutos
⚽ *Tipo:* Fútbol ${event.gameType || '7'}

¡Usa !apuntar para inscribirte! 🏃⚽`;
};

/** Event registration closed message */
export const registrationClosedMessage = (event: Event): string => {
  return `🔒 *Inscripciones cerradas*

Las inscripciones para "${event.title || 'Partido de Fútbol'}" han sido cerradas.

*Inscritos:* ${event.maxPlayers || 'Máximo no definido'}
Usa !generar para crear las alineaciones.`;
};

// ============================================================================
// Group Messages
// ============================================================================

/** Groups list message */
export const groupsListMessage = (groups: Group[]): string => {
  if (groups.length === 0) {
    return `📂 *No hay grupos disponibles*

No hay grupos creados todavía.
Contacta al administrador para crear un grupo.`;
  }

  let message = `📂 *Grupos Disponibles*\n\n`;

  groups.forEach((group) => {
    message += `• *${group.name}*`;
    if (group.defaultGameType) {
      message += ` (${group.defaultGameType})`;
    }
    if (group.country) {
      message += ` - ${group.country}`;
    }
    message += `\n`;
    message += `   ID: ${group.id}\n\n`;
  });

  message += `Usa !unirse [ID] para unirte a un grupo`;

  return message;
};

/** Joined group message */
export const joinedGroupMessage = (group: Group): string => {
  return `✅ *Te has unido al grupo*

🏷️ *Grupo:* ${group.name}
⚽ *Tipo de juego:* ${group.defaultGameType || '7'}

¡Ya puedes apuntarte a los eventos del grupo! 🏃⚽`;
};

/** User not in group message */
export const notInGroupMessage = (): string => {
  return `⚠️ *No perteneces a ningún grupo*

Usa !grupos para ver los grupos disponibles
y !unirse [ID] para unirte a uno.`;
};

// ============================================================================
// Error Messages
// ============================================================================

/** Generic error message */
export const errorMessage = (): string => {
  return `❌ *Ha ocurrido un error*

Algo salió mal. Por favor, intenta de nuevo más tarde.
Si el problema persiste, contacta al administrador.`;
};

/** Invalid command message */
export const invalidCommandMessage = (): string => {
  return `⚠️ *Comando no reconocido*

Usa !ayuda para ver los comandos disponibles.`;
};

/** Admin required message */
export const adminRequiredMessage = (): string => {
  return `🔒 *Acceso denegado*

Este comando solo está disponible para administradores.
Contacta al administrador del grupo.`;
};

/** Invalid parameters message */
export const invalidParametersMessage = (command: string): string => {
  return `⚠️ *Parámetros incorrectos*

El comando !${command} requiere parámetros diferentes.
Usa !ayuda para ver el formato correcto.`;
};

// ============================================================================
// Quick Reply Templates
// ============================================================================

/** Quick reply actions for main menu */
export const mainMenuQuickReplies = () => {
  return {
    items: [
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📋 Ayuda',
          text: '!ayuda',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '⚽ Apuntarme',
          text: '!apuntar',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📅 Horario',
          text: '!horario',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '👤 Mi Perfil',
          text: '!perfil',
        },
      },
    ],
  };
};

// ============================================================================
// Confirmation Messages
// ============================================================================

/** Confirmation template for important actions */
export const confirmationTemplate = (
  title: string,
  description: string,
  confirmAction: string,
  cancelAction: string
) => {
  return {
    type: 'template' as const,
    altText: title,
    template: {
      type: 'confirm' as const,
      text: description,
      actions: [
        {
          type: 'message' as const,
          label: '✅ Sí',
          text: confirmAction,
        },
        {
          type: 'message' as const,
          label: '❌ No',
          text: cancelAction,
        },
      ],
    },
  };
};
