import prisma from '@/lib/db/prisma';
import type { CreateGroupInput, UpdateGroupInput, Group, GroupMember, MemberRole, GameType, TacticName } from '@/types';
import { AppError } from './user.service';

export class GroupService {
  // ============================================
  // Main methods (with descriptive names)
  // ============================================

  /**
   * Create a new group
   */
  async createGroup(
    name: string,
    adminUserId: string,
    country?: string,
    defaultGameType?: GameType
  ): Promise<Group> {
    try {
      // First, ensure the admin user exists
      const adminUser = await prisma.user.findUnique({
        where: { id: adminUserId },
      });

      if (!adminUser) {
        throw new AppError('Admin user not found', 404, 'USER_NOT_FOUND');
      }

      const group = await prisma.group.create({
        data: {
          name,
          country,
          defaultGameType,
          adminUserId,
        },
      });

      // Add admin as a member with admin role
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: adminUserId,
          role: 'admin',
        },
      });

      return this.mapToGroup(group);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new AppError('Group name already exists', 409, 'DUPLICATE_GROUP');
      }
      throw new AppError('Failed to create group', 500);
    }
  }

  /**
   * Get group by ID
   */
  async getGroupById(id: string): Promise<Group | null> {
    const group = await prisma.group.findUnique({
      where: { id },
    });
    return group ? this.mapToGroup(group) : null;
  }

  /**
   * Get all groups
   */
  async getGroups(): Promise<Group[]> {
    const groups = await prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    return groups.map(this.mapToGroup);
  }

  /**
   * Get groups by user ID
   */
  async getGroupsByUser(userId: string): Promise<Group[]> {
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: true,
      },
    });
    return memberships.map((m: { group: { id: string; name: string; country: string | null; adminUserId: string | null; defaultGameType: string | null; tactics: unknown; createdAt: Date; updatedAt: Date; } }) => this.mapToGroup(m.group));
  }

  /**
   * Update group
   */
  async updateGroup(id: string, data: UpdateGroupInput): Promise<Group> {
    try {
      const group = await prisma.group.update({
        where: { id },
        data: {
          name: data.name,
          country: data.country,
          defaultGameType: data.defaultGameType,
          tactics: data.tactics,
        },
      });
      return this.mapToGroup(group);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }
      throw new AppError('Failed to update group', 500);
    }
  }

  /**
   * Add member to group
   */
  async addMemberToGroup(
    groupId: string,
    userId: string,
    role: MemberRole = 'member'
  ): Promise<GroupMember> {
    try {
      // Verify group exists
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const membership = await prisma.groupMember.create({
        data: {
          groupId,
          userId,
          role,
        },
      });

      return this.mapToGroupMember(membership);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new AppError('User is already a member of this group', 409, 'ALREADY_MEMBER');
      }
      throw new AppError('Failed to add member', 500);
    }
  }

  /**
   * Remove member from group
   */
  async removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
    try {
      await prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Membership not found', 404, 'MEMBERSHIP_NOT_FOUND');
      }
      throw new AppError('Failed to remove member', 500);
    }
  }

  /**
   * Get all members of a group
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            lineUserId: true,
            displayName: true,
            position1: true,
            position2: true,
            position3: true,
            rating: true,
            totalMatches: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m: { id: string; groupId: string; userId: string; role: string; joinedAt: Date; user: { id: string; lineUserId: string; displayName: string; position1: string; position2: string | null; position3: string | null; rating: unknown; totalMatches: number; } }) => ({
      id: m.id,
      groupId: m.groupId,
      userId: m.userId,
      role: m.role as MemberRole,
      joinedAt: m.joinedAt,
      user: m.user,
    }));
  }

  /**
   * Get admin user of group
   */
  async getGroupAdmin(groupId: string): Promise<{
    id: string;
    lineUserId: string;
    displayName: string;
  } | null> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        admin: {
          select: {
            id: true,
            lineUserId: true,
            displayName: true,
          },
        },
      },
    });

    return group?.admin || null;
  }

  /**
   * Check if user is admin of group
   */
  async isUserAdmin(groupId: string, userId: string): Promise<boolean> {
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        role: 'admin',
      },
    });

    return !!membership;
  }

  /**
   * Check if user is member of group
   */
  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return !!membership;
  }

  /**
   * Update group tactics
   */
  async updateTactics(
    groupId: string,
    tactic: TacticName,
    action: 'add' | 'remove'
  ): Promise<Group> {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }

      const currentTactics = group.tactics as Record<string, unknown>;
      let updatedTactics: Record<string, unknown>;

      if (action === 'add') {
        updatedTactics = { ...currentTactics, [tactic]: true };
      } else {
        const { [tactic]: _, ...rest } = currentTactics;
        updatedTactics = rest;
      }

      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: {
          tactics: updatedTactics,
        },
      });

      return this.mapToGroup(updatedGroup);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }
      throw new AppError('Failed to update tactics', 500);
    }
  }

  /**
   * Get group configuration
   */
  async getGroupConfig(groupId: string): Promise<{
    id: string;
    name: string;
    country?: string;
    defaultGameType?: GameType;
    tactics: string[];
    memberCount: number;
    adminId?: string;
  } | null> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) return null;

    const tactics = Object.keys(group.tactics as Record<string, unknown>);

    return {
      id: group.id,
      name: group.name,
      country: group.country || undefined,
      defaultGameType: group.defaultGameType as GameType || undefined,
      tactics,
      memberCount: group._count.members,
      adminId: group.adminUserId || undefined,
    };
  }

  // ============================================
  // API Compatibility Methods (from original stubs)
  // ============================================

  /**
   * Find group by ID
   */
  async findById(id: string): Promise<Group | null> {
    return this.getGroupById(id);
  }

  /**
   * Get all groups
   */
  async getAll(): Promise<Group[]> {
    return this.getGroups();
  }

  /**
   * Get groups by user ID
   */
  async getByUserId(userId: string): Promise<Group[]> {
    return this.getGroupsByUser(userId);
  }

  /**
   * Create a new group
   */
  async create(input: CreateGroupInput, adminUserId: string): Promise<Group> {
    return this.createGroup(input.name, adminUserId, input.country, input.defaultGameType);
  }

  /**
   * Update group
   */
  async update(id: string, input: UpdateGroupInput): Promise<Group> {
    return this.updateGroup(id, input);
  }

  /**
   * Delete group
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.group.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
      }
      throw new AppError('Failed to delete group', 500);
    }
  }

  /**
   * Add member to group
   */
  async addMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<GroupMember> {
    return this.addMemberToGroup(groupId, userId, role);
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    return this.removeMemberFromGroup(groupId, userId);
  }

  /**
   * Get group members
   */
  async getMembers(groupId: string): Promise<GroupMember[]> {
    return this.getGroupMembers(groupId);
  }

  /**
   * Check if user is admin of group
   */
  async isAdmin(groupId: string, userId: string): Promise<boolean> {
    return this.isUserAdmin(groupId, userId);
  }

  /**
   * Check if user is member of group
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    return this.isGroupMember(groupId, userId);
  }

  /**
   * Update member role
   */
  async updateMemberRole(groupId: string, userId: string, role: MemberRole): Promise<GroupMember> {
    try {
      const membership = await prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        data: { role },
      });
      return this.mapToGroupMember(membership);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new AppError('Membership not found', 404, 'MEMBERSHIP_NOT_FOUND');
      }
      throw new AppError('Failed to update member role', 500);
    }
  }

  // ============================================
  // Private helper methods
  // ============================================

  /**
   * Map Prisma group to typed Group object
   */
  private mapToGroup(group: {
    id: string;
    name: string;
    country: string | null;
    adminUserId: string | null;
    defaultGameType: string | null;
    tactics: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): Group {
    return {
      id: group.id,
      name: group.name,
      country: group.country || undefined,
      adminUserId: group.adminUserId || undefined,
      defaultGameType: group.defaultGameType as GameType | undefined,
      tactics: group.tactics as Record<string, unknown>,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  /**
   * Map Prisma group member to typed GroupMember object
   */
  private mapToGroupMember(member: {
    id: string;
    groupId: string;
    userId: string;
    role: string;
    joinedAt: Date;
  }): GroupMember {
    return {
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role as MemberRole,
      joinedAt: member.joinedAt,
    };
  }
}

export const groupService = new GroupService();
