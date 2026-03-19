// Combine class names (simple version)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// Format date to ISO string (YYYY-MM-DD)
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format time to HH:mm
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

// Parse time string (HH:mm) to Date
export function parseTime(timeString: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Generate UUID
export function generateUUID(): string {
  return crypto.randomUUID();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate position
export const VALID_POSITIONS = ['GK', 'DEF', 'MID', 'FWD', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'] as const;
export type Position = typeof VALID_POSITIONS[number];

export function isValidPosition(position: string): position is Position {
  return VALID_POSITIONS.includes(position as Position);
}

// Validate game type
export const VALID_GAME_TYPES = ['5', '7', '11'] as const;
export type GameType = typeof VALID_GAME_TYPES[number];

export function isValidGameType(gameType: string): gameType is GameType {
  return VALID_GAME_TYPES.includes(gameType as GameType);
}

// Calculate max players for a game type
export function getMaxPlayers(gameType: GameType, teamsCount: number = 2): number {
  return parseInt(gameType) * teamsCount;
}

// Sort players by rating (descending)
export function sortByRating<T extends { rating: number }>(players: T[]): T[] {
  return [...players].sort((a, b) => b.rating - a.rating);
}

// Group players by position
export function groupByPosition<T extends { position1: string }>(
  players: T[]
): Record<string, T[]> {
  return players.reduce((acc, player) => {
    const position = player.position1;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, T[]>);
}

// Calculate team balance score
export function calculateTeamBalance(players: { rating: number }[]): number {
  if (players.length === 0) return 0;
  const totalRating = players.reduce((sum, p) => sum + p.rating, 0);
  return totalRating / players.length;
}

// Paginate array
export function paginate<T>(array: T[], page: number, limit: number): T[] {
  const startIndex = (page - 1) * limit;
  return array.slice(startIndex, startIndex + limit);
}

// Generate API response
export function apiResponse<T>(
  data: T,
  status: 'success' | 'error' = 'success'
): { success: boolean; data: T } {
  return {
    success: status === 'success',
    data,
  };
}

// Generate error response
export function errorResponse(
  message: string,
  statusCode: number = 400
): { success: boolean; error: string; statusCode: number } {
  return {
    success: false,
    error: message,
    statusCode,
  };
}
