// LINE Message Templates (Thai / English)
// เทมเพลตข้อความสำหรับ LINE

import type { User, Event, Registration, Group, Lineup, TeamAssignment } from '@/types';

// ============================================================================
// Welcome & Help Messages
// ============================================================================

/** Welcome message for new users */
export const welcomeMessage = (displayName: string): string => {
  return `👋 สวัสดีครับ ${displayName}! ยินดีต้อนรับสู่ FootLine Bot

⚽ ผมคือผู้ช่วยจัดการแมตซ์ฟุตบอลกับกลุ่มของคุณ

📋 *คำสั่งที่ใช้งานได้:*

*สำหรับผู้เล่น:*
• !register หรือ !ลงทะเบียน - ลงทะเบียนเข้าร่วมอีเวนต์ปัจจุบัน
• !unregister หรือ !ยกเลิก - ยกเลิกการลงทะเบียน
• !profile หรือ !โปรไฟล์ - ดูโปรไฟล์ของคุณ
• !ตำแหน่ง [p1] [p2] [p3] - ตั้งค่าตำแหน่งที่ชอบ
• !lineup หรือ !รายชื่อ - ดูรายชื่อในอีเวนต์ปัจจุบัน
• !events หรือ !อีเวนต์ - ดูปฏิทินอีเวนต์
• !groups หรือ !กลุ่ม - รายการกลุ่มที่มี
• !join [id] - เข้าร่วมกลุ่ม

*สำหรับผู้ดูแล:*
• !create หรือ !สร้าง - สร้างอีเวนต์ใหม่
• !config หรือ !ตั้งค่า - ตั้งค่าประเภทเกม
• !lineup หรือ !จัดทีม - จัดทีมอัตโนมัติ
• !close หรือ !ปิด - ปิดการลงทะเบียน
• !กลยุทธ์ เพิ่ม [formation] - เพิ่มการจัดวาง
• !กลยุทธ์ ลบ [formation] - ลบการจัดวาง
• !recurrente เพิ่ม พุธ 18:00 - สร้างเหตุการณ์ทุกสัปดาห์
• !recurrente พัก พุธ - พักเหตุการณ์ชั่วคราว
• !recurrente ดู - ดูรายการเหตุการณ์ประจำ
• !รายชื่อ - สร้างรายชื่อผู้เล่น

💡 *เคล็ดลับ:*
- ใช้ !help หรือ !ช่วย เพื่อดูคำสั่งทั้งหมด
- ติดต่อแอดมินกลุ่มสำหรับข้อมูลเพิ่มเติม

📖 *คู่มือการใช้งาน:*
https://app-omega-sand-14.vercel.app/help`;
};

/** Help message */
export const helpMessage = (): string => {
  return `📋 *คำสั่งของ FootLine*

*สำหรับผู้เล่น:*
🔹 !ลงทะเบียน หรือ !register - ลงชื่อเข้าเล่น
🔹 !ยกเลิก หรือ !unregister - ยกเลิกการลงชื่อ
🔹 !โปรไฟล์ หรือ !profile - ดูโปรไฟล์ของคุณ
🔹 !ตำแหน่ง หรือ !position - ตั้งค่าตำแหน่งที่ชอบ
🔹 !รายชื่อ หรือ !lineup - ดูทีมที่จัดแล้ว
🔹 !อีเวนต์ หรือ !schedule - ดูแมตซ์ถัดไป
🔹 !join [id] - เข้าร่วมกลุ่ม

*สำหรับแอดมิน:*
🔹 !สร้าง หรือ !create_event
🔹 !ตั้งค่า หรือ !config [5|7|11]
🔹 !จัดทีม หรือ !generate - จัดทีมอัตโนมัติ
🔹 !ปิด หรือ !close - ปิดรับลงทะเบียน
🔹 !เตะ @User - นำผู้เล่นออก
🔹 !recurrence - จัดกิจกรรมรายสัปดาห์

📖 *คู่มือการใช้งานแบบละเอียด:*
https://app-omega-sand-14.vercel.app/help?lang=th`;
};

