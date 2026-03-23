import prisma from '@/lib/db/prisma';
import type { Event } from '@/types';

// Day of week mapping (Thai and English)
const DAY_NAMES: Record<string, number> = {
  'อาทิตย์': 0, 'วันอาทิตย์': 0, 'sunday': 0, 'sun': 0,
  'จันทร์': 1, 'วันจันทร์': 1, 'monday': 1, 'mon': 1,
  'อังคาร': 2, 'วันอังคาร': 2, 'tuesday': 2, 'tue': 2,
  'พุธ': 3, 'วันพุธ': 3, 'wednesday': 3, 'wed': 3,
  'พฤหัส': 4, 'วันพฤหัสบดี': 4, 'thursday': 4, 'thu': 4,
  'ศุกร์': 5, 'วันศุกร์': 5, 'friday': 5, 'fri': 5,
  'เสาร์': 6, 'วันเสาร์': 6, 'saturday': 6, 'sat': 6,
};

const DAY_NAMES_THAI = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
const DAY_NAMES_ENGLISH = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SPANISH = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export interface CreateRecurringEventInput {
  groupId: string;
  dayOfWeek: number;
  startTime: string;
  totalDurationMinutes?: number;
  minutesPerMatch?: number;
  teamsCount?: number;
  gameType?: string;
  maxPlayers?: number;
  title?: string;
}

export class RecurringEventService {
  /**
   * Parse day of week from various formats
   */
  parseDayOfWeek(dayInput: string): number | null {
    const normalized = dayInput.toLowerCase().trim();
    
    // Check for exact match in mapping
    if (DAY_NAMES[normalized] !== undefined) {
      return DAY_NAMES[normalized];
    }
    
    // Try parsing as number (0-6)
    const dayNum = parseInt(dayInput, 10);
    if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
      return dayNum;
    }
    
