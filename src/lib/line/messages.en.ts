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
• !profile - View your profile and positions
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
  return `📋 *All Commands*

*For Players:*
🔹 !register - Sign up for the match
🔹 !unregister - Cancel your spot
🔹 !profile - Set your position and rating
🔹 !lineup - Team assignments
🔹 !schedule - Upcoming games
🔹 !groups - Your active groups
🔹 !join [id] - Join a group

*For Admins:*
🔹 !create_event [date] [time] [dur] [min_game] [teams] - Create event
🔹 !config [5|7|11] - Game type
🔹 !generate - Make teams by rating
🔹 !close - Close list
🔹 !tactics add [formation] - New tactic
🔹 !tactics remove [formation] - Delete tactic
🔹 !recurring - Manage weekly events

*Common formations:*
• 7v7: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• 11v11: 4-4-2, 4-3-3, 3-5-2`;
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

// ============================================================================
// Group Messages
// ============================================================================

export const groupRegisteredMessage = (groupName: string, groupId: string): string => {
  return `✅ *Group Registered!*

🏟️ *Group:* ${groupName}
🆔 *ID:* ${groupId}

Use !create_event to start.`;
};

export const groupAlreadyRegisteredMessage = (groupName: string): string => {
  return `ℹ️ *Group already exists*

${groupName} is already in the system.`;
};

export const groupNotRegisteredMessage = (): string => {
  return `❌ *Group not registered*`;
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

📝 Players can now use !register to join!`;
};

export const eventClosedMessage = (event: Event, registrations: Registration[]): string => {
  return `🔒 *Registrations Closed!*

👥 *Players signed up:* ${registrations.length}

Get ready for the match! ⚽`;
};

export const eventDetailsMessage = (event: Event, registrations: Registration[]): string => {
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
⭐ *Rating:* ${user.rating || 5}/10
⚽ *Matches:* ${user.totalMatches || 0}`;
};

export const notAdminMessage = (): string => {
  return `⛔ *Unauthorized*

This command is restricted to organizers.`;
};

export const notInGroupMessage = (): string => {
  return `ℹ️ *Group Required*

This command only works inside a registered group.`;
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