// ============================================================================
// Registration Messages
// ============================================================================

/** Registration success message */
export const registrationSuccessMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `✅ *ลงทะเบียนสำเร็จ!*

📅 *อีเวนต์:* ${event.title || 'แมตซ์ฟุตบอล'}
📆 *วันที่:* ${date}
⏰ *เวลา:* ${event.startTime}
⏱️ *ระยะเวลา:* ${event.totalDurationMinutes} นาที

ขอให้สนุกกับการเล่นครับ! ⚽`;
};

/** Registration cancel success message */
export const registrationCancelSuccessMessage = (event: Event): string => {
  return `❌ *ยกเลิกการลงทะเบียนสำเร็จ*

คุณได้ยกเลิกการเข้าร่วม ${event.title || 'แมตซ์'} แล้ว

หวังว่าจะได้เจอกันในอีเวนต์หน้าครับ! 👋`;
};

/** Registration failed - event not found */
export const registrationFailedNoEventMessage = (): string => {
  return `❌ *ไม่พบอีเวนต์*

ไม่มีอีเวนต์ที่เปิดให้ลงทะเบียนในขณะนี้

ติดต่อแอดมินกลุ่มเพื่อสร้างอีเวนต์ใหม่ครับ`;
};

/** Registration failed - event full */
export const registrationFailedEventFullMessage = (): string => {
  return `❌ *เต็มแล้ว!*

อีเวนต์นี้เต็มจำนวนผู้เล่นแล้ว

ลองดูอีเวนต์อื่นหรือติดต่อแอดมินเพื่อขอเข้าร่วมครับ`;
};

/** Registration failed - already registered */
export const registrationFailedAlreadyRegisteredMessage = (): string => {
  return `ℹ️ *คุณลงทะเบียนแล้ว*

คุณได้ลงทะเบียนเข้าร่วมอีเวนต์นี้แล้ว

ไม่ต้องลงทะเบียนซ้ำครับ!`;
};

// ============================================================================
// Group Messages
// ============================================================================

/** Group registered successfully */
export const groupRegisteredMessage = (groupName: string, groupId: string): string => {
  return `✅ *กลุ่มลงทะเบียนสำเร็จ!*

🏟️ *กลุ่ม:* ${groupName}
🆔 *ID:* ${groupId}

ตอนนี้คุณสามารถใช้คำสั่งต่างๆ ได้แล้ว:
• !create - สร้างอีเวนต์
• !events - ดูอีเวนต์
• !close - ปิดการลงทะเบียน

ขอให้สนุกกับการเล่นฟุตบอลครับ! ⚽`;
};

/** Group already registered */
export const groupAlreadyRegisteredMessage = (groupName: string): string => {
  return `ℹ️ *กลุ่มลงทะเบียนแล้ว*

กลุ่ม ${groupName} ได้ลงทะเบียนกับระบบแล้ว

คุณสามารถใช้คำสั่งต่างๆ ได้เลย!`;
};

/** Group not registered */
export const groupNotRegisteredMessage = (): string => {
  return `❌ *กลุ่มยังไม่ได้ลงทะเบียน*

กลุ่มนี้ยังไม่ได้ลงทะเบียนกับระบบ

ใช้คำสั่ง !register หรือ !ลงทะเบียน เพื่อลงทะเบียนกลุ่มครับ`;
};

/** Group not found message */
export const groupNotFoundMessage = (groupId?: string): string => {
  return `❌ *ไม่พบกลุ่ม*\n\nใช้คำสั่ง !groups เพื่อดูกลุ่มที่มีอยู่ครับ`;
};

/** Already member message */
export const alreadyMemberMessage = (groupName: string): string => {
  return `ℹ️ *เป็นสมาชิกอยู่แล้ว*\n\nคุณเป็นสมาชิกของกลุ่ม ${groupName} อยู่แล้วครับ`;
};

// ============================================================================
// Event Messages
// ============================================================================

