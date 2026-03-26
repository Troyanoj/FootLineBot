/**
 * Tests for Command Handlers
 * 
 * Tests user and admin command handlers
 */

import {
  handleUserCommand,
  HandlerContext,
  HandlerResult,
} from '@/lib/line/handlers';

// Mock services
jest.mock('@/services/user.service', () => ({
  userService: {
    findByLineUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/services/group.service', () => ({
  groupService: {
    getByUserId: jest.fn(),
    findById: jest.fn(),
    isMember: jest.fn(),
    addMember: jest.fn(),
    getAll: jest.fn(),
    isAdmin: jest.fn(),
  },
}));

jest.mock('@/services/event.service', () => ({
  eventService: {
    getUpcomingByGroupId: jest.fn(),
  },
}));

jest.mock('@/services/registration.service', () => ({
  registrationService: {
    isRegistered: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('@/lib/line/client', () => ({
  getUserProfile: jest.fn(),
}));

describe('Command Handlers', () => {
  const mockUserId = 'U123456789';
  const mockGroupId = 'C1234567890';
  const mockReplyToken = 'reply-token-123';

  const createContext = (
    lang: 'es' | 'en' | 'th' = 'en',
    groupId?: string
  ): HandlerContext => ({
    userId: mockUserId,
    groupId,
    replyToken: mockReplyToken,
    lang,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUserCommand', () => {
    describe('!help command', () => {
      it('should return help message', async () => {
        const result = await handleUserCommand('help', [], createContext());

        expect(result.success).toBe(true);
        expect(result.message).toContain('help');
      });

      it('should handle !ayuda (Spanish)', async () => {
        const result = await handleUserCommand('ayuda', [], createContext('es'));

        expect(result.success).toBe(true);
      });
    });

    describe('!join command', () => {
      it('should fail if groupId is not provided', async () => {
        const result = await handleUserCommand('join', [], createContext());

        expect(result.success).toBe(false);
        expect(result.message).toContain('invalid');
      });

      it('should fail if group not found', async () => {
        const { groupService } = require('@/services/group.service');
        groupService.findById.mockResolvedValue(null);

        const result = await handleUserCommand('join', ['ABC123'], createContext());

        expect(result.success).toBe(false);
        expect(result.message).toContain('not found');
      });

      it('should succeed if group exists and user is not member', async () => {
        const { groupService } = require('@/services/group.service');
        const { userService } = require('@/services/user.service');
        const { getUserProfile } = require('@/lib/line/client');

        getUserProfile.mockResolvedValue({
          displayName: 'Test User',
          userId: mockUserId,
        });

        userService.findByLineUserId.mockResolvedValue({
          id: 'internal-user-id',
          lineUserId: mockUserId,
          displayName: 'Test User',
        });

        groupService.findById.mockResolvedValue({
          id: 'ABC123',
          name: 'Test Group',
        });

        groupService.isMember.mockResolvedValue(false);
        groupService.addMember.mockResolvedValue({});

        const result = await handleUserCommand('join', ['ABC123'], createContext());

        expect(result.success).toBe(true);
        expect(result.message).toContain('joined');
      });
    });

    describe('!profile command', () => {
      it('should return user profile', async () => {
        const { userService } = require('@/services/user.service');
        const { getUserProfile } = require('@/lib/line/client');

        getUserProfile.mockResolvedValue({
          displayName: 'Test User',
          userId: mockUserId,
        });

        userService.findByLineUserId.mockResolvedValue({
          id: 'internal-user-id',
          lineUserId: mockUserId,
          displayName: 'Test User',
          position1: 'CM',
          position2: 'CB',
          position3: null,
          rating: 5.0,
          totalMatches: 10,
        });

        const result = await handleUserCommand('profile', [], createContext());

        expect(result.success).toBe(true);
        expect(result.message).toContain('Test User');
      });
    });

    describe('!start command', () => {
      it('should return welcome message', async () => {
        const { getUserProfile } = require('@/lib/line/client');

        getUserProfile.mockResolvedValue({
          displayName: 'New User',
          userId: mockUserId,
        });

        const result = await handleUserCommand('start', [], createContext());

        expect(result.success).toBe(true);
        expect(result.message).toContain('Welcome');
      });
    });

    describe('Unknown command', () => {
      it('should return invalid command message', async () => {
        const result = await handleUserCommand('unknowncommand', [], createContext());

        expect(result.success).toBe(false);
        expect(result.message).toContain('invalid');
      });
    });
  });
});
