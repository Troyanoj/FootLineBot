import prisma from '@/lib/db/prisma';
import type { CreateRegistrationInput, Registration, RegistrationStatus } from '@/types';
import { AppError } from './user.service';

export class RegistrationService {
  // ============================================
  // Main methods
  // ============================================

  /**
   * Register user for event
   */
  async register(
    eventIdOrInput: string | CreateRegistrationInput,
    userId?: string,
    notes?: string
  ): Promise<Registration> {
    // Handle both object and individual parameter calls
    let eventId: string;
    let userIdParam: string;
    let notesParam: string | undefined;

    if (typeof eventIdOrInput === 'object') {
      eventId = eventIdOrInput.eventId;
      userIdParam = eventIdOrInput.userId;
      notesParam = eventIdOrInput.notes;
    } else {
      eventId = eventIdOrInput;
      userIdParam = userId!;
      notesParam = notes;
    }

    try {
      // Verify event exists and is open
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
      }

      if (event.status !== 'open') {
        throw new AppError('Registration is closed for this event', 400, 'REGISTRATION_CLOSED');
      }

      // Check if registration deadline has passed
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new AppError('Registration deadline has passed', 400, 'DEADLINE_PASSED');
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userIdParam },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Check if already registered (only if active)
      const existingRegistration = await prisma.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: userIdParam,
          },
        },
      });

      // Allow re-registration if previous registration was cancelled or waitlisted
      if (existingRegistration && existingRegistration.status === 'registered') {
        throw new AppError('User is already registered for this event', 409, 'ALREADY_REGISTERED');
      }

      // Check if event is full
      if (event.maxPlayers) {
        const registrationCount = await prisma.registration.count({
          where: { eventId, status: 'registered' },
        });

        if (registrationCount >= event.maxPlayers) {
          // Add to waitlist instead
          const registration = await prisma.registration.create({
            data: {
              eventId,
              userId: userIdParam,
              status: 'waitlisted',
              notes: notesParam,
            },
          });
          return this.mapToRegistration(registration);
        }
      }

      // Create registration
      const registration = await prisma.registration.create({
        data: {
          eventId,
          userId: userIdParam,
          status: 'registered',
          notes: notesParam,
        },
      });

      return this.mapToRegistration(registration);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new AppError('User is already registered for this event', 409, 'ALREADY_REGISTERED');
      }
      throw new AppError('Failed to register', 500);
    }
  }

  /**
   * Unregister user from event
   */
  async unregister(eventId: string, userId: string): Promise<void> {
    try {
      const registration = await prisma.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

      if (!registration) {
        throw new AppError('Registration not found', 404, 'REGISTRATION_NOT_FOUND');
      }

      await prisma.registration.delete({
        where: { id: registration.id },
      });

      // Process waitlist
      await this.processWaitlist(eventId);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Registration not found', 404, 'REGISTRATION_NOT_FOUND');
      }
      throw new AppError('Failed to unregister', 500);
    }
  }

  /**
   * Get all registrations for an event
   */
  async getRegistrations(eventId: string): Promise<Registration[]> {
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      orderBy: { registeredAt: 'asc' },
    });
    return registrations.map(this.mapToRegistration);
  }

  /**
   * Get user's registration for an event
   */
  async getUserRegistration(eventId: string, userId: string): Promise<Registration | null> {
    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
    return registration ? this.mapToRegistration(registration) : null;
  }

  /**
   * Get player details for event
   */
  async getRegisteredPlayers(eventId: string): Promise<{
    id: string;
    userId: string;
    displayName: string;
    position1: string;
    position2: string | null;
    position3: string | null;
    rating: number;
    status: RegistrationStatus;
    registeredAt: Date;
  }[]> {
    const registrations = await prisma.registration.findMany({
      where: { eventId },
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

    return registrations.map((r: { id: string; userId: string; status: string; registeredAt: Date; user: { displayName: string; position1: string; position2: string | null; position3: string | null; rating: unknown; } }) => ({
      id: r.id,
      userId: r.userId,
      displayName: r.user.displayName,
      position1: r.user.position1,
      position2: r.user.position2,
      position3: r.user.position3,
      rating: Number(r.user.rating),
      status: r.status as RegistrationStatus,
      registeredAt: r.registeredAt,
    }));
  }

  /**
   * Check if user is registered for event
   */
  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return !!registration && registration.status === 'registered';
  }

  /**
   * Get registration count for event
   */
  async getRegistrationCount(eventId: string): Promise<number> {
    return prisma.registration.count({
      where: { eventId, status: 'registered' },
    });
  }

  /**
   * Check if registration is allowed
   */
  async canRegister(eventId: string): Promise<{
    allowed: boolean;
    reason?: string;
    waitlistPosition?: number;
  }> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { allowed: false, reason: 'Event not found' };
    }

    if (event.status !== 'open') {
      return { allowed: false, reason: 'Registration is closed' };
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return { allowed: false, reason: 'Registration deadline has passed' };
    }

    if (!event.maxPlayers) {
      return { allowed: true };
    }

    const count = await this.getRegistrationCount(eventId);
    
    if (count < event.maxPlayers) {
      return { allowed: true };
    }

    // User would be waitlisted
    const waitlistCount = await prisma.registration.count({
      where: { eventId, status: 'waitlisted' },
    });

    return { 
      allowed: false, 
      reason: 'Event is full',
      waitlistPosition: waitlistCount + 1
    };
  }

  /**
   * Get waiting list if event is full
   */
  async getWaitingList(eventId: string): Promise<{
    id: string;
    userId: string;
    displayName: string;
    position: number;
    registeredAt: Date;
  }[]> {
    const registrations = await prisma.registration.findMany({
      where: { eventId, status: 'waitlisted' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    return registrations.map((r: { id: string; userId: string; registeredAt: Date; user: { displayName: string; } }, index: number) => ({
      id: r.id,
      userId: r.userId,
      displayName: r.user.displayName,
      position: index + 1,
      registeredAt: r.registeredAt,
    }));
  }

  /**
   * Process waitlist when registration is cancelled
   */
  async processWaitlist(eventId: string): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.maxPlayers) return;

    const registeredCount = await prisma.registration.count({
      where: { eventId, status: 'registered' },
    });

    if (registeredCount >= event.maxPlayers) return;

    // Find next person on waitlist
    const nextWaitlisted = await prisma.registration.findFirst({
      where: { eventId, status: 'waitlisted' },
      orderBy: { registeredAt: 'asc' },
    });

    if (nextWaitlisted) {
      await prisma.registration.update({
        where: { id: nextWaitlisted.id },
        data: { status: 'registered' },
      });
    }
  }

  // ============================================
  // API Compatibility Methods (from original stubs)
  // ============================================

  /**
   * Find registration by ID
   */
  async findById(id: string): Promise<Registration | null> {
    const registration = await prisma.registration.findUnique({
      where: { id },
    });
    return registration ? this.mapToRegistration(registration) : null;
  }

  /**
   * Get registrations by event ID
   */
  async getByEventId(eventId: string): Promise<Registration[]> {
    return this.getRegistrations(eventId);
  }

  /**
   * Get confirmed registrations by event ID
   */
  async getConfirmedByEventId(eventId: string): Promise<Registration[]> {
    const registrations = await prisma.registration.findMany({
      where: { eventId, status: 'registered' },
      orderBy: { registeredAt: 'asc' },
    });
    return registrations.map(this.mapToRegistration);
  }

  /**
   * Get registrations by user ID
   */
  async getByUserId(userId: string): Promise<Registration[]> {
    const registrations = await prisma.registration.findMany({
      where: { userId },
      orderBy: { registeredAt: 'desc' },
    });
    return registrations.map(this.mapToRegistration);
  }

  /**
   * Register for an event (API compatibility)
   */
  async registerForEvent(input: CreateRegistrationInput): Promise<Registration> {
    return this.register(input);
  }

  /**
   * Cancel registration
   */
  async cancel(registrationId: string): Promise<Registration> {
    try {
      const registration = await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'cancelled' },
      });
      
      // Process waitlist
      await this.processWaitlist(registration.eventId);
      
      return this.mapToRegistration(registration);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Registration not found', 404, 'REGISTRATION_NOT_FOUND');
      }
      throw new AppError('Failed to cancel registration', 500);
    }
  }

  /**
   * Confirm registration (by admin)
   */
  async confirm(registrationId: string): Promise<Registration> {
    try {
      const registration = await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'confirmed' },
      });
      return this.mapToRegistration(registration);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Registration not found', 404, 'REGISTRATION_NOT_FOUND');
      }
      throw new AppError('Failed to confirm registration', 500);
    }
  }

  /**
   * Update registration status
   */
  async updateStatus(registrationId: string, status: RegistrationStatus): Promise<Registration> {
    try {
      const registration = await prisma.registration.update({
        where: { id: registrationId },
        data: { status },
      });
      return this.mapToRegistration(registration);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Registration not found', 404, 'REGISTRATION_NOT_FOUND');
      }
      throw new AppError('Failed to update registration status', 500);
    }
  }

  /**
   * Get registration by event and user
   */
  async getByEventAndUser(eventId: string, userId: string): Promise<Registration | null> {
    return this.getUserRegistration(eventId, userId);
  }

  /**
   * Check if user is registered for event
   */
  async isRegistered(eventId: string, userId: string): Promise<boolean> {
    return this.isUserRegistered(eventId, userId);
  }

  /**
   * Get registration count for event
   */
  async getCountByEventId(eventId: string): Promise<number> {
    return this.getRegistrationCount(eventId);
  }

  // ============================================
  // Private helper methods
  // ============================================

  /**
   * Map Prisma registration to typed Registration object
   */
  private mapToRegistration(registration: {
    id: string;
    eventId: string;
    userId: string;
    status: string;
    registeredAt: Date;
    notes: string | null;
  }): Registration {
    return {
      id: registration.id,
      eventId: registration.eventId,
      userId: registration.userId,
      status: registration.status as RegistrationStatus,
      registeredAt: registration.registeredAt,
      notes: registration.notes || undefined,
    };
  }
}

export const registrationService = new RegistrationService();