/** Event created successfully */
export const eventCreatedMessage = (event: Event): string => {
  const date = new Date(event.eventDate).toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `✅ *สร้างอีเวนต์สำเร็จ!*

📅 *อีเวนต์:* ${event.title || 'แมตซ์ฟุตบอล'}
📆 *วันที่:* ${date}
⏰ *เวลา:* ${event.startTime}
⏱️ *ระยะเวลา:* ${event.totalDurationMinutes} นาที
👥 *จำนวนทีม:* ${event.teamsCount} ทีม
👨 *ผู้เล่นต่อทีม:* ${Math.ceil((event.maxPlayers || 0) / (event.teamsCount || 1))}

📝 *การลงทะเบียน:* 
ผู้เล่นสามารถใช้คำสั่ง !register เพื่อลงทะเบียนได้เลยครับ!`;
};

/** Event closed message */
export const eventClosedMessage = (event: Event, registrations: any[]): string => {
  const playerCount = registrations.length;
  return `🔒 *ปิดการลงทะเบียนแล้ว!*

📅 *อีเวนต์:* ${event.title || 'แมตซ์ฟุตบอล'}
👥 *ผู้เล่นที่ลงทะเบียน:* ${playerCount} คน

จำนวนผู้เล่นครบตามกำหนดแล้ว เตรียมตัวสนุกกันได้เลย! ⚽`;
};

/** Event deleted message */
export const eventDeletedMessage = (event: Event): string => {
  return `✅ *ลบอีเวนต์สำเร็จ!*

อีเวนต์ "${event.title || event.id}" ได้ถูกลบแล้ว`;
};

/** User expelled message */
export const userExpelledMessage = (groupName: string): string => {
  return `✅ *ผู้ใช้ถูกไล่ออก!*

ผู้ใช้ถูกลบออกจากกลุ่ม "${groupName}" แล้ว`;
};

/** Event details message */
export const eventDetailsMessage = (event: Event, registrations: any[]): string => {
  const date = new Date(event.eventDate).toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  const playerList = registrations
    .map((r, i) => `${i + 1}. ${r.user?.displayName || 'Unknown'}`)
    .join('\n');

  return `📋 *รายละเอียดอีเวนต์*

📅 *อีเวนต์:* ${event.title || 'แมตซ์ฟุตบอล'}
📆 *วันที่:* ${date}
⏰ *เวลา:* ${event.startTime}
👥 *ผู้เล่น:* ${registrations.length}/${event.maxPlayers || '∞'}

📝 *รายชื่อผู้เล่น:*
${playerList || 'ยังไม่มีผู้ลงทะเบียน'}

💡 ใช้คำสั่ง !register เพื่อลงทะเบียนได้เลย!`;
};

/** No events message */
export const noEventsMessage = (): string => {
  return `📭 *ไม่มีอีเวนต์*

ไม่มีอีเวนต์ที่กำลังจะมาถึง

ติดต่อแอดมินเพื่อสร้างอีเวนต์ใหม่ครับ!`;
};

// ============================================================================
// Lineup Messages
// ============================================================================

/** Lineup generated message */
export const lineupGeneratedMessage = (lineup: Lineup, teams: TeamAssignment[]): string => {
  let message = `⚽ *รายชื่อทีม & ตำแหน่ง*\n\n`;

  // Get position assignments from lineup
  const positionMap: Record<string, string[]> = (lineup as any).positionAssignments || {};

  // Create player ID to position mapping
  const playerPositions: Record<string, string> = {};
  Object.keys(positionMap).forEach((position) => {
    const playerIds = positionMap[position] || [];
    playerIds.forEach((playerId: string) => {
      playerPositions[playerId] = position;
    });
  });

  // Group players by team
  const teamPlayers: { [key: number]: string[] } = {};
  teams.forEach(team => {
    if (!teamPlayers[team.teamNumber]) {
      teamPlayers[team.teamNumber] = [];
    }
    team.playerIds.forEach(playerId => {
      teamPlayers[team.teamNumber].push(playerId);
    });
  });

  // Generate message for each team
  const teamsCount = (lineup as any).teamsCount || 2;
  for (let i = 1; i <= teamsCount; i++) {
    message += `🏟️ *ทีม ${i}:*\n`;
    const players = teamPlayers[i] || [];
    if (players.length > 0) {
      players.forEach((player: string, idx: number) => {
        const position = playerPositions[player];
        const positionThai = position ? getPositionThai(position) : '';
        message += `${idx + 1}. ${player} ${positionThai ? `(${positionThai})` : ''}\n`;
      });
    } else {
      message += `ยังไม่มีผู้เล่น\n`;
    }
    message += '\n';
  }

  return message;
};

