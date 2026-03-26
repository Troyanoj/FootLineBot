import prisma from '@/lib/db/prisma';
import type { CreateEventInput, UpdateEventInput, Event, EventStatus, GameType } from '@/types';
import { AppError } from './user.service';

export class EventService {
  // ============================================
  // Main methods
  // ============================================

  /**
   * Create new event
   * Also runs auto-cleanup of expired events
   */
  async createEvent(data: CreateEventInput): Promise<Event> {
    try {
      // Auto-cleanup: close expired events before creating new one
      await this.closeExpiredEvents();
      
      // Verify group exists
      const group = await prisma.group.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      const event = await prisma.event.create({
        data: {
          groupId: data.groupId,
          title: data.title,
          eventDate: data.eventDate,
          startTime: data.startTime,
          totalDurationMinutes: data.totalDurationMinutes || 90,
          minutesPerMatch: data.minutesPerMatch || 20,
          teamsCount: data.teamsCount || 2,
          gameType: data.gameType,
          maxPlayers: data.maxPlayers,
          registrationDeadline: data.registrationDeadline,
          status: 'open',
        },
      });

      return this.mapToEvent(event);
    } catch (error: unknown) {
      console.error('========== ERROR in eventService.createEvent ==========');
      console.error('Input data:', JSON.stringify(data));
      console.error('Error:', error);
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }
      // Log the actual error message
      const actualError = error instanceof Error ? error.message : String(error);
      console.error('Actual error:', actualError);
      throw new AppError(`Failed to create event: ${actualError}`, 500);
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    return event ? this.mapToEvent(event) : null;
  }

