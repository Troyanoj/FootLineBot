import { NextRequest, NextResponse } from 'next/server';
import { groupService } from '@/services/group.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/groups/[id] - Get a specific group
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = params;
    const group = await groupService.findById(id);

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[id] - Update a group
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Add authorization check - only admin can update

    const group = await groupService.update(id, {
      name: body.name,
      country: body.country,
      defaultGameType: body.defaultGameType,
      tactics: body.tactics,
    });

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete a group
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = params;

    // TODO: Add authorization check - only admin can delete

    await groupService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
