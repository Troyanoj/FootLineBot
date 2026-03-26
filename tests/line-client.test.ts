/**
 * Tests for LINE client error handling
 * 
 * Tests the getUserProfile function with various error scenarios
 */

import { getUserProfile } from '@/lib/line/client';

// Mock the LINE client
jest.mock('@line/bot-sdk', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      getProfile: jest.fn(),
    })),
  };
});

describe('LINE Client - getUserProfile', () => {
  const mockUserId = 'U123456789';
  const { Client } = require('@line/bot-sdk');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return profile successfully when LINE API responds', async () => {
    const mockProfile = {
      displayName: 'Test User',
      userId: mockUserId,
      pictureUrl: 'https://example.com/pic.jpg',
      statusMessage: 'Hello',
    };

    const mockClient = new Client();
    mockClient.getProfile.mockResolvedValue(mockProfile);

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual(mockProfile);
    expect(mockClient.getProfile).toHaveBeenCalledWith(mockUserId);
  });

  it('should return default profile on 404 error', async () => {
    const mockClient = new Client();
    mockClient.getProfile.mockRejectedValue({
      status: 404,
      message: 'User not found',
    });

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual({
      displayName: 'Unknown User',
      userId: mockUserId,
      pictureUrl: undefined,
      statusMessage: undefined,
    });
  });

  it('should return default profile on 401 error (invalid token)', async () => {
    const mockClient = new Client();
    mockClient.getProfile.mockRejectedValue({
      status: 401,
      message: 'Invalid access token',
    });

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual({
      displayName: 'Unknown User',
      userId: mockUserId,
      pictureUrl: undefined,
      statusMessage: undefined,
    });
  });

  it('should return default profile on 403 error (permission denied)', async () => {
    const mockClient = new Client();
    mockClient.getProfile.mockRejectedValue({
      status: 403,
      message: 'Permission denied',
    });

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual({
      displayName: 'Unknown User',
      userId: mockUserId,
      pictureUrl: undefined,
      statusMessage: undefined,
    });
  });

  it('should return default profile on network error', async () => {
    const mockClient = new Client();
    mockClient.getProfile.mockRejectedValue({
      code: 'ETIMEDOUT',
      message: 'Connection timeout',
    });

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual({
      displayName: 'Unknown User',
      userId: mockUserId,
      pictureUrl: undefined,
      statusMessage: undefined,
    });
  });

  it('should return default profile on rate limit (429)', async () => {
    const mockClient = new Client();
    mockClient.getProfile.mockRejectedValue({
      status: 429,
      message: 'Rate limit exceeded',
    });

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual({
      displayName: 'Unknown User',
      userId: mockUserId,
      pictureUrl: undefined,
      statusMessage: undefined,
    });
  });

  it('should return default profile on unknown error', async () => {
    const mockClient = new Client();
    mockClient.getProfile.mockRejectedValue(new Error('Unknown error'));

    const result = await getUserProfile(mockUserId);

    expect(result).toEqual({
      displayName: 'Unknown User',
      userId: mockUserId,
      pictureUrl: undefined,
      statusMessage: undefined,
    });
  });
});
