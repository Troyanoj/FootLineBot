import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/services/event.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/events/[id] - Get a specific event
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = params;
    const event = await eventService.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Add authorization check - only group admin can update

    const event = await eventService.update(id, {
      title: body.title,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      startTime: body.startTime,
      totalDurationMinutes: body.totalDurationMinutes,
      minutesPerMatch: body.minutesPerMatch,
      teamsCount: body.teamsCount,
      gameType: body.gameType,
      maxPlayers: body.maxPlayers,
      status: body.status,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = params;

    // TODO: Add authorization check - only group admin can delete

    await eventService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
