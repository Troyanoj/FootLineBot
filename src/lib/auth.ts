/**
 * Authentication utilities for REST API endpoints
 * 
 * This module provides authentication for API routes using a simple
 * API key mechanism. For production use, consider implementing JWT tokens
 * or OAuth2 flow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';

/**
 * API Key authentication middleware
 * 
 * Validates the X-API-Key header against environment variable
 * and optionally validates user context from X-User-ID header
 */
export async function authenticateRequest(
  request: NextRequest,
  options: {
    requireUser?: boolean;
    requireAdmin?: boolean;
  } = {}
): Promise<{
  authenticated: boolean;
  error?: NextResponse;
  userId?: string;
  userLineUserId?: string;
}> {
  const { requireUser = false, requireAdmin = false } = options;

  // 1. Validate API Key (for server-to-server communication)
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_KEY;
  
  if (validApiKey && apiKey !== validApiKey) {
    // If API key is configured but doesn't match, reject
    // If no API key is configured, skip this check (development mode)
    if (apiKey) {
      return {
        authenticated: false,
        error: NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 401 }
        ),
      };
    }
  }

  // 2. Validate user context (for user-specific operations)
  if (requireUser) {
    const userId = request.headers.get('x-user-id');
    const userLineUserId = request.headers.get('x-user-line-id');

    if (!userId && !userLineUserId) {
      return {
        authenticated: false,
        error: NextResponse.json(
          { success: false, error: 'Authentication required. Provide x-user-id or x-user-line-id header' },
          { status: 401 }
        ),
      };
    }

    // If we have LINE user ID, fetch the user from DB
    if (userLineUserId) {
      const user = await userService.findByLineUserId(userLineUserId);
      
      if (!user) {
        return {
          authenticated: false,
          error: NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          ),
        };
      }

      // Check admin requirement
      if (requireAdmin) {
        const { groupService } = await import('@/services/group.service');
        const userGroups = await groupService.getByUserId(user.id);
        const isAdmin = userGroups.some(g => g.adminUserId === user.id);
        
        if (!isAdmin) {
          return {
            authenticated: false,
            error: NextResponse.json(
              { success: false, error: 'Admin access required' },
              { status: 403 }
            ),
          };
        }
      }

      return {
        authenticated: true,
        userId: user.id,
        userLineUserId: user.lineUserId,
      };
    }

    // If we only have internal user ID, verify user exists
    if (userId) {
      const user = await userService.findById(userId);

      if (!user) {
        return {
          authenticated: false,
          error: NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          )
        };
      }

      return {
        authenticated: true,
        userId: user.id,
        userLineUserId: user.lineUserId,
      };
    }
  }

  // No authentication required or all checks passed
  return { authenticated: true };
}

/**
 * Helper to create authenticated API response handlers
 */
export function withAuth<T extends NextRequest>(
  handler: (request: T, context: { userId?: string; userLineUserId?: string }) => Promise<NextResponse>,
  options: {
    requireUser?: boolean;
    requireAdmin?: boolean;
  } = {}
) {
  return async (request: T): Promise<NextResponse> => {
    const auth = await authenticateRequest(request, options);
    
    if (!auth.authenticated && auth.error) {
      return auth.error;
    }
    
    return handler(request, {
      userId: auth.userId,
      userLineUserId: auth.userLineUserId,
    });
  };
}

/**
 * Generate a simple HMAC-based token for temporary authentication
 * This can be used for webhook validation or temporary access
 */
export function generateTempToken(payload: { userId: string; exp: number }): string {
  const crypto = require('crypto');
  const secret = process.env.API_SECRET || 'default-secret-change-in-production';
  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  
  return Buffer.from(`${data}.${signature}`).toString('base64');
}

/**
 * Validate a temporary token
 */
export function validateTempToken(token: string): { valid: boolean; payload?: { userId: string; exp: number } } {
  try {
    const crypto = require('crypto');
    const secret = process.env.API_SECRET || 'default-secret-change-in-production';
    
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('.');
    
    if (parts.length !== 2) {
      return { valid: false };
    }
    
    const data = parts[0];
    const signature = parts[1];
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    const payload = JSON.parse(data);
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return { valid: false };
    }
    
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
