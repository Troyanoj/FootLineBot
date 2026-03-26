import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/services/event.service';
import { groupService } from '@/services/group.service';
import { withAuth } from '@/lib/auth';

// GET /api/events - List events
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const groupId = searchParams.get('groupId');

      let events;
      if (groupId) {
        // Verify user has access to this group
        const group = await groupService.findById(groupId);
        if (!group) {
          return NextResponse.json(
            { success: false, error: 'Group not found' },
            { status: 404 }
          );
        }
        events = await eventService.getByGroupId(groupId);
      } else {
        events = await eventService.getAll();
      }

      return NextResponse.json({ 
        success: true, 
        data: events.map(e => ({
          id: e.id,
          groupId: e.groupId,
          title: e.title,
          eventDate: e.eventDate,
          startTime: e.startTime,
          totalDurationMinutes: e.totalDurationMinutes,
          minutesPerMatch: e.minutesPerMatch,
          teamsCount: e.teamsCount,
          gameType: e.gameType,
          maxPlayers: e.maxPlayers,
          status: e.status,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        }))
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch events' },
        { status: 500 }
      );
    }
  }
);

// POST /api/events - Create a new event (requires admin)
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

      if (!body.groupId || !body.eventDate || !body.startTime) {
        return NextResponse.json(
          { success: false, error: 'groupId, eventDate, and startTime are required' },
          { status: 400 }
        );
      }

      // Verify user is admin of the group
      const group = await groupService.findById(body.groupId);
      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }

      const isAdmin = await groupService.isAdmin(body.groupId, userId);
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only group admins can create events' },
          { status: 403 }
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
  },
  { requireUser: true }
);
