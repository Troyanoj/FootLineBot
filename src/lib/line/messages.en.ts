import type { User, Event, Registration, Group, Lineup, TeamAssignment } from '@/types';

// ============================================================================
// Welcome & Help Messages
// ============================================================================

export const welcomeMessage = (displayName: string): string => {
  return `👋 Hello ${displayName}! Welcome to FootLine Bot

⚽ I am your assistant for managing football matches with your group.

📋 *Available Commands:*

*For Players:*
• !register - Register for the current match
• !unregister - Cancel your registration
• !profile - View your profile
• !position [p1] [p2] [p3] - Set your positions
• !lineup - View the match lineup
• !schedule - View match schedule
• !groups - View your groups
• !join [id] - Join a group

*For Admins:*
• !create_event [date] [time] [duration] [min] [teams] - Create event
• !config [5|7|11] - Configure game type
• !generate - Generate balanced teams
• !close - Close registrations
• !tactics add [formation] - Add formation
• !tactics remove [formation] - Remove formation
• !recurring add [Day] [Time] - Create weekly match
• !recurring pause [Day] - Pause weekly match
• !recurring list - View recurring schedule

💡 Use !help to see detailed commands.`;
};

export const helpMessage = (): string => {
  return `📋 *FootLine Commands*

*For Players:*
🔹 !register - Sign up for a match
🔹 !unregister - Cancel your spot
🔹 !profile - View your profile
🔹 !position - Set preferred positions
🔹 !lineup - See team assignments
🔹 !schedule - View upcoming games
🔹 !join [id] - Join a group

*For Admins:*
🔹 !create_event
🔹 !config [5|7|11]
🔹 !generate - Generate teams
🔹 !close - Close registrations
🔹 !kick @User - Remove player
🔹 !recurring - Automate events

📖 *Detailed guide with images:*
https://app-omega-sand-14.vercel.app/help?lang=en`;
};

// ============================================================================
// Registration Messages
// ============================================================================

export const registrationSuccessMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  return `✅ *Registration Successful!*

📅 *Event:* ${event.title || 'Football Match'}
📆 *Date:* ${date}
⏰ *Time:* ${event.startTime}
⏱️ *Duration:* ${event.totalDurationMinutes} min

See you on the pitch! ⚽`;
};

export const registrationCancelSuccessMessage = (event: Event): string => {
  return `❌ *Registration Cancelled*

You have been removed from ${event.title || 'Match'}.

Hope to see you in the next one! 👋`;
};

// Alias used by handlers
export const registrationCancelledMessage = registrationCancelSuccessMessage;

/** Registration closed message */
export const registrationClosedMessage = (): string => {
  return `🔒 *Registration Closed*

Registration for this event has been closed.`;
};

export const noLineupMessage = (): string => {
  return `❌ *Lineups not ready yet*

The admin hasn't generated teams yet. Stay tuned!`;
};

export const registrationFailedNoEventMessage = (): string => {
  return `❌ *No events*

There are currently no open matches to register for.`;
};

export const registrationFailedEventFullMessage = (): string => {
  return `❌ *Fully Booked!*

This match has reached its player limit.`;
};

export const registrationFailedAlreadyRegisteredMessage = (): string => {
  return `ℹ️ *Already registered*

You are already signed up for this event.`;
};

// Aliases for user.handlers.ts consistency
export const noOpenEventMessage = registrationFailedNoEventMessage;

/** No registrations for lineup message */
export const noRegistrationsForLineupMessage = (): string => {
  return `⚠️ *No registrations*\n\nThere are no players registered for this event`;
};

/** Lineup generated with details message */
export const lineupGeneratedWithDetailsMessage = (eventTitle: string, teamsCount: number, playersCount: number): string => {
  return `✅ *Lineups generated*\n\nEvent: ${eventTitle || 'Football Match'}\nTeams: ${teamsCount}\nPlayers: ${playersCount}\n\nUse !lineup to view the lineups`;
};
export const alreadyRegisteredMessage = registrationFailedAlreadyRegisteredMessage;
export const notRegisteredMessage = (): string => `❌ *You are not registered for this event.*`;


