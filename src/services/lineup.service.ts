import prisma from '@/lib/db/prisma';
import type {
  Lineup,
  TeamAssignment,
  Position,
  GameType,
  CorePosition,
  TieBreaker,
  PlayerForLineup,
  LineupGenerationOptions,
  PositionAssignment,
  TeamDistribution,
  LineupGenerationResult,
  TacticDefinition,
  UserRestLog,
} from '@/types';

// ============================================
// Constants
// ============================================

// Position mappings by game type
const POSITION_MAPPINGS: Record<GameType, Record<string, number>> = {
  '11': {
    GK: 1,
    CB: 4,
    LB: 1,
    RB: 1,
    CDM: 1,
    CM: 2,
    CAM: 1,
    LW: 1,
    RW: 1,
    ST: 2,
  },
  '7': {
    GK: 1,
    CB: 2,
    CM: 2,
    CAM: 1,
    ST: 1,
  },
  '5': {
    GK: 1,
    DEF: 1,
    MID: 2,
    FWD: 1,
  },
};

// Position category mapping
const POSITION_CATEGORIES: Record<CorePosition, CorePosition[]> = {
  GK: ['GK'],
  CB: ['CB', 'DC'],
  LB: ['LB', 'LWB'],
  RB: ['RB', 'RWB'],
  LWB: ['LWB', 'LB'],
  RWB: ['RWB', 'RB'],
  CDM: ['CDM', 'CM', 'CAM'],
  CM: ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM', 'CDM'],
  LM: ['LM', 'RM', 'LW', 'RW'],
  RM: ['RM', 'LM', 'LW', 'RW'],
  LW: ['LW', 'LM', 'RW', 'RM'],
  RW: ['RW', 'RM', 'LW', 'LM'],
  CF: ['CF', 'ST'],
  ST: ['ST', 'CF', 'DC'],
  DC: ['DC', 'CB', 'ST'],
};

// Standard tactic definitions
const TACTICS: Record<string, CorePosition[]> = {
  // 11v11 tactics
  '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
  '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
  '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'],
  '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'ST', 'ST'],
  '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'CM', 'CM', 'ST'],
  '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
  // 7v7 tactics
  '3-2-1': ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'ST'],
  '2-3-1': ['GK', 'CB', 'CB', 'CM', 'CM', 'CM', 'ST'],
  '2-2-2': ['GK', 'CB', 'CB', 'CM', 'CM', 'ST', 'ST'],
  '3-1-2': ['GK', 'CB', 'CB', 'CB', 'CDM', 'CM', 'ST'],
  // 5v5 tactics
  '2-2': ['GK', 'CB', 'CB', 'ST', 'ST'],
  '1-2-1': ['GK', 'CB', 'CM', 'CM', 'ST'],
  '1-1-2': ['GK', 'CB', 'CM', 'ST', 'ST'],
  '2-1-1': ['GK', 'CB', 'CB', 'CM', 'ST'],
};

// ============================================
// Service Class
// ============================================

export class LineupService {
  /**
   * Get lineup by event ID
   */
  async getByEventId(eventId: string): Promise<Lineup[]> {
    return prisma.lineup.findMany({
      where: { eventId },
      orderBy: { teamNumber: 'asc' },
    });
  }

  /**
   * Get team assignments by event ID
   */
  async getTeamAssignments(eventId: string): Promise<TeamAssignment[]> {
    return prisma.teamAssignment.findMany({
      where: { eventId },
      orderBy: { teamNumber: 'asc' },
    });
  }