// ============================================================================
// Error Messages
// ============================================================================

/** Generic error message */
export const errorMessage = (): string => {
  return `❌ *เกิดข้อผิดพลาด*

กรุณาลองอีกครั้งหรือติดต่อแอดมินกลุ่ม`;
};

/** Unknown command message */
export const unknownCommandMessage = (command: string): string => {
  return `❓ *ไม่ทราบคำสั่ง*

คำสั่ง "${command}" ไม่ถูกต้อง

ใช้ !help หรือ !ช่วย เพื่อดูคำสั่งทั้งหมดครับ`;
};

/** Invalid parameters message */
export const invalidParametersMessage = (command: string): string => {
  return `⚠️ *พารามิเตอร์ไม่ถูกต้อง*

คำสั่ง !${command} ต้องการพารามิเตอร์ที่ต่างกัน
ใช้ !help เพื่อดูรูปแบบที่ถูกต้องครับ`;
};

// ============================================================================
// Profile Messages
// ============================================================================

/** User profile message */
export const profileMessage = (user: User): string => {
  return `👤 *โปรไฟล์ของคุณ*

📛 *ชื่อ:* ${user.displayName}
⚽ *ตำแหน่งที่ 1:* ${user.position1 || 'ไม่ได้ตั้ง'}
⚽ *ตำแหน่งที่ 2:* ${user.position2 || 'ไม่ได้ตั้ง'}
⚽ *ตำแหน่งที่ 3:* ${user.position3 || 'ไม่ได้ตั้ง'}
⭐ *ระดับ:* ${user.rating || 5}/10
⚽ *แมตซ์ที่เล่น:* ${user.totalMatches || 0}
⏱️ *นาทีที่เล่น:* ${user.totalPlayedMinutes || 0}

💡 ใช้คำสั่ง !config เพื่อเปลี่ยนตำแหน่งครับ`;
};

// ============================================================================
// Admin Messages
// ============================================================================

/** Not admin message */
export const notAdminMessage = (): string => {
  return `⛔ *ไม่มีสิทธิ์*

คุณไม่มีสิทธิ์ใช้คำสั่งนี้

ติดต่อผู้ดูแลกลุ่มครับ`;
};

/** Not in group message */
export const notInGroupMessage = (): string => {
  return `ℹ️ *ต้องอยู่ในกลุ่ม*

คำสั่งนี้ต้องใช้ในกลุ่ม LINE เท่านั้น`;
};

/** Default group name */
export const defaultGroupName = (): string => {
  return 'กลุ่มฟุตบอลใหม่';
};

/** Default region */
export const defaultRegion = (): string => {
  return 'Thailand';
};

// ============================================================================
// Button Messages
// ============================================================================

/** Create help buttons */
export const helpButtons = (): any => {
  return {
    type: 'template',
    altText: 'เลือกคำสั่ง',
    template: {
      type: 'buttons',
      text: 'เลือกคำสั่งที่ต้องการ:',
      actions: [
        {
          type: 'message',
          label: '📋 ช่วย',
          text: '!help',
        },
        {
          type: 'message',
          label: '📅 อีเวนต์',
          text: '!events',
        },
        {
          type: 'message',
          label: '⚽ ลงทะเบียน',
          text: '!register',
        },
        {
          type: 'message',
          label: '👤 โปรไฟล์',
          text: '!profile',
        },
      ],
    },
  };
};