// ============================================================================
// Group Messages
// ============================================================================

export const groupRegisteredMessage = (groupName: string, groupId: string): string => {
  return `✅ *Group Registered!*

🏟️ *Group:* ${groupName}
🆔 *ID:* ${groupId}

Use !create_event to start.`;
};

export const groupDeletedMessage = (groupName: string): string => {
  return `🗑️ *Group Deleted!*

Group "${groupName}" has been removed from the system.

Add the bot again and use !setup to start over.`;
};

export const groupAlreadyRegisteredMessage = (groupName: string): string => {
  return `ℹ️ *Group already exists*

${groupName} is already in the system.`;
};

export const groupNotRegisteredMessage = (): string => {
  return `❌ *Group not registered*`;
};

export const groupNotFoundMessage = (groupId?: string): string => {
  return `❌ *Group not found*\n\nUse !groups to see available groups.`;
};

export const alreadyMemberMessage = (groupName: string): string => {
  return `ℹ️ *Already a member*\n\nYou are already a member of ${groupName}.`;
};

// ============================================================================
// Event Messages
// ============================================================================

export const eventCreatedMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  return `✅ *Match Created!*

📅 *Event:* ${event.title || 'Football Match'}
📆 *Date:* ${date}
⏰ *Time:* ${event.startTime}
⏱️ *Duration:* ${event.totalDurationMinutes} min
👥 *Teams:* ${event.teamsCount} 
👨 *Per team:* ${Math.ceil((event.maxPlayers || 0) / (event.teamsCount || 1))}
🆔 *ID:* ${event.id}

📝 To delete this event use: !delete_event ${event.id}

📝 Players can now use !register to join!`;
};

export const eventClosedMessage = (event: Event, registrations: any[]): string => {
  return `🔒 *Registrations Closed!*

👥 *Players signed up:* ${registrations.length}

Get ready for the match! ⚽`;
};

export const eventDeletedMessage = (event: Event): string => {
  return `✅ *Event Deleted!*

The event "${event.title || event.id}" has been deleted.`;
};

export const userExpelledMessage = (groupName: string): string => {
  return `✅ *User Expelled!*

The user has been removed from the group "${groupName}".`;
};

export const eventDetailsMessage = (event: Event, registrations: any[]): string => {
  const date = new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const playerList = registrations.map((r: any, i) => `${i + 1}. ${r.user?.displayName || 'Unknown'}`).join('\n');
  return `📋 *Match Details*

📆 *Date:* ${date}
⏰ *Time:* ${event.startTime}
👥 *Players:* ${registrations.length}/${event.maxPlayers || '∞'}

📝 *Roster:*
${playerList || 'No one registered yet'}

💡 Use !register to join!`;
};

export const noEventsMessage = (): string => {
  return `📭 *Empty*

There are no upcoming events at the moment.`;
};

// ============================================================================
// Error Messages
// ============================================================================

export const errorMessage = (): string => {
  return `❌ *Internal Error*

Something went wrong processing your command.`;
};

export const unknownCommandMessage = (command: string): string => {
  return `❓ *Unknown Command*

I do not recognize the command "${command}".
Use !help to see available commands.`;
};

export const invalidParametersMessage = (command: string): string => {
  return `⚠️ *Invalid Parameters*

Check how to use !${command} with !help.`;
};

// ============================================================================
// Profile Messages
// ============================================================================

export const profileMessage = (user: User, groups: Group[]): string => {
  return `👤 *Your Profile*

📛 *Name:* ${user.displayName}
⚽ *Pos 1:* ${user.position1 || 'N/A'}
⚽ *Pos 2:* ${user.position2 || 'N/A'}
⚽ *Pos 3:* ${user.position3 || 'N/A'}
⭐ *Rating:* ${user.rating || 5}/10
⚽ *Matches:* ${user.totalMatches || 0}`;
};

export const notAdminMessage = (): string => {
  return `⛔ *Unauthorized*

This command is restricted to organizers.`;
};

// Alias for route.ts consistency
export const adminRequiredMessage = notAdminMessage;

