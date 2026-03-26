import { NextRequest, NextResponse } from 'next/server';
import { groupService } from '@/services/group.service';
import { withAuth } from '@/lib/auth';

// GET /api/groups - List all groups
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const groups = await groupService.getAll();
      return NextResponse.json({ 
        success: true, 
        data: groups.map(g => ({
          id: g.id,
          name: g.name,
          country: g.country,
          defaultGameType: g.defaultGameType,
          memberCount: g.adminUserId ? 1 : 0, // Simplified - could count members
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        }))
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch groups' },
        { status: 500 }
      );
    }
  }
);

// POST /api/groups - Create a new group
export const POST = withAuth(
  async (request: NextRequest, { userId }) => {
    try {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID required' },
          { status: 401 }
        );
      }

      const body = await request.json();

      if (!body.name) {
        return NextResponse.json(
          { success: false, error: 'Group name is required' },
          { status: 400 }
        );
      }

      const group = await groupService.create(
        {
          name: body.name,
          country: body.country,
          defaultGameType: body.defaultGameType,
          id: body.id, // Optional custom ID (for LINE group ID)
        },
        userId
      );

      return NextResponse.json({ success: true, data: group }, { status: 201 });
    } catch (error) {
      console.error('Error creating group:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create group' },
        { status: 500 }
      );
    }
  },
  { requireUser: true }
);
