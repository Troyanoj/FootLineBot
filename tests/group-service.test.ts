/**
 * Tests for Group Service
 * 
 * Tests group creation, member management, and admin checks
 */

import { groupService } from '@/services/group.service';
import { userService } from '@/services/user.service';
import prisma from '@/lib/db/prisma';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    group: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    groupMember: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Group Service', () => {
  const mockUserId = 'user-123';
  const mockGroupId = 'group-456';
  const mockLineGroupId = 'C1234567890';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a group with lineGroupId successfully', async () => {
      const mockUser = { id: mockUserId, lineUserId: 'U123' };
      const mockGroup = {
        id: mockGroupId,
        lineGroupId: mockLineGroupId,
        name: 'Test Group',
        country: 'Thailand',
        adminUserId: mockUserId,
        defaultGameType: '7',
        tactics: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.group.create as jest.Mock).mockResolvedValue(mockGroup);
      (prisma.groupMember.create as jest.Mock).mockResolvedValue({});

      const result = await groupService.createGroup(
        'Test Group',
        mockUserId,
        'Thailand',
        '7',
        mockGroupId,
        mockLineGroupId
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(prisma.group.create).toHaveBeenCalledWith({
        data: {
          id: mockGroupId,
          lineGroupId: mockLineGroupId,
          name: 'Test Group',
          country: 'Thailand',
          defaultGameType: '7',
          adminUserId: mockUserId,
        },
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockGroupId,
        lineGroupId: mockLineGroupId,
        name: 'Test Group',
      }));
    });

    it('should throw error if admin user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        groupService.createGroup('Test Group', mockUserId)
      ).rejects.toThrow('Admin user not found');
    });

    it('should throw error on duplicate group name', async () => {
      const mockUser = { id: mockUserId };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.group.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        groupService.createGroup('Test Group', mockUserId)
      ).rejects.toThrow('Group name already exists');
    });
  });

  describe('getGroupById', () => {
    it('should return group by ID', async () => {
      const mockGroup = {
        id: mockGroupId,
        lineGroupId: mockLineGroupId,
        name: 'Test Group',
        country: null,
        adminUserId: mockUserId,
        defaultGameType: '7',
        tactics: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);

      const result = await groupService.getGroupById(mockGroupId);

      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: mockGroupId },
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockGroupId,
        lineGroupId: mockLineGroupId,
        name: 'Test Group',
      }));
    });

    it('should return null if group not found', async () => {
      (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await groupService.getGroupById(mockGroupId);

      expect(result).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true if user is admin', async () => {
      (prisma.groupMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'membership-1',
        role: 'admin',
      });

      const result = await groupService.isAdmin(mockGroupId, mockUserId);

      expect(result).toBe(true);
    });

    it('should return false if user is not admin', async () => {
      (prisma.groupMember.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await groupService.isAdmin(mockGroupId, mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('updateGroup', () => {
    it('should update group including lineGroupId', async () => {
      const mockGroup = {
        id: mockGroupId,
        lineGroupId: mockLineGroupId,
        name: 'Updated Group',
        country: 'Spain',
        adminUserId: mockUserId,
        defaultGameType: '7',
        tactics: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.group.update as jest.Mock).mockResolvedValue(mockGroup);

      const result = await groupService.updateGroup(mockGroupId, {
        name: 'Updated Group',
        country: 'Spain',
        lineGroupId: mockLineGroupId,
      });

      expect(prisma.group.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          name: 'Updated Group',
          country: 'Spain',
          lineGroupId: mockLineGroupId,
        },
      });

      expect(result).toEqual(expect.objectContaining({
        lineGroupId: mockLineGroupId,
      }));
    });
  });
});
