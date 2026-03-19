import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/services/event.service';

// GET /api/events - List all events
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    let events;
    if (groupId) {
      events = await eventService.getByGroupId(groupId);
    } else {
      events = await eventService.getAll();
    }

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body.groupId || !body.eventDate || !body.startTime) {
      return NextResponse.json(
        { success: false, error: 'groupId, eventDate, and startTime are required' },
        { status: 400 }
      );
    }

    const event = await eventService.create({
      groupId: body.groupId,
      title: body.title,
      eventDate: new Date(body.eventDate),
      startTime: body.startTime,
      totalDurationMinutes: body.totalDurationMinutes,
      minutesPerMatch: body.minutesPerMatch,
      teamsCount: body.teamsCount,
      gameType: body.gameType,
      maxPlayers: body.maxPlayers,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