/** Default fallback message */
export const defaultMessage = (): string => {
  return `👋 สวัสดีครับ!

ผมคือ FootLineBot ผู้ช่วยจัดการแมตซ์ฟุตบอล

ใช้คำสั่ง !help หรือ !ช่วย เพื่อดูคำสั่งทั้งหมดครับ`;
};

// ============================================================================
// Additional Messages (Thai)
// ============================================================================

/** Admin required message */
export const adminRequiredMessage = (): string => {
  return `⛔ *ต้องเป็นแอดมิน*

คุณต้องเป็นแอดมินของกลุ่มเพื่อใช้คำสั่งนี้ครับ`;
};

export const invalidCommandMessage = (command?: string): string => {
  return `❓ *ไม่พบคำสั่ง*

ใช้ !ช่วย เพื่อดูคำสั่งที่สามารถใช้ได้ครับ`;
};

export const adminInvalidFormatMessage = (command: string, example: string): string => {
  return `⚠️ *รูปแบบไม่ถูกต้อง*

ใช้: !${command} ${example}

ตัวอย่าง: !${command} 2024-12-25 18:00 90 20 2`;
};

export const adminConfigUpdatedMessage = (type: string): string => {
  return `✅ *อัปเดตการตั้งค่าแล้ว*

ประเภทเกมเริ่มต้น: ฟุตบอล ${type} คน

การเปลี่ยนแปลงนี้จะมีผลกับอีเวนต์ใหม่ที่สร้างขึ้นครับ`;
};

/** Tactica format error message */
export const tacticaFormatMessage = (): string => {
  return `⚠️ *รูปแบบไม่ถูกต้อง*

ใช้: !กลยุทธ์ [เพิ่ม|ลบ] [การจัดวาง]
หรือ: !tactica [add|remove] [formation]

ตัวอย่าง:
• !กลยุทธ์ เพิ่ม 4-3-3
• !กลยุทธ์ เพิ่ม 3-2-1
• !กลยุทธ์ ลบ 4-3-3

*การจัดวางที่ใช้ได้:*
• ฟุตบอล 7 คน: 3-2-1, 2-3-1, 2-2-2, 3-1-2
• ฟุตบอล 5 คน: 2-2, 1-2-1, 1-1-2, 2-1-1
• ฟุตบอล 11 คน: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3`;
};

/** Tactica invalid action message */
export const tacticaInvalidActionMessage = (): string => {
  return `⚠️ *การดำเนินการไม่ถูกต้อง* ใช้: เพิ่ม หรือ ลบ (add หรือ remove)`;
};

/** Tactica added message */
export const tacticaAddedMessage = (): string => {
  return 'เพิ่มแล้ว';
};

/** Tactica removed message */
export const tacticaRemovedMessage = (): string => {
  return 'ลบแล้ว';
};

/** Tactica success message */
export const tacticaSuccessMessage = (actionText: string, formation: string, groupName: string, availableFormations: string[]): string => {
  return `✅ *${actionText}*

📋 *การจัดวาง:* ${formation}
👥 *กลุ่ม:* ${groupName}

*การจัดวางที่ใช้ได้:*
${availableFormations.map((t) => `• ${t}`).join('\n') || 'ยังไม่มีการจัดวาง'}`;
};

// ============================================================================
// Recurrente Messages (Thai)
// ============================================================================

/** Recurrente format error message */
export const recurrenteFormatMessage = (): string => {
  return `⚠️ *รูปแบบไม่ถูกต้อง*

ใช้: !recurrente [เพิ่ม|พัก|ต่อ|ลบ|ดู] [วัน] [เวลา]
หรือ: !recurrente [agregar|pausar|reanudar|eliminar|listar]

*คำสั่ง:*
• !recurrente เพิ่ม พุธ 18:00 - สร้างเหตุการณ์ทุกวันพุธ
• !recurrente พัก พุธ - พักเหตุการณ์ชั่วคราว
• !recurrente ต่อ พุธ - กลับมาจัดอีกครั้ง
• !recurrente ลบ พุธ - ลบการจัดทุกสัปดาห์
• !recurrente ดู - ดูรายการทั้งหมด

*วันในสัปดาห์:*
อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`;
};