  /**
   * Get events by group ID
   */
  async getEventsByGroup(groupId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { groupId },
      orderBy: { eventDate: 'asc' },
    });
    return events.map(this.mapToEvent);
  }

  /**
   * Get current open registration event for a group
   * Also runs auto-cleanup of expired events
   */
  async getOpenEvent(groupId: string): Promise<Event | null> {
    // Auto-cleanup: close expired events before retrieving
    await this.closeExpiredEvents();
    
    const event = await prisma.event.findFirst({
      where: {
        groupId,
        status: 'open',
        eventDate: {
          gte: new Date(),
        },
      },
      orderBy: { eventDate: 'asc' },
    });
    return event ? this.mapToEvent(event) : null;
  }

  /**
   * Update event
   */
  async updateEvent(id: string, data: UpdateEventInput): Promise<Event> {
    try {
      const event = await prisma.event.update({
        where: { id },
        data: {
          title: data.title,
          eventDate: data.eventDate,
          startTime: data.startTime,
          totalDurationMinutes: data.totalDurationMinutes,
          minutesPerMatch: data.minutesPerMatch,
          teamsCount: data.teamsCount,
          gameType: data.gameType,
          maxPlayers: data.maxPlayers,
          status: data.status,
          registrationDeadline: data.registrationDeadline,
        },
      });
      return this.mapToEvent(event);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
      }
      throw new AppError('Failed to update event', 500);
    }
  }

  /**
   * Close registration for event
   */
  async closeRegistration(eventId: string): Promise<Event> {
    try {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          status: 'closed',
        },
      });
      return this.mapToEvent(event);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
      }
      throw new AppError('Failed to close registration', 500);
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      await prisma.event.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
      }
      throw new AppError('Failed to delete event', 500);
    }
  }

  /**
   * Get event with registrations
   */
  async getEventWithDetails(id: string): Promise<{
    event: Event;
    registrations: {
      id: string;
      userId: string;
      displayName: string;
      position1: string;
      position2: string | null;
      position3: string | null;
      rating: number;
      status: string;
      registeredAt: Date;
    }[];
    registrationCount: number;
    maxPlayers: number | null;
  } | null> {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) return null;

    const registrations = await prisma.registration.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            position1: true,
            position2: true,
            position3: true,
            rating: true,
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    return {
      event: this.mapToEvent(event),
      registrations: registrations.map(r => ({
        id: r.id,
        userId: r.userId,
        displayName: r.user.displayName,
        position1: r.user.position1,
        position2: r.user.position2,
        position3: r.user.position3,
        rating: Number(r.user.rating),
        status: r.status,
        registeredAt: r.registeredAt,
      })),
      registrationCount: registrations.length,
      maxPlayers: event.maxPlayers,
    };
  }

  /**
   * Get upcoming events for a group
   */
  async getUpcomingEvents(groupId: string, limit: number = 10): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: {
        groupId,
        eventDate: {
          gte: new Date(),
        },
      },
      orderBy: { eventDate: 'asc' },
      take: limit,
    });
    return events.map(this.mapToEvent);
  }

  /**
   * Get formatted event schedule for a group
   */
  async getEventSchedule(groupId: string): Promise<{
    upcoming: {
      id: string;
      title: string | null;
      date: string;
      time: string;
      dayOfWeek: string;
      status: EventStatus;
      registered: number;
      maxPlayers: number | null;
    }[];
    past: {
      id: string;
      title: string | null;
      date: string;
      time: string;
      status: EventStatus;
    }[];
  }> {
    const events = await prisma.event.findMany({
      where: { groupId },
      orderBy: { eventDate: 'desc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    const now = new Date();
    const upcoming: {
      id: string;
      title: string | null;
      date: string;
      time: string;
      dayOfWeek: string;
      status: EventStatus;
      registered: number;
      maxPlayers: number | null;
    }[] = [];
    const past: {
      id: string;
      title: string | null;
      date: string;
      time: string;
      status: EventStatus;
    }[] = [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const event of events) {
      const eventDate = new Date(event.eventDate);
      const dateStr = eventDate.toISOString().split('T')[0];
      
      if (eventDate >= now) {
        upcoming.push({
          id: event.id,
          title: event.title,
          date: dateStr,
          time: event.startTime instanceof Date 
            ? event.startTime.toISOString().split('T')[1].split('.')[0]
            : event.startTime,
          dayOfWeek: dayNames[eventDate.getDay()],
          status: event.status as EventStatus,
          registered: event._count.registrations,
          maxPlayers: event.maxPlayers,
        });
      } else {
        past.push({
          id: event.id,
          title: event.title,
          date: dateStr,
          time: event.startTime instanceof Date 
            ? event.startTime.toISOString().split('T')[1].split('.')[0]
            : event.startTime,
          status: event.status as EventStatus,
        });
      }
    }

    return { upcoming, past };
  }

  // ============================================
  // API Compatibility Methods (from original stubs)
  // ============================================

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<Event | null> {
    return this.getEventById(id);
  }

  /**
   * Get all events
   */
  async getAll(): Promise<Event[]> {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
    });
    return events.map(this.mapToEvent);
  }

  /**
   * Get events by group ID
   */
  async getByGroupId(groupId: string): Promise<Event[]> {
    return this.getEventsByGroup(groupId);
  }

  /**
   * Get upcoming events by group ID
   */
  async getUpcomingByGroupId(groupId: string): Promise<Event[]> {
    return this.getUpcomingEvents(groupId);
  }

  /**
   * Create a new event
   */
  async create(input: CreateEventInput): Promise<Event> {
    return this.createEvent(input);
  }

  /**
   * Update event
   */
  async update(id: string, input: UpdateEventInput): Promise<Event> {
    return this.updateEvent(id, input);
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<void> {
    return this.deleteEvent(id);
  }

  /**
   * Get event with registrations
   */
  async getWithRegistrations(id: string): Promise<Event | null> {
    const result = await this.getEventWithDetails(id);
    return result?.event || null;
  }

  /**
   * Cancel event
   */
  async cancel(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'cancelled' });
  }

  /**
   * Mark event as completed
   */
  async complete(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'completed' });
  }

  /**
   * Mark event as in progress
   */
  async start(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'in_progress' });
  }

  /**
   * Auto-cleanup: Close events that have passed their date
   * This helps keep the database clean and prevents old events from accumulating
   * Returns the number of events that were closed
   */
  async closeExpiredEvents(): Promise<number> {
    try {
      // Get start of today (midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all open events where eventDate < today
      const expiredEvents = await prisma.event.findMany({
        where: {
          status: 'open',
          eventDate: {
            lt: today,
          },
        },
        select: { id: true },
      });

      if (expiredEvents.length === 0) {
        return 0;
      }

      // Close all expired events
      const result = await prisma.event.updateMany({
        where: {
          id: { in: expiredEvents.map(e => e.id) },
        },
        data: {
          status: 'completed',
        },
      });

      console.log(`[EventService] Auto-cleanup: Closed ${result.count} expired events`);
      return result.count;
    } catch (error) {
      console.error('[EventService] Error in closeExpiredEvents:', error);
      return 0;
    }
  }

  // ============================================
  // Private helper methods
  // ============================================

  /**
   * Map Prisma event to typed Event object
   */
  private mapToEvent(event: {
    id: string;
    groupId: string;
    title: string | null;
    eventDate: Date;
    startTime: Date | string;
    totalDurationMinutes: number;
    minutesPerMatch: number;
    teamsCount: number;
    gameType: string | null;
    maxPlayers: number | null;
    status: string;
    registrationDeadline: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Event {
    // Convert startTime from Date to string if needed
    const startTimeStr = event.startTime instanceof Date 
      ? event.startTime.toISOString().split('T')[1].split('.')[0] // Extract HH:mm:ss
      : event.startTime;

    return {
      id: event.id,
      groupId: event.groupId,
      title: event.title || undefined,
      eventDate: event.eventDate,
      startTime: startTimeStr,
      totalDurationMinutes: event.totalDurationMinutes,
      minutesPerMatch: event.minutesPerMatch,
      teamsCount: event.teamsCount,
      gameType: event.gameType as GameType | undefined,
      maxPlayers: event.maxPlayers || undefined,
      status: event.status as EventStatus,
      registrationDeadline: event.registrationDeadline || undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}

export const eventService = new EventService();
