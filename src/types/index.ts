// Position types
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST' | 'LWB' | 'RWB' | 'LM' | 'RM' | 'DC' | 'CF';

export type CorePosition = 'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'CF' | 'ST' | 'DC';

export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'ATT';

export type TieBreaker = 'rating' | 'seniority' | 'random';

export type TacticName = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '2-2' | '1-2-1' | '3-2-1' | '2-3-1' | 'custom';

// Game type
export type GameType = '5' | '7' | '11';

// Group member role
export type MemberRole = 'admin' | 'member';

// Registration status
export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled' | 'confirmed';

// Event status
export type EventStatus = 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';

// User types
export interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  email?: string;
  position1: Position;
  position2?: Position;
  position3?: Position;
  rating: number;
  totalMatches: number;
  totalPlayedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  lineUserId: string;
  displayName: string;
  email?: string;
  position1: Position;
  position2?: Position;
  position3?: Position;
}

export interface UpdateUserInput {
  email?: string;
  position1?: Position;
  position2?: Position;
  position3?: Position;
}

// Group types
export interface Group {
  id: string;
  name: string;
  country?: string;
  adminUserId?: string;
  defaultGameType?: GameType;
  tactics: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupInput {
  name: string;
  country?: string;
  defaultGameType?: GameType;
}

export interface UpdateGroupInput {
  name?: string;
  country?: string;
  defaultGameType?: GameType;
  tactics?: Record<string, unknown>;
}

// Group Member types
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

// Event types
export interface Event {
  id: string;
  groupId: string;
  title?: string;
  eventDate: Date;
  startTime: string;
  totalDurationMinutes: number;
  minutesPerMatch: number;
  teamsCount: number;
  gameType?: GameType;
  maxPlayers?: number;
  status: EventStatus;
  registrationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  groupId: string;
  title?: string;
  eventDate: Date;
  startTime: string;
  totalDurationMinutes?: number;
  minutesPerMatch?: number;
  teamsCount?: number;
  gameType?: GameType;
  maxPlayers?: number;
  registrationDeadline?: Date;
}

export interface UpdateEventInput {
  title?: string;
  eventDate?: Date;
  startTime?: string;
  totalDurationMinutes?: number;
  minutesPerMatch?: number;
  teamsCount?: number;
  gameType?: GameType;
  maxPlayers?: number;
  status?: EventStatus;
  registrationDeadline?: Date;
}

// Registration types
export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  notes?: string;
}

export interface CreateRegistrationInput {
  eventId: string;
  userId: string;
  notes?: string;
}

// Team Assignment types
export interface TeamAssignment {
  id: string;
  eventId: string;
  teamNumber: number;
  playerIds: string[];
  substitutes: string[];
  createdAt: Date;
}

// Lineup types
export interface Lineup {
  id: string;
  eventId: string;
  teamNumber: number;
  positionAssignments: Record<string, string[]>; // position -> player IDs
  createdAt: Date;
}

// User Rest Log types
export interface UserRestLog {
  id: string;
  userId: string;
  eventId: string;
  wasResting: boolean;
  restReason?: string;
  loggedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// LINE webhook types
export interface LineWebhookEvent {
  type: string;
  replyToken?: string;
  source: {
    type: 'user' | 'group' | 'room';
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  timestamp: number;
  message?: {
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';
    id: string;
    text?: string;
  };
  postback?: {
    data?: string;
    params?: Record<string, unknown>;
  };
}

export interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}

// ============================================
// Lineup Generation Types
// ============================================

// Player data for lineup generation
export interface PlayerForLineup {
  id: string;
  lineUserId: string;
  displayName: string;
  position1: CorePosition;
  position2?: CorePosition;
  position3?: CorePosition;
  rating: number;
  totalMatches: number;
  totalPlayedMinutes: number;
  createdAt: Date;
}

// Options for lineup generation
export interface LineupGenerationOptions {
  eventId: string;
  gameType: GameType;
  tactic: TacticName | string;
  teamsCount: number;
  tieBreaker?: TieBreaker;
}

// Position assignment for a single position
export interface PositionAssignment {
  position: CorePosition;
  playerId: string;
  playerName: string;
  preferenceLevel: 1 | 2 | 3; // 1 = first choice, 2 = second choice, 3 = third choice
}

// Team distribution result
export interface TeamDistribution {
  teams: {
    teamNumber: number;
    players: PlayerForLineup[];
    substitutes: PlayerForLineup[];
    resting: PlayerForLineup[];
  }[];
}

// Lineup generation result
export interface LineupGenerationResult {
  eventId: string;
  teams: TeamDistribution['teams'];
  positionAssignments: Map<number, PositionAssignment[]>;
  teamAssignments: TeamAssignment[];
  lineups: Lineup[];
  restLogs: UserRestLog[];
}

// Tactic definition
export interface TacticDefinition {
  name: string;
  positions: CorePosition[];
  description?: string;
}

// ============================================
// Service-specific Types
// ============================================

// Event with registration details (used in event.service.ts)
export interface EventWithDetails {
  event: Event;
  registrations: EventRegistrationWithUser[];
  registrationCount: number;
  maxPlayers: number | null;
}

export interface EventRegistrationWithUser {
  id: string;
  userId: string;
  displayName: string;
  position1: string;
  position2: string | null;
  position3: string | null;
  rating: number;
  status: RegistrationStatus;
  registeredAt: Date;
}

// Registration with user details (used in registration.service.ts)
export interface RegistrationWithUser extends Registration {
  user: {
    id: string;
    displayName: string;
    position1: string;
    position2: string | null;
    position3: string | null;
    rating: number;
  };
}

// Group member with user details (used in group.service.ts)
export interface GroupMemberWithUser extends GroupMember {
  user: {
    id: string;
    lineUserId: string;
    displayName: string;
    position1: string;
    position2: string | null;
    position3: string | null;
    rating: number;
  };
}

// User profile for LINE display
export interface UserProfile {
  id: string;
  displayName: string;
  positions: string[];
  rating: number;
  totalMatches: number;
}

// Group configuration for admin
export interface GroupConfig {
  id: string;
  name: string;
  country?: string;
  defaultGameType?: GameType;
  tactics: string[];
  memberCount: number;
  adminId?: string;
}

// Event schedule item
export interface EventScheduleItem {
  id: string;
  title: string | null;
  date: string;
  time: string;
  dayOfWeek: string;
  status: EventStatus;
  registered: number;
  maxPlayers: number | null;
}

export interface EventSchedule {
  upcoming: EventScheduleItem[];
  past: EventScheduleItem[];
}

// Waitlist item
export interface WaitlistItem {
  id: string;
  userId: string;
  displayName: string;
  position: number;
  registeredAt: Date;
}

// Registration check result
export interface RegistrationCheckResult {
  allowed: boolean;
  reason?: string;
  waitlistPosition?: number;
}

// Group admin info
export interface GroupAdminInfo {
  id: string;
  lineUserId: string;
  displayName: string;
}

// LINE user profile
export interface LineUserProfile {
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
}