/** Recurrente empty list message */
export const recurrenteEmptyListMessage = (): string => {
  return `📋 *เหตุการณ์ประจำ*

ยังไม่มีเหตุการณ์ประจำที่ตั้งค่าไว้

ใช้คำสั่ง !recurrente เพิ่ม เพื่อสร้างเหตุการณ์ทุกสัปดาห์`;
};

/** Recurrente list message */
export const recurrenteListMessage = (events: any[], getDayName: (day: number) => string): string => {
  if (events.length === 0) {
    return recurrenteEmptyListMessage();
  }
  let message = `📋 *เหตุการณ์ประจำทุกสัปดาห์:*\n\n`;
  events.forEach((re: any, idx: number) => {
    const dayName = getDayName(re.dayOfWeek);
    const status = re.isActive ? '✅ กำลังทำงาน' : '⏸️ พักอยู่';
    message += `${idx + 1}. *${dayName}* ${re.startTime}\n`;
    message += `   ${status} | ${re.gameType}v${re.gameType} | ${re.teamsCount} ทีม\n\n`;
  });
  return message;
};

/** Recurrente day required message */
export const recurrenteDayRequiredMessage = (action: string): string => {
  return `⚠️ *ต้องระบุวัน*\n\nใช้: !recurrente ${action} [วัน] [เวลา]\nตัวอย่าง: !recurrente ${action} พุธ 18:00`;
};

/** Recurrente invalid day message */
export const recurrenteInvalidDayMessage = (): string => {
  return `⚠️ *วันไม่ถูกต้อง*\n\nวันที่ใช้ได้: อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`;
};

/** Recurrente not found message */
export const recurrenteNotFoundMessage = (dayName: string): string => {
  return `⚠️ *ไม่พบเหตุการณ์ประจำ*\n\nไม่มีเหตุการณ์ประจำในวัน${dayName}`;
};

/** Recurrente paused message */
export const recurrentePausedMessage = (dayName: string): string => {
  return `⏸️ *พักเหตุการณ์ประจำแล้ว*\n\nวัน${dayName} - การจัดอีเวนต์ถูกพักไว้ชั่วคราว\n\nใช้คำสั่ง !recurrente ต่อ เพื่อกลับมาจัดอีกครั้ง`;
};

/** Recurrente resumed message */
export const recurrenteResumedMessage = (dayName: string): string => {
  return `✅ *กลับมาจัดอีกครั้งแล้ว*\n\nวัน${dayName} - การจัดอีเวนต์กลับมาทำงานแล้ว`;
};

/** Recurrente deleted message */
export const recurrenteDeletedMessage = (dayName: string): string => {
  return `🗑️ *ลบเหตุการณ์ประจำแล้ว*\n\nวัน${dayName} - การจัดทุกสัปดาห์ถูกลบแล้ว`;
};

/** Recurrente invalid time message */
export const recurrenteInvalidTimeMessage = (): string => {
  return `⚠️ *เวลาไม่ถูกต้อง*\n\nใช้รูปแบบ HH:MM เช่น 18:00`;
};

/** Recurrente created message */
export const recurrenteCreatedMessage = (dayName: string, time: string, gameType: string): string => {
  return `✅ *สร้างเหตุการณ์ประจำแล้ว*\n\n📅 ทุก${dayName}\n⏰ เวลา: ${time}\n⚽ ประเภท: ฟุตบอล ${gameType} คน\n\n💡 ใช้คำสั่ง !recurrente พัก เพื่อพักการจัดชั่วคราว`;
};

/** Recurrente invalid action message */
export const recurrenteInvalidActionMessage = (): string => {
  return `⚠️ *การดำเนินการไม่ถูกต้อง*\n\nใช้: เพิ่ม, พัก, ต่อ, ลบ, ดู`;
};

