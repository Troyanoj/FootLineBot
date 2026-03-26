import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { withAuth } from '@/lib/auth';

// GET /api/users/me - Get current user profile
export const GET = withAuth(
  async (request: NextRequest, { userId }) => {
    try {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID not found' },
          { status: 404 }
        );
      }

      const user = await userService.findById(userId);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        data: {
          id: user.id,
          lineUserId: user.lineUserId,
          displayName: user.displayName,
          position1: user.position1,
          position2: user.position2,
          position3: user.position3,
          rating: user.rating,
          totalMatches: user.totalMatches,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user' },
        { status: 500 }
      );
    }
  },
  { requireUser: true }
);

// PUT /api/users/me - Update current user profile
export const PUT = withAuth(
  async (request: NextRequest, { userId }) => {
    try {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID not found' },
          { status: 404 }
        );
      }

      const body = await request.json();

      const user = await userService.update(userId, {
        position1: body.position1,
        position2: body.position2,
        position3: body.position3,
      });

      return NextResponse.json({ success: true, data: user });
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }
  },
  { requireUser: true }
);
