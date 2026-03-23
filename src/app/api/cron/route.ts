import { NextResponse } from 'next/server';
import { recurringEventService } from '@/services/recurring-event.service';
import { pushMessage } from '@/lib/line/client';
import prisma from '@/lib/db/prisma';

/**
 * Cron job endpoint for processing recurring events
 * This endpoint should be called daily (e.g., at midnight UTC)
 * It generates events 3 days before their scheduled date
 */
export async function GET() {
  try {
    console.log('[Cron] Starting recurring events processing...');
    
    // Process all recurring events
    const generatedEvents = await recurringEventService.processRecurringEvents();
    
    console.log(`[Cron] Generated ${generatedEvents.length} events`);
    
    // Send notifications to groups about new events
    for (const generated of generatedEvents) {
      // Get the group for this recurring event
      const recurring = await prisma.recurringEvent.findUnique({
        where: { id: generated.recurringId },
        include: { group: true },
      });
      
      if (recurring && recurring.group) {
        // Get the LINE group ID from the group
        const lineGroupId = (recurring.group as any).lineGroupId;
        
        if (lineGroupId) {
          const eventDate = new Date(generated.eventDate);
          const formattedDate = eventDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
          
          const message = `✅ *¡Partido Creado!*

📅 *Evento:* Partido de Fútbol
📆 *Fecha:* ${formattedDate}
⏰ *Hora:* ${recurring.startTime}
⏱️ *Duración:* ${recurring.totalDurationMinutes} min
👥 *Equipos:* ${recurring.teamsCount}
👥 *Máx. jugadores:* ${recurring.maxPlayers || 'Sin límite'}
🆔 *ID:* ${generated.eventId}

📝 ¡A partir de este momento pueden usar !apuntar para jugar!`;

          try {
            await pushMessage(lineGroupId, {
              type: 'text',
              text: message,
            });
            console.log(`[Cron] Sent notification to group ${lineGroupId}`);
          } catch (error) {
            console.error(`[Cron] Error sending notification to group:`, error);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      generated: generatedEvents.length,
      events: generatedEvents,
    });
  } catch (error) {
    console.error('[Cron] Error processing recurring events:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
