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

export interface CreateRecurringEventInput {
  groupId: string;
  dayOfWeek: number;
  startTime: string;
  totalDurationMinutes?: number;
  minutesPerMatch?: number;
  teamsCount?: number;
  gameType?: string;
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
   * Create a new recurring event
   */
  async create(input: CreateRecurringEventInput): Promise<any> {
    return prisma.recurringEvent.create({
      data: {
        groupId: input.groupId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        totalDurationMinutes: input.totalDurationMinutes || 90,
        minutesPerMatch: input.minutesPerMatch || 20,
        teamsCount: input.teamsCount || 2,
        gameType: input.gameType || '7',
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
        title: recurring.title || `แมตซ์ฟุตบอล${this.getDayNameThai(recurring.dayOfWeek)}`,
        eventDate,
        startTime: recurring.startTime as any,
        totalDurationMinutes: recurring.totalDurationMinutes,
        minutesPerMatch: recurring.minutesPerMatch,
        teamsCount: recurring.teamsCount,
        gameType: recurring.gameType,
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
}

export const recurringEventService = new RecurringEventService();
