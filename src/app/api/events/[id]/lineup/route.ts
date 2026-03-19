import { NextRequest, NextResponse } from 'next/server';
import { lineupService } from '@/services/lineup.service';
import { eventService } from '@/services/event.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/events/[id]/lineup - Get lineup for an event
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: eventId } = params;

    const event = await eventService.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const lineups = await lineupService.getByEventId(eventId);
    const teamAssignments = await lineupService.getTeamAssignments(eventId);

    return NextResponse.json({
      success: true,
      data: {
        lineups,
        teamAssignments,
      },
    });
  } catch (error) {
    console.error('Error fetching lineup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lineup' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/lineup - Generate lineup for an event
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: eventId } = params;

    const event = await eventService.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // TODO: Add authorization check - only group admin can generate lineup

    // Check if event has enough registrations
    if (!event.gameType || !event.teamsCount) {
      return NextResponse.json(
        { success: false, error: 'Event must have gameType and teamsCount defined' },
        { status: 400 }
      );
    }

    const result = await lineupService.generateLineup(eventId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating lineup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate lineup' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/lineup - Delete lineup for an event
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: eventId } = params;

    // TODO: Add authorization check

    await lineupService.deleteByEventId(eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lineup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lineup' },
      { status: 500 }
    );
  }
}