export const adminInvalidFormatMessage = (command: string, example: string): string => {
  return `⚠️ *Invalid Format*

Use: !${command} ${example}

Example: !${command} 2024-12-25 18:00 90 20 2`;
};

export const adminConfigUpdatedMessage = (type: string): string => {
  return `✅ *Configuration updated*

Default game type: Football ${type}

This change affects new events created.`;
};

/** Tactica format error message */
export const tacticaFormatMessage = (): string => {
  return `⚠️ *Invalid Format*

Use: !tactica [add|remove] [formation]
or: !tactica [add|remove] [formation]

Examples:
• !tactica add 4-3-3
• !tactica add 3-2-1
• !tactica remove 4-3-3

*Available Formations:*
• 7-a-side: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• 5-a-side: 2-2, 1-2-1, 1-1-2, 2-1-1
• 11-a-side: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3`;
};

/** Tactica invalid action message */
export const tacticaInvalidActionMessage = (): string => {
  return `⚠️ *Invalid action* Use: add or remove`;
};

/** Tactica added message */
export const tacticaAddedMessage = (): string => {
  return 'Added';
};

/** Tactica removed message */
export const tacticaRemovedMessage = (): string => {
  return 'Removed';
};

/** Tactica success message */
export const tacticaSuccessMessage = (actionText: string, formation: string, groupName: string, availableFormations: string[]): string => {
  return `✅ *${actionText}*

📋 *Formation:* ${formation}
👥 *Group:* ${groupName}

*Available Formations:*
${availableFormations.map((t) => `• ${t}`).join('\n') || 'No formations available'}`;
};

// ============================================================================
// Recurrente Messages (English)
// ============================================================================

/** Recurrente format error message */
export const recurrenteFormatMessage = (): string => {
  return `⚠️ *Invalid Format*

Use: !recurring [add|pause|resume|delete|list] [day] [time]
or: !recurring [agregar|pausar|reanudar|eliminar|listar]

*Commands:*
• !recurring add Wednesday 18:00 - Create weekly match
• !recurring pause Wednesday - Pause weekly match
• !recurring resume Wednesday - Resume weekly match
• !recurring delete Wednesday - Delete weekly schedule
• !recurring list - View all recurring events

*Days of the week:*
Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday`;
};

/** Recurrente empty list message */
export const recurrenteEmptyListMessage = (): string => {
  return `📋 *Recurring Events*

No recurring events configured yet.

Use !recurring add to create a weekly match.`;
};

/** Recurrente list message */
export const recurrenteListMessage = (events: any[], getDayName: (day: number) => string): string => {
  if (events.length === 0) {
    return recurrenteEmptyListMessage();
  }
  let message = `📋 *Weekly Recurring Events:*\n\n`;
  events.forEach((re: any, idx: number) => {
    const dayName = getDayName(re.dayOfWeek);
    const status = re.isActive ? '✅ Active' : '⏸️ Paused';
    message += `${idx + 1}. *${dayName}* ${re.startTime}\n`;
    message += `   ${status} | ${re.gameType}v${re.gameType} | ${re.teamsCount} teams\n\n`;
  });
  return message;
};

/** Recurrente day required message */
export const recurrenteDayRequiredMessage = (action: string): string => {
  return `⚠️ *Day Required*\n\nUse: !recurring ${action} [day] [time]\nExample: !recurring ${action} Wednesday 18:00`;
};

/** Recurrente invalid day message */
export const recurrenteInvalidDayMessage = (): string => {
  return `⚠️ *Invalid Day*\n\nValid days: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday`;
};

/** Recurrente not found message */
export const recurrenteNotFoundMessage = (dayName: string): string => {
  return `⚠️ *Recurring Event Not Found*\n\nNo recurring event on ${dayName}`;
};

/** Recurrente paused message */
export const recurrentePausedMessage = (dayName: string): string => {
  return `⏸️ *Recurring Event Paused*\n\n${dayName} - Event scheduling is temporarily paused\n\nUse !recurring resume to resume`;
};

/** Recurrente resumed message */
export const recurrenteResumedMessage = (dayName: string): string => {
  return `✅ *Recurring Event Resumed*\n\n${dayName} - Event scheduling is active again`;
};

