import prisma from '@/lib/db/prisma';
import type { CreateUserInput, UpdateUserInput, User, Position } from '@/types';

// Custom error class for application errors
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UserService {
  /**
   * Create a new user from LINE data
   */
  async createUser(
    lineUserId: string,
    displayName: string,
    email?: string
  ): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          lineUserId,
          displayName,
          email,
          position1: 'MID', // Default position
        },
      });
      return this.mapToUser(user);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new AppError('User with this LINE ID already exists', 409, 'DUPLICATE_USER');
      }
      throw new AppError('Failed to create user', 500);
    }
  }

  /**
   * Get user by LINE ID
   */
  async getUserByLineId(lineUserId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { lineUserId },
    });
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Get user by internal ID
   */
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToUser(user) : null;
  }

/**
 * Update user profile
 */
async updateUser(id: string, data: UpdateUserInput): Promise<User> {
  try {
    // Only update fields that are provided (not undefined)
    const updateData: Prisma.UserUpdateInput = {};
    
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    
    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    
    if (data.position1 !== undefined) {
      updateData.position1 = data.position1;
    }
    
    if (data.position2 !== undefined) {
      updateData.position2 = data.position2;
    }
    
    if (data.position3 !== undefined) {
      updateData.position3 = data.position3;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return this.mapToUser(user);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    throw new AppError('Failed to update user', 500);
  }
}

  /**
   * Get formatted user profile for display
   */
  async getUserProfile(lineUserId: string): Promise<{
    id: string;
    displayName: string;
    positions: string[];
    rating: number;
    totalMatches: number;
  } | null> {
    const user = await prisma.user.findUnique({
      where: { lineUserId },
      select: {
        id: true,
        displayName: true,
        position1: true,
        position2: true,
        position3: true,
        rating: true,
        totalMatches: true,
      },
    });

    if (!user) return null;

    const positions = [user.position1];
    if (user.position2) positions.push(user.position2);
    if (user.position3) positions.push(user.position3);

    return {
      id: user.id,
      displayName: user.displayName,
      positions,
      rating: Number(user.rating),
      totalMatches: user.totalMatches,
    };
  }

/**
 * Update position preferences
 */
async updatePositions(
  id: string,
  positions: [Position, Position?, Position?]
): Promise<User> {
  try {
    // First get the current user to preserve other fields like displayName
    const currentUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Only update the position fields, preserving everything else
    const user = await prisma.user.update({
      where: { id },
      data: {
        position1: positions[0],
        position2: positions[1] || null,
        position3: positions[2] || null,
      },
    });
    return this.mapToUser(user);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    throw new AppError('Failed to update positions', 500);
  }
}

  /**
   * Get multiple users by IDs
   */
  async getUsersByIds(ids: string[]): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return users.map(this.mapToUser);
  }

  /**
   * Find user by LINE user ID (alias for getUserByLineId)
   */
  async findByLineUserId(lineUserId: string): Promise<User | null> {
    return this.getUserByLineId(lineUserId);
  }

  /**
   * Find user by ID (alias for getUserById)
   */
  async findById(id: string): Promise<User | null> {
    return this.getUserById(id);
  }

  /**
   * Create user with full input
   */
  async create(input: CreateUserInput): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          lineUserId: input.lineUserId,
          displayName: input.displayName,
          email: input.email,
          position1: input.position1,
          position2: input.position2,
          position3: input.position3,
        },
      });
      return this.mapToUser(user);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new AppError('User with this LINE ID already exists', 409, 'DUPLICATE_USER');
      }
      throw new AppError('Failed to create user', 500);
    }
  }

  /**
   * Update user with full input
   */
  async update(id: string, input: UpdateUserInput): Promise<User> {
    return this.updateUser(id, input);
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(this.mapToUser);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      throw new AppError('Failed to delete user', 500);
    }
  }

  /**
   * Update user rating after a match
   */
  async updateRating(id: string, ratingDelta: number): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const newRating = Math.max(1, Math.min(10, Number(user.rating) + ratingDelta));

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          rating: newRating,
          totalMatches: user.totalMatches + 1,
        },
      });

      return this.mapToUser(updatedUser);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      throw new AppError('Failed to update rating', 500);
    }
  }

  /**
   * Increment user's total played minutes
   */
  async addPlayedMinutes(id: string, minutes: number): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          totalPlayedMinutes: user.totalPlayedMinutes + minutes,
        },
      });

      return this.mapToUser(updatedUser);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      throw new AppError('Failed to update played minutes', 500);
    }
  }

  /**
   * Find or create user from LINE data
   */
  async findOrCreate(lineUserId: string, displayName: string, email?: string): Promise<User> {
    const existingUser = await this.getUserByLineId(lineUserId);
    if (existingUser) {
      return existingUser;
    }
    return this.createUser(lineUserId, displayName, email);
  }

  /**
   * Map Prisma user to typed User object
   */
  private mapToUser(user: {
    id: string;
    lineUserId: string;
    displayName: string;
    email: string | null;
    position1: string;
    position2: string | null;
    position3: string | null;
    rating: unknown;
    totalMatches: number;
    totalPlayedMinutes: number;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: user.id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      email: user.email || undefined,
      position1: user.position1 as Position,
      position2: user.position2 as Position | undefined,
      position3: user.position3 as Position | undefined,
      rating: Number(user.rating),
      totalMatches: user.totalMatches,
      totalPlayedMinutes: user.totalPlayedMinutes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
