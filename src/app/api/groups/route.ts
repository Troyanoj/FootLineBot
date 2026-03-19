import { NextRequest, NextResponse } from 'next/server';
import { groupService } from '@/services/group.service';

// GET /api/groups - List all groups
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Add authentication
    const groups = await groupService.getAll();
    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // TODO: Add authentication and get userId from session
    const adminUserId = body.adminUserId;
    
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
      },
      adminUserId
    );

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