  /**
   * Generate complete lineups for an event
   * Note: Each LINE group represents ONE team, so we always generate for exactly 1 team
   * The teamsCount parameter is preserved for scheduling calculations but not used for lineup distribution
   */
  async generateLineups(options: LineupGenerationOptions): Promise<LineupGenerationResult> {
    const { eventId, gameType, tactic, teamsCount, tieBreaker = 'rating' } = options;

    // 1. Get registered players for the event
    const registeredPlayers = await this.getRegisteredPlayers(eventId);
    
    if (registeredPlayers.length === 0) {
      throw new Error('No registered players found for this event');
    }

    // 2. Get tactic positions
    const tacticPositions = this.getTacticPositions(tactic, gameType);
    const spotsPerTeam = tacticPositions.length;

    // 3. Calculate total spots needed (always for 1 team since each LINE group is one team)
    const effectiveTeamsCount = 1;
    const totalSpots = spotsPerTeam * effectiveTeamsCount;

    // 4. Handle rotation (distribute players to teams, substitutes, and resting)
    // We use effectiveTeamsCount = 1 for distribution, but preserve original teamsCount for return
    const distribution = await this.handleRotation(registeredPlayers, effectiveTeamsCount, spotsPerTeam, tieBreaker);

    // 5. Assign positions to each team
    const positionAssignments = new Map<number, PositionAssignment[]>();
    const restLogs: { userId: string; eventId: string; wasResting: boolean }[] = [];

    for (const team of distribution.teams) {
      const assignments = this.assignTeamPositions(team.players, tacticPositions, tieBreaker);
      positionAssignments.set(team.teamNumber, assignments);

      // Log resting players
      for (const player of team.resting) {
        restLogs.push({
          userId: player.id,
          eventId,
          wasResting: true,
        });
      }
    }

    // 6. Store in database
    const teamAssignments = await this.storeTeamAssignments(eventId, distribution);
    const lineups = await this.storeLineups(eventId, positionAssignments);
    const savedRestLogs = await this.storeRestLogs(restLogs);

    return {
      eventId,
      teams: distribution.teams,
      positionAssignments,
      teamAssignments,
      lineups,
      restLogs: savedRestLogs as unknown as UserRestLog[],
    };
  }

  /**
   * Legacy function for generateLineup
   */
  async generateLineup(eventId: string): Promise<{ teamAssignments: TeamAssignment[]; lineups: Lineup[] }> {
    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const gameType = (event.gameType || '7') as GameType;
    const teamsCount = event.teamsCount || 2;

    // Get group default tactic
    const group = await prisma.group.findUnique({
      where: { id: event.groupId },
    });

    const groupTactics = group?.tactics as Record<string, unknown> | undefined;
    const defaultTactic = groupTactics?.default as string | undefined || '4-4-2';

    const result = await this.generateLineups({
      eventId,
      gameType,
      tactic: defaultTactic,
      teamsCount,
      tieBreaker: 'rating',
    });

    return {
      teamAssignments: result.teamAssignments,
      lineups: result.lineups,
    };
  }