/** Recurrente deleted message */
export const recurrenteDeletedMessage = (dayName: string): string => {
  return `🗑️ *Recurring Event Deleted*\n\n${dayName} - Weekly schedule has been removed`;
};

/** Recurrente invalid time message */
export const recurrenteInvalidTimeMessage = (): string => {
  return `⚠️ *Invalid Time*\n\nUse HH:MM format, e.g., 18:00`;
};

/** Recurrente created message */
export const recurrenteCreatedMessage = (dayName: string, time: string, gameType: string): string => {
  return `✅ *Recurring Event Created*\n\n📅 Every ${dayName}\n⏰ Time: ${time}\n⚽ Type: ${gameType}-a-side\n\n💡 Use !recurring pause to pause scheduling`;
};

/** Recurrente invalid action message */
export const recurrenteInvalidActionMessage = (): string => {
  return `⚠️ *Invalid Action*\n\nUse: add, pause, resume, delete, list`;
};

export const notInGroupMessage = (): string => {
  return `ℹ️ *Group Required*

This command can only be used inside a LINE group.`;
};

/** Default group name */
export const defaultGroupName = (): string => {
  return 'New Football Group';
};

/** Default region */
export const defaultRegion = (): string => {
  return 'Global';
};

export const scheduleMessage = (events: Event[]): string => {
  if (events.length === 0) return `📭 *No scheduled matches*`;
  let msg = `📅 *Upcoming Matches:*\n\n`;
  events.forEach((e, i) => {
    const d = new Date(e.eventDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    msg += `${i+1}. ${e.title || 'Match'} - ${d} ${e.startTime}\n`;
  });
  return msg;
};

export const groupsListMessage = (groups: Group[]): string => {
  if (groups.length === 0) return `📋 *No Groups*`;
  let msg = `📋 *Your groups:*\n\n`;
  groups.forEach((g, i) => {
    msg += `${i+1}. ${(g as any).name || 'Group'} (ID: ${g.id.substring(0,8)})\n`;
  });
  return msg;
};

export const joinedGroupMessage = (group?: Group): string => {
  return `👋 *FootLineBot joined the group!*

📋 Use !help to see all commands.`;
};

export const invalidCommandMessage = (command?: string): string => {
  return `⚠️ *Invalid Command*

Use !help to know how to interact with me.`;
};

function getPositionEn(position: string): string {
  const positions: Record<string, string> = {
    'GK': 'Goalkeeper',
    'CB': 'Center Back',
    'LB': 'Left Back',
    'RB': 'Right Back',
    'CDM': 'Defensive Mid',
    'CM': 'Center Mid',
    'CAM': 'Attacking Mid',
    'LM': 'Left Mid',
    'RM': 'Right Mid',
    'LW': 'Left Winger',
    'RW': 'Right Winger',
    'CF': 'Center Forward',
    'ST': 'Striker',
    'DC': 'Central Defender',
    'DEF': 'Defender',
    'MID': 'Midfielder',
    'FWD': 'Forward',
  };
  return positions[position] || position;
}

export const lineupGeneratedMessage = (lineup: any, teams: any[]): string => {
  return `✅ *Lineups generated*
Use !lineup to review the formations.`;
};

export const lineupMessage = (
  event: Event,
  teamAssignments?: any[],
  lineups?: any[],
  userId?: string
): string => {
  if (!lineups || lineups.length === 0) {
    return `⚽ *Lineups not generated yet. Ask the Admin to use !generate*`;
  }
  let message = `⚽ *Official Formations*\n\n`;
  
  const teamsCount = lineups.length || 2;
  for (let i = 1; i <= teamsCount; i++) {
    const lineup = lineups.find((l: any) => l.teamNumber === i);
    if (!lineup) continue;
    const assignments = lineup.positionAssignments || {};
    message += `🏟️ *Team ${i}:*\n`;
    for (const [pos, ids] of Object.entries(assignments)) {
      const posName = getPositionEn(pos);
      message += `• ${posName}: ${(ids as string[]).length} Player(s)\n`;
    }
    message += '\n';
  }
  message += `\n*Note:* View the full list by opening the event URL.`;
  return message;
};