    return null;
  }

  /**
   * Get day name in Thai
   */
  getDayNameThai(dayOfWeek: number): string {
    return DAY_NAMES_THAI[dayOfWeek] || 'ไม่ทราบ';
  }

  /**
   * Get day name in the specified language
   */
  getDayName(dayOfWeek: number, lang: string = 'th'): string {
    if (lang === 'en') {
      return DAY_NAMES_ENGLISH[dayOfWeek] || 'Unknown';
    } else if (lang === 'es') {
      return DAY_NAMES_SPANISH[dayOfWeek] || 'Desconocido';
    }
    return DAY_NAMES_THAI[dayOfWeek] || 'ไม่ทราบ';
  }

  /**
   * Create a new recurring event
   */
  async create(input: CreateRecurringEventInput): Promise<any> {
    return prisma.recurringEvent.create({
      data: {
        groupId: input.groupId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        totalDurationMinutes: input.totalDurationMinutes || 120,
        minutesPerMatch: input.minutesPerMatch || 8,
        teamsCount: input.teamsCount || 3,
        gameType: input.gameType || '7',
        maxPlayers: input.maxPlayers || 9,
        title: input.title || null,
        isActive: true,
      },
    });
  }

  /**
   * Get all recurring events for a group
   */
  async getByGroupId(groupId: string): Promise<any[]> {
    return prisma.recurringEvent.findMany({
      where: { groupId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Get active recurring events for a group
   */
  async getActiveByGroupId(groupId: string): Promise<any[]> {
    return prisma.recurringEvent.findMany({
      where: { groupId, isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Get recurring event by ID
   */
  async getById(id: string): Promise<any | null> {
    return prisma.recurringEvent.findUnique({
      where: { id },
    });
  }

  /**
   * Pause a recurring event
   */
  async pause(id: string): Promise<any> {
    return prisma.recurringEvent.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Resume a recurring event
   */
  async resume(id: string): Promise<any> {
    return prisma.recurringEvent.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Delete a recurring event
   */
  async delete(id: string): Promise<void> {
    await prisma.recurringEvent.delete({
      where: { id },
    });
  }

  /**
   * Get today's recurring events that need to generate events
   * This would be called by a cron job
   */
  async getRecurringEventsForToday(): Promise<any[]> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return prisma.recurringEvent.findMany({
      where: {
        dayOfWeek,
        isActive: true,
      },
      include: {
        group: true,
      },
    });
  }

  /**
   * Generate event from recurring event for a specific date
   */
  async generateEventFromRecurring(recurringId: string, eventDate: Date): Promise<Event> {
    const recurring = await this.getById(recurringId);
    if (!recurring) {
      throw new Error('Recurring event not found');
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        groupId: recurring.groupId,
        title: recurring.title || `Partido de Fútbol ${this.getDayNameSpanish(recurring.dayOfWeek)}`,
        eventDate,
        startTime: recurring.startTime as any,
        totalDurationMinutes: recurring.totalDurationMinutes,
        minutesPerMatch: recurring.minutesPerMatch,
        teamsCount: recurring.teamsCount,
        gameType: recurring.gameType,
        maxPlayers: recurring.maxPlayers,
        status: 'open',
      },
    });

    // Update last generated date
    await prisma.recurringEvent.update({
      where: { id: recurringId },
      data: { lastGeneratedDate: new Date() },
    });

    return event as unknown as Event;
  }

  /**
   * Get day name in Spanish
   */
  getDayNameSpanish(dayOfWeek: number): string {
    return DAY_NAMES_SPANISH[dayOfWeek] || 'Desconocido';
  }

  /**
   * Calculate the next occurrence date for a recurring event
   * Returns the date of the next event (not the generation date)
   */
  getNextEventDate(dayOfWeek: number): Date {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    
    // Calculate days until the target day
    let daysUntil = dayOfWeek - currentDayOfWeek;
    
    // If today is the target day or has passed, go to next week
    if (daysUntil <= 0) {
      daysUntil += 7;
    }
    
    const nextEvent = new Date(today);
    nextEvent.setDate(today.getDate() + daysUntil);
    nextEvent.setHours(0, 0, 0, 0);
    
    return nextEvent;
  }

  /**
   * Check if an event needs to be generated (3 days before)
   * Returns the event date if generation is needed, null otherwise
   */
  shouldGenerateEvent(recurring: any): Date | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextEventDate = this.getNextEventDate(recurring.dayOfWeek);
    
    // Calculate the generation date (3 days before the event)
    const generationDate = new Date(nextEventDate);
    generationDate.setDate(generationDate.getDate() - 3);
    
    // Check if we should generate today
    if (today.getTime() === generationDate.getTime()) {
      return nextEventDate;
    }
    
    // If we've passed the generation date but haven't generated, generate now
    if (today > generationDate) {
      // Check if already generated this cycle
      if (recurring.lastGeneratedDate) {
        const lastGen = new Date(recurring.lastGeneratedDate);
        lastGen.setHours(0, 0, 0, 0);
        
        // If already generated for this week, skip
        if (lastGen.getTime() >= generationDate.getTime()) {
          return null;
        }
      }
      return nextEventDate;
    }
    
    return null;
  }

  /**
   * Process all recurring events and generate events that need to be created
   * Returns array of generated events
   */
  async processRecurringEvents(): Promise<{ recurringId: string; eventDate: Date; eventId: string }[]> {
    const result: { recurringId: string; eventDate: Date; eventId: string }[] = [];
    
    // Get all active recurring events
    const recurringEvents = await prisma.recurringEvent.findMany({
      where: { isActive: true },
      include: { group: true },
    });
    
    for (const recurring of recurringEvents) {
      const eventDate = this.shouldGenerateEvent(recurring);
      
      if (eventDate) {
        // Check if event already exists for this date
        const existingEvent = await prisma.event.findFirst({
          where: {
            groupId: recurring.groupId,
            eventDate: eventDate,
          },
        });
        
        if (!existingEvent) {
          try {
            const event = await this.generateEventFromRecurring(recurring.id, eventDate);
            result.push({
              recurringId: recurring.id,
              eventDate,
              eventId: event.id,
            });
          } catch (error) {
            console.error(`Error generating event for recurring ${recurring.id}:`, error);
          }
        }
      }
    }
    
    return result;
  }
}

export const recurringEventService = new RecurringEventService();