/** No open event message */
export const noOpenEventMessage = (): string => {
  return `❌ *ไม่มีอีเวนต์ที่เปิด*`;
};

/** No registrations for lineup message */
export const noRegistrationsForLineupMessage = (): string => {
  return `⚠️ *ไม่มีผู้ลงทะเบียน*\n\nไม่มีผู้เล่นที่ลงทะเบียนสำหรับอีเวนต์นี้ครับ`;
};

/** Lineup generated with details message */
export const lineupGeneratedWithDetailsMessage = (eventTitle: string, teamsCount: number, playersCount: number): string => {
  return `✅ *สร้างรายชื่อทีมแล้ว*\n\nอีเวนต์: ${eventTitle || 'แมตซ์ฟุตบอล'}\nทีม: ${teamsCount}\nผู้เล่น: ${playersCount}\n\nใช้คำสั่ง !รายชื่อ เพื่อดูรายชื่อทีม`;
};

/** Already registered message */
export const alreadyRegisteredMessage = (): string => {
  return `ℹ️ *ลงทะเบียนแล้ว*

คุณได้ลงทะเบียนเข้าร่วมอีเวนต์นี้แล้วครับ`;
};

/** Not registered message */
export const notRegisteredMessage = (): string => {
  return `❌ *ยังไม่ได้ลงทะเบียน*

คุณยังไม่ได้ลงทะเบียนเข้าร่วมอีเวนต์นี้ครับ`;
};

/** Registration cancelled message */
export const registrationCancelledMessage = (): string => {
  return `❌ *ยกเลิกแล้ว*

คุณได้ยกเลิกการลงทะเบียนแล้วครับ`;
};

/** Registration closed message */
export const registrationClosedMessage = (): string => {
  return `🔒 *ปิดการลงทะเบียนแล้ว*

การลงทะเบียนสำหรับอีเวนต์นี้ถูกปิดแล้วครับ`;
};

/** No lineup message */
export const noLineupMessage = (): string => {
  return `❌ *ยังไม่มีรายชื่อ*

รายชื่อทีมยังไม่ถูกสร้าง กรุณารอแอดมินจัดทีมก่อนครับ`;
};

/** Lineup message with positions */
export const lineupMessage = (
  event: Event,
  teamAssignments?: any[],
  lineups?: any[],
  userId?: string
): string => {
  if (!lineups || lineups.length === 0) {
    return `⚽ *รายชื่อทีม*

📋 รายชื่อสำหรับ ${event.title || 'แมตซ์ฟุตบอล'}:

ใช้คำสั่ง !teams เพื่อดูทีมของคุณครับ`;
  }

  let message = `⚽ *รายชื่อทีม & ตำแหน่ง*\n\n`;
  message += `📅 ${event.title || 'แมตซ์ฟุตบอล'}\n`;
  message += `⏰ เวลา: ${event.startTime}\n`;
  message += `⏱️ ระยะเวลา: ${event.totalDurationMinutes} นาที\n\n`;

  // Get position assignments from lineups
  const positionMap: Record<number, Record<string, string>> = {};
  lineups.forEach((lineup: any) => {
    if (!positionMap[lineup.teamNumber]) {
      positionMap[lineup.teamNumber] = {};
    }
    const assignments = lineup.positionAssignments || {};
    Object.keys(assignments).forEach((position) => {
      const playerIds = assignments[position] || [];
      playerIds.forEach((playerId: string) => {
        positionMap[lineup.teamNumber][playerId] = position;
      });
    });
  });

  // Get player names from teamAssignments
  const playerNames: Record<string, string> = {};
  if (teamAssignments) {
    teamAssignments.forEach((team: any) => {
      if (team.playerIds) {
        team.playerIds.forEach((playerId: string, idx: number) => {
          playerNames[playerId] = `ผู้เล่น${idx + 1}`;
        });
      }
    });
  }

  // Generate message for each team
  const teamsCount = lineups.length || 2;
  for (let i = 1; i <= teamsCount; i++) {
    const lineup = lineups.find((l: any) => l.teamNumber === i);
    if (!lineup) continue;

    const assignments = lineup.positionAssignments || {};
    const positions = Object.keys(assignments);

    message += `🏟️ *ทีม ${i}:*\n`;

    if (positions.length > 0) {
      positions.forEach((position) => {
        const playerIds = assignments[position] || [];
        if (playerIds.length > 0) {
          const playerId = playerIds[0];
          const positionThai = getPositionThai(position);
          message += `• ${positionThai}: ${playerNames[playerId] || 'ผู้เล่น'}\n`;
        }
      });
    } else {
      message += `ยังไม่มีผู้เล่น\n`;
    }

    // Show substitutes
    if (teamAssignments) {
      const team = teamAssignments.find((t: any) => t.teamNumber === i);
      if (team && team.substitutes && team.substitutes.length > 0) {
        message += `\n🔄 *ตัวสำรอง:*\n`;
        team.substitutes.forEach((subId: string, idx: number) => {
          message += `${idx + 1}. ${playerNames[subId] || 'ผู้เล่น'}\n`;
        });
      }
    }

    message += '\n';
  }

  return message;
};