  /**
   * Get registered players for an event
   */
  async getRegisteredPlayers(eventId: string): Promise<PlayerForLineup[]> {
    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: { in: ['registered', 'confirmed'] },
      },
      include: {
        user: true,
      },
    });

    return registrations.map((reg: { user: { id: string; lineUserId: string; displayName: string; position1: string; position2: string | null; position3: string | null; rating: { toNumber: () => number }; totalMatches: number; totalPlayedMinutes: number; createdAt: Date } }) => ({
      id: reg.user.id,
      lineUserId: reg.user.lineUserId,
      displayName: reg.user.displayName,
      position1: reg.user.position1 as CorePosition,
      position2: (reg.user.position2 as CorePosition) || undefined,
      position3: (reg.user.position3 as CorePosition) || undefined,
      rating: reg.user.rating.toNumber(),
      totalMatches: reg.user.totalMatches,
      totalPlayedMinutes: reg.user.totalPlayedMinutes,
      createdAt: reg.user.createdAt,
    }));
  }

  /**
   * Get tactic positions from tactic name or custom string
   */
  getTacticPositions(tactic: string, gameType: GameType): CorePosition[] {
    // Check if it's a known tactic
    if (TACTICS[tactic]) {
      return TACTICS[tactic];
    }

    // Try to parse custom tactic string (e.g., "4-4-2" or "3-2-3-2")
    const parts = tactic.split('-').map((p) => p.trim());
    
    if (parts.length >= 2) {
      // Try to generate positions based on the formation pattern
      return this.parseTacticString(tactic, gameType);
    }

    // Default fallback based on game type
    return this.getDefaultTactic(gameType);
  }

  /**
   * Parse tactic string to positions
   */
  private parseTacticString(tactic: string, gameType: GameType): CorePosition[] {
    const parts = tactic.split('-').map((p) => parseInt(p.trim(), 10));
    
    if (gameType === '11') {
      return this.generate11v11Positions(parts);
    } else if (gameType === '7') {
      return this.generate7v7Positions(parts);
    } else {
      return this.generate5v5Positions(parts);
    }
  }

  /**
   * Generate 11v11 positions from formation numbers
   */
  private generate11v11Positions(parts: number[]): CorePosition[] {
    const positions: CorePosition[] = ['GK'];
    
    if (parts.length === 4) {
      // Classic formation like 4-4-2, 4-3-3, 3-5-2
      const [def, mid, , fwd] = parts;
      
      // Defense
      for (let i = 0; i < def - 1; i++) positions.push('CB');
      if (def > 1) {
        positions.push('LB');
        positions.push('RB');
      }
      
      // Midfield
      for (let i = 0; i < mid; i++) positions.push('CM');
      
      // Forward
      for (let i = 0; i < fwd; i++) positions.push('ST');
    } else if (parts.length === 5) {
      // Formation with double pivot like 4-2-3-1
      const [def, def2, mid, , fwd] = parts;
      
      // Defense
      for (let i = 0; i < def - 1; i++) positions.push('CB');
      if (def > 1) {
        positions.push('LB');
        positions.push('RB');
      }
      
      // Defensive midfield
      for (let i = 0; i < def2; i++) positions.push('CDM');
      
      // Midfield
      for (let i = 0; i < mid; i++) positions.push('CM');
      
      // Forward
      for (let i = 0; i < fwd; i++) positions.push('ST');
    } else {
      // Default to 4-4-2
      return ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'];
    }
    
    return positions;
  }

  /**
   * Generate 7v7 positions from formation numbers
   */
  private generate7v7Positions(parts: number[]): CorePosition[] {
    const positions: CorePosition[] = ['GK'];
    
    if (parts.length >= 3) {
      const [def, mid, fwd] = parts;
      
      // Defense
      for (let i = 0; i < def; i++) positions.push('CB');
      
      // Midfield
      for (let i = 0; i < mid; i++) positions.push('CM');
      
      // Forward
      for (let i = 0; i < fwd; i++) positions.push('ST');
    } else {
      // Default to 3-2-1
      return ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'ST'];
    }
    
    return positions;
  }

  /**
   * Generate 5v5 positions from formation numbers
   */
  private generate5v5Positions(parts: number[]): CorePosition[] {
    const positions: CorePosition[] = ['GK'];
    
    if (parts.length >= 2) {
      const [def, mid, fwd] = parts;
      
      // Defense
      for (let i = 0; i < def; i++) positions.push('CB');
      
      // Midfield
      for (let i = 0; i < mid; i++) positions.push('CM');
      
      // Forward
      if (fwd) {
        for (let i = 0; i < fwd; i++) positions.push('ST');
      }
    } else {
      // Default to 2-2
      return ['GK', 'CB', 'CB', 'ST', 'ST'];
    }
    
    return positions;
  }

  /**
   * Get default tactic for a game type
   */
  private getDefaultTactic(gameType: GameType): CorePosition[] {
    switch (gameType) {
      case '11':
        return ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'];
      case '7':
        return ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'ST'];
      case '5':
      default:
        return ['GK', 'CB', 'CB', 'ST', 'ST'];
    }
  }

  /**
   * Balance teams by distributing players evenly
   */
  balanceTeams(players: PlayerForLineup[], teamsCount: number, tieBreaker: TieBreaker = 'rating'): PlayerForLineup[][] {
    // Sort players based on tie-breaker
    const sortedPlayers = this.sortPlayers([...players], tieBreaker);

    // Initialize teams
    const teams: PlayerForLineup[][] = Array.from({ length: teamsCount }, () => []);

    // Round-robin distribution
    sortedPlayers.forEach((player, index) => {
      const teamIndex = index % teamsCount;
      teams[teamIndex].push(player);
    });

    return teams;
  }

  /**
   * Sort players based on tie-breaker
   */
  private sortPlayers(players: PlayerForLineup[], tieBreaker: TieBreaker): PlayerForLineup[] {
    switch (tieBreaker) {
      case 'rating':
        return players.sort((a, b) => b.rating - a.rating);
      case 'seniority':
        return players.sort((a, b) => a.totalMatches - b.totalMatches);
      case 'random':
      default:
        return this.shuffleArray(players);
    }
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Handle rotation - distribute players to teams, substitutes, and resting
   */
  async handleRotation(
    players: PlayerForLineup[],
    teamsCount: number,
    spotsPerTeam: number,
    tieBreaker: TieBreaker = 'rating'
  ): Promise<TeamDistribution> {
    const totalSpots = spotsPerTeam * teamsCount;
    
    // Get rest history to prioritize players with fewer rests
    const restHistory = await this.getRestHistory(players.map(p => p.id));
    const playersWithRestCount = players.map(p => ({
      ...p,
      restCount: restHistory[p.id] || 0,
    }));

    // Sort by rest count (ascending) first, then by tie-breaker
    const sortedPlayers = playersWithRestCount.sort((a, b) => {
      if (a.restCount !== b.restCount) {
        return a.restCount - b.restCount; // Prioritize fewer rests
      }
      // Then apply tie-breaker
      switch (tieBreaker) {
        case 'rating':
          return b.rating - a.rating;
        case 'seniority':
          return a.totalMatches - b.totalMatches;
        default:
          return Math.random() - 0.5;
      }
    });

    // Distribute players
    const teams: TeamDistribution['teams'] = [];
    
    if (players.length <= totalSpots) {
      // All players can play, distribute evenly
      const balancedTeams = this.balanceTeams(sortedPlayers, teamsCount, tieBreaker);
      
      for (let i = 0; i < teamsCount; i++) {
        teams.push({
          teamNumber: i + 1,
          players: balancedTeams[i],
          substitutes: [],
          resting: [],
        });
      }
    } else {
      // More players than spots - need substitutes and resting
      // First, fill all team spots
      const allTeamSpots = teamsCount * spotsPerTeam;
      const playingPlayers = sortedPlayers.slice(0, allTeamSpots);
      const extraPlayers = sortedPlayers.slice(allTeamSpots);

      // Balance playing players across teams
      const balancedTeams = this.balanceTeams(playingPlayers, teamsCount, tieBreaker);

      // Distribute extras as substitutes (up to max 2 per team)
      const substitutesPerTeam = Math.ceil(extraPlayers.length / teamsCount);
      
      for (let i = 0; i < teamsCount; i++) {
        const substitutesStart = i * substitutesPerTeam;
        const substitutesEnd = Math.min(substitutesStart + substitutesPerTeam, extraPlayers.length);
        const substitutes = extraPlayers.slice(substitutesStart, substitutesEnd);

        teams.push({
          teamNumber: i + 1,
          players: balancedTeams[i],
          substitutes,
          resting: [],
        });
      }

      // If still more players, mark as resting (for multi-round events)
      if (extraPlayers.length > teamsCount * 2) {
        // Additional resting players beyond substitutes
        const additionalResting = extraPlayers.slice(teamsCount * 2);
        
        // Distribute resting players across teams evenly
        additionalResting.forEach((player, index) => {
          const teamIndex = index % teamsCount;
          teams[teamIndex].resting.push(player);
        });
      }
    }

    return { teams };
  }

  /**
   * Get rest history for players
   */
  private async getRestHistory(playerIds: string[]): Promise<Record<string, number>> {
    const restLogs = await prisma.userRestLog.groupBy({
      by: ['userId'],
      where: {
        userId: { in: playerIds },
        wasResting: true,
      },
      _count: true,
    });

    const result: Record<string, number> = {};
    for (const log of restLogs) {
      result[log.userId] = log._count;
    }
    return result;
  }

  /**
   * Assign positions to players in a team (internal algorithm)
   */
  assignTeamPositions(
    teamPlayers: PlayerForLineup[],
    tacticPositions: CorePosition[],
    tieBreaker: TieBreaker = 'rating'
  ): PositionAssignment[] {
    const assignments: PositionAssignment[] = [];
    const availablePlayers = [...teamPlayers];
    const usedPlayerIds = new Set<string>();

    for (const position of tacticPositions) {
      const candidate = this.findBestCandidate(availablePlayers, position, tieBreaker, usedPlayerIds);
      
      if (candidate) {
        assignments.push({
          position,
          playerId: candidate.player.id,
          playerName: candidate.player.displayName,
          preferenceLevel: candidate.preferenceLevel,
        });
        usedPlayerIds.add(candidate.player.id);
        
        // Remove from available
        const index = availablePlayers.findIndex(p => p.id === candidate.player.id);
        if (index > -1) {
          availablePlayers.splice(index, 1);
        }
      } else {
        // No suitable player found - assign best available
        const fallback = this.findFallbackPlayer(availablePlayers, usedPlayerIds);
        if (fallback) {
          assignments.push({
            position,
            playerId: fallback.id,
            playerName: fallback.displayName,
            preferenceLevel: 3, // Not preferred
          });
          usedPlayerIds.add(fallback.id);
          
          const index = availablePlayers.findIndex(p => p.id === fallback.id);
          if (index > -1) {
            availablePlayers.splice(index, 1);
          }
        }
      }
    }

    return assignments;
  }

  /**
   * Find best candidate for a position
   */
  private findBestCandidate(
    players: PlayerForLineup[],
    position: CorePosition,
    tieBreaker: TieBreaker,
    usedPlayerIds: Set<string>
  ): { player: PlayerForLineup; preferenceLevel: 1 | 2 | 3 } | null {
    // Get compatible positions
    const compatiblePositions = POSITION_CATEGORIES[position] || [position];

    // Find players who have this position in their preferences
    const candidates = players.filter(p => !usedPlayerIds.has(p.id));

    // Check preference level 1
    let bestCandidates = candidates.filter(p => 
      compatiblePositions.includes(p.position1)
    );
    
    if (bestCandidates.length > 0) {
      const selected = this.selectBestByTieBreaker(bestCandidates, tieBreaker);
      return { player: selected, preferenceLevel: 1 };
    }

    // Check preference level 2
    bestCandidates = candidates.filter(p => 
      p.position2 && compatiblePositions.includes(p.position2)
    );
    
    if (bestCandidates.length > 0) {
      const selected = this.selectBestByTieBreaker(bestCandidates, tieBreaker);
      return { player: selected, preferenceLevel: 2 };
    }

    // Check preference level 3
    bestCandidates = candidates.filter(p => 
      p.position3 && compatiblePositions.includes(p.position3)
    );
    
    if (bestCandidates.length > 0) {
      const selected = this.selectBestByTieBreaker(bestCandidates, tieBreaker);
      return { player: selected, preferenceLevel: 3 };
    }

    return null;
  }

  /**
   * Find fallback player when no preference matches
   */
  private findFallbackPlayer(
    players: PlayerForLineup[],
    usedPlayerIds: Set<string>
  ): PlayerForLineup | null {
    const available = players.filter(p => !usedPlayerIds.has(p.id));
    if (available.length === 0) return null;
    
    // Return the highest-rated available player
    return available.sort((a, b) => b.rating - a.rating)[0];
  }

  /**
   * Select best player using tie-breaker
   */
  private selectBestByTieBreaker(
    candidates: PlayerForLineup[],
    tieBreaker: TieBreaker
  ): PlayerForLineup {
    switch (tieBreaker) {
      case 'rating':
        return candidates.sort((a, b) => b.rating - a.rating)[0];
      case 'seniority':
        return candidates.sort((a, b) => b.totalMatches - a.totalMatches)[0];
      case 'random':
      default:
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  /**
   * Store team assignments in database
   */
  private async storeTeamAssignments(
    eventId: string,
    distribution: TeamDistribution
  ): Promise<TeamAssignment[]> {
    // Delete existing team assignments for this event
    await prisma.teamAssignment.deleteMany({
      where: { eventId },
    });

    const assignments: TeamAssignment[] = [];

    for (const team of distribution.teams) {
      const assignment = await prisma.teamAssignment.create({
        data: {
          eventId,
          teamNumber: team.teamNumber,
          playerIds: team.players.map(p => p.id),
          substitutes: team.substitutes.map(p => p.id),
        },
      });
      assignments.push(assignment);
    }

    return assignments;
  }

  /**
   * Store lineups in database
   */
  private async storeLineups(
    eventId: string,
    positionAssignments: Map<number, PositionAssignment[]>
  ): Promise<Lineup[]> {
    // Delete existing lineups for this event
    await prisma.lineup.deleteMany({
      where: { eventId },
    });

    const lineups: Lineup[] = [];

    for (const [teamNumber, assignments] of Array.from(positionAssignments.entries())) {
      // Convert assignments to record format
      const positionAssignmentsRecord: Record<string, string[]> = {};
      
      for (const assignment of assignments) {
        if (!positionAssignmentsRecord[assignment.position]) {
          positionAssignmentsRecord[assignment.position] = [];
        }
        positionAssignmentsRecord[assignment.position].push(assignment.playerId);
      }

      const lineup = await prisma.lineup.create({
        data: {
          eventId,
          teamNumber,
          positionAssignments: positionAssignmentsRecord,
        },
      });
      lineups.push(lineup);
    }

    return lineups;
  }

  /**
   * Store rest logs in database
   */
  private async storeRestLogs(
    restLogs: { userId: string; eventId: string; wasResting: boolean }[]
  ): Promise<{ userId: string; eventId: string; wasResting: boolean }[]> {
    if (restLogs.length === 0) return restLogs;

    await prisma.userRestLog.createMany({
      data: restLogs.map(log => ({
        userId: log.userId,
        eventId: log.eventId,
        wasResting: log.wasResting,
        restReason: 'rotation',
      })),
    });

    return restLogs;
  }

  /**
   * Assign specific positions to players
   */
  async assignPositions(
    eventId: string,
    teamNumber: number,
    positionAssignments: Record<string, string[]>
  ): Promise<Lineup> {
    // Find existing lineup or create new one
    const existingLineup = await prisma.lineup.findFirst({
      where: { eventId, teamNumber },
    });

    if (existingLineup) {
      return prisma.lineup.update({
        where: { id: existingLineup.id },
        data: { positionAssignments },
      });
    }

    return prisma.lineup.create({
      data: {
        eventId,
        teamNumber,
        positionAssignments,
      },
    });
  }

  /**
   * Swap players between teams
   */
  async swapPlayers(
    eventId: string,
    fromTeam: number,
    toTeam: number,
    playerId: string
  ): Promise<TeamAssignment> {
    // Get both team assignments
    const fromAssignment = await prisma.teamAssignment.findFirst({
      where: { eventId, teamNumber: fromTeam },
    });

    const toAssignment = await prisma.teamAssignment.findFirst({
      where: { eventId, teamNumber: toTeam },
    });

    if (!fromAssignment || !toAssignment) {
      throw new Error('Team assignments not found');
    }

    // Check if player is in the from team
    const playerIndex = fromAssignment.playerIds.indexOf(playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found in source team');
    }

    // Check if there's space in the destination team
    const tacticPositions = await this.getTacticForEvent(eventId);
    const maxPlayers = tacticPositions.length;

    if (toAssignment.playerIds.length >= maxPlayers && !toAssignment.substitutes.includes(playerId)) {
      throw new Error('Destination team is full');
    }

    // Perform the swap
    const newFromPlayerIds = fromAssignment.playerIds.filter((id: string) => id !== playerId);
    
    let newToPlayerIds = [...toAssignment.playerIds, playerId];
    let newToSubstitutes = toAssignment.substitutes;

    // If player was a substitute in destination team
    if (toAssignment.substitutes.includes(playerId)) {
      newToSubstitutes = toAssignment.substitutes.filter((id: string) => id !== playerId);
    }

    // Update both teams
    await prisma.teamAssignment.update({
      where: { id: fromAssignment.id },
      data: { playerIds: newFromPlayerIds },
    });

    const updatedToAssignment = await prisma.teamAssignment.update({
      where: { id: toAssignment.id },
      data: { 
        playerIds: newToPlayerIds.slice(0, maxPlayers),
        substitutes: [...newToSubstitutes, ...newToPlayerIds.slice(maxPlayers)],
      },
    });

    return updatedToAssignment;
  }

  /**
   * Get tactic for an event
   */
  private async getTacticForEvent(eventId: string): Promise<CorePosition[]> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { group: true },
    });

    if (!event) {
      return ['GK', 'CB', 'CB', 'CM', 'CM', 'ST'];
    }

    const gameType = (event.gameType || '7') as GameType;
    const groupTactics = event.group?.tactics as Record<string, unknown> | undefined;
    const defaultTactic = groupTactics?.default as string | undefined || '4-4-2';

    return this.getTacticPositions(defaultTactic, gameType);
  }

  /**
   * Get lineup for a specific team
   */
  async getTeamLineup(eventId: string, teamNumber: number): Promise<Lineup | null> {
    return prisma.lineup.findFirst({
      where: { eventId, teamNumber },
    });
  }

  /**
   * Delete lineup for an event
   */
  async deleteByEventId(eventId: string): Promise<void> {
    await prisma.lineup.deleteMany({
      where: { eventId },
    });
    await prisma.teamAssignment.deleteMany({
      where: { eventId },
    });
  }

  /**
   * Get position mappings for a game type
   */
  getPositionMapping(gameType: GameType): Record<string, number> {
    return POSITION_MAPPINGS[gameType] || POSITION_MAPPINGS['7'];
  }

  /**
   * Get all available tactics
   */
  getAvailableTactics(): TacticDefinition[] {
    return [
      { name: '4-4-2', positions: TACTICS['4-4-2'], description: 'Classic 4-4-2 formation' },
      { name: '4-3-3', positions: TACTICS['4-3-3'], description: 'Attacking 4-3-3' },
      { name: '3-5-2', positions: TACTICS['3-5-2'], description: '3-5-2 with wingbacks' },
      { name: '5-3-2', positions: TACTICS['5-3-2'], description: '5-3-2 defensive' },
      { name: '4-2-3-1', positions: TACTICS['4-2-3-1'], description: '4-2-3-1 with double pivot' },
      { name: '3-4-3', positions: TACTICS['3-4-3'], description: '3-4-3 attacking' },
      { name: '3-2-1', positions: TACTICS['3-2-1'], description: '7v7: 3-2-1 formation' },
      { name: '2-3-1', positions: TACTICS['2-3-1'], description: '7v7: 2-3-1 formation' },
      { name: '2-2', positions: TACTICS['2-2'], description: '5v5: 2-2 formation' },
      { name: '1-2-1', positions: TACTICS['1-2-1'], description: '5v5: 1-2-1 formation' },
    ];
  }

  /**
   * Calculate balanced teams based on player ratings
   */
  protected calculateBalancedTeams(
    players: { id: string; rating: number; position1: Position }[],
    teamsCount: number
  ): string[][] {
    // Sort players by rating (descending)
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

    // Initialize teams
    const teams: string[][] = Array.from({ length: teamsCount }, () => []);

    // Distribute players to balance teams
    sortedPlayers.forEach((player, index) => {
      const teamIndex = index % teamsCount;
      teams[teamIndex].push(player.id);
    });

    return teams;
  }
}

export const lineupService = new LineupService();
