import { NextRequest, NextResponse } from 'next/server';
import { registrationService } from '@/services/registration.service';
import { eventService } from '@/services/event.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/events/[id]/register - Register for an event
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: eventId } = params;
    const body = await request.json();

    // TODO: Get userId from authenticated session
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await eventService.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is open for registration
    if (event.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Event is not open for registration' },
        { status: 400 }
      );
    }

    // Check if already registered
    const isRegistered = await registrationService.isRegistered(eventId, userId);
    if (isRegistered) {
      return NextResponse.json(
        { success: false, error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    const registration = await registrationService.register({
      eventId,
      userId,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/register - Cancel registration
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: eventId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get registration
    const registration = await registrationService.getByEventAndUser(eventId, userId);
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Cancel registration
    const updated = await registrationService.cancel(registration.id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}