/** Get Thai position name */
function getPositionThai(position: string): string {
  const positions: Record<string, string> = {
    'GK': 'ผู้รักษาประตู',
    'CB': 'กองหลังกลาง',
    'LB': 'แบ็คซ้าย',
    'RB': 'แบ็คขวา',
    'LWB': 'วิงแบ็คซ้าย',
    'RWB': 'วิงแบ็คขวา',
    'CDM': 'กองกลางตัวรับ',
    'CM': 'กองกลาง',
    'CAM': 'กองกลางตัวรุก',
    'LM': 'วิงซ้าย',
    'RM': 'วิงขวา',
    'LW': 'ปีกซ้าย',
    'RW': 'ปีกขวา',
    'CF': 'กองหน้าตัวเป้า',
    'ST': 'กองหน้า',
    'DC': 'เซ็นเตอร์แบ็ค',
    'DEF': 'กองหลัง',
    'MID': 'กองกลาง',
    'FWD': 'กองหน้า',
  };
  return positions[position] || position;
}

/** Schedule message */
export const scheduleMessage = (events: Event[]): string => {
  if (events.length === 0) {
    return `📭 *ไม่มีอีเวนต์ที่กำลังจะมาถึง*

ติดต่อแอดมินเพื่อสร้างอีเวนต์ใหม่ครับ`;
  }
  let msg = `📅 *อีเวนต์ที่กำลังจะมาถึง:*\n\n`;
  events.forEach((e, i) => {
    const d = new Date(e.eventDate).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
    msg += `${i+1}. ${e.title || 'แมตซ์ฟุตบอล'} - ${d}\n`;
  });
  msg += '\n💡 ใช้คำสั่ง !register เพื่อลงทะเบียนได้เลยครับ';
  return msg;
};

/** Groups list message */
export const groupsListMessage = (groups: Group[]): string => {
  if (groups.length === 0) {
    return `📋 *คุณยังไม่ได้เข้าร่วมกลุ่ม*

ใช้คำสั่ง !join [id] เพื่อเข้าร่วมกลุ่มครับ`;
  }
  let msg = `📋 *กลุ่มที่คุณเข้าร่วม:*\n\n`;
  groups.forEach((g, i) => {
    msg += `${i+1}. ${(g as any).name || 'กลุ่ม'} (ID: ${g.id.substring(0,8)})\n`;
  });
  return msg;
};

/** Joined group message */
export const joinedGroupMessage = (): string => {
  return `👋 *FootLineBot ได้เข้าร่วมกลุ่มแล้ว!*

⚽ ผมคือผู้ช่วยจัดการแมตซ์ฟุตบอล

📋 ใช้คำสั่ง !help เพื่อดูคำสั่งทั้งหมดครับ`;
};
