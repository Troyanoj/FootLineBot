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
• !profile หรือ !โปรไฟล์ - ดูโปรไฟล์และตำแหน่ง
• !lineup หรือ !รายชื่อ - ดูรายชื่อในอีเวนต์ปัจจุบัน
• !events หรือ !อีเวนต์ - ดูปฏิทินอีเวนต์
• !groups หรือ !กลุ่ม - รายการกลุ่มที่มี
• !join [id] - เข้าร่วมกลุ่ม

*สำหรับผู้ดูแล:*
• !create หรือ !สร้าง - สร้างอีเวนต์ใหม่
• !config หรือ !ตั้งค่า - ตั้งค่าประเภทเกม
• !lineup หรือ !จัดทีม - จัดทีมอัตโนมัติ
• !close หรือ !ปิด - ปิดการลงทะเบียน
• !รายชื่อ - สร้างรายชื่อผู้เล่น

💡 *เคล็ดลับ:*
- ใช้ !help หรือ !ช่วย เพื่อดูคำสั่งทั้งหมด
- ติดต่อแอดมินกลุ่มสำหรับข้อมูลเพิ่มเติม`;
};

/** Help message */
export const helpMessage = (): string => {
  return `📋 *คำสั่งทั้งหมด*

*สำหรับผู้เล่น:*
🔹 !register หรือ !ลงทะเบียน - ลงทะเบียนเข้าร่วมอีเวนต์
🔹 !unregister หรือ !ยกเลิก - ยกเลิกการลงทะเบียน
🔹 !profile หรือ !โปรไฟล์ - ดูโปรไฟล์และตำแหน่งที่ชอบ
🔹 !lineup หรือ !รายชื่อ - ดูตำแหน่งในทีม
🔹 !events หรือ !อีเวนต์ - ดูอีเวนต์ที่กำลังจะมาถึง
🔹 !groups หรือ !กลุ่ม - รายการกลุ่มที่มี
🔹 !join [id] - เข้าร่วมกลุ่ม

*สำหรับผู้ดูแล:*
🔹 !create [วันที่] [เวลา] [ระยะเวลา] [นาทีต่อคู่] [จำนวนทีม] - สร้างอีเวนต์
🔹 !config [5|7|11] - ตั้งค่าประเภทเกม
🔹 !lineup หรือ !จัดทีม - สร้างรายชื่ออัตโนมัติ
🔹 !close หรือ !ปิด - ปิดการลงทะเบียน
🔹 !teams หรือ !ทีม - ดูทีม

*หมายเหตุ:*
- คำสั่งใช้ได้กับ ! หรือ /
- บางคำสั่งต้องอยู่ในกลุ่ม`;
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
export const eventClosedMessage = (event: Event, registrations: Registration[]): string => {
  const playerCount = registrations.length;
  return `🔒 *ปิดการลงทะเบียนแล้ว!*

📅 *อีเวนต์:* ${event.title || 'แมตซ์ฟุตบอล'}
👥 *ผู้เล่นที่ลงทะเบียน:* ${playerCount} คน

จำนวนผู้เล่นครบตามกำหนดแล้ว เตรียมตัวสนุกกันได้เลย! ⚽`;
};

/** Event details message */
export const eventDetailsMessage = (event: Event, registrations: Registration[]): string => {
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
  let message = `⚽ *รายชื่อทีม*\n\n`;

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
  for (let i = 1; i <= (lineup as any).teamsCount || 2; i++) {
    message += `🏟️ *ทีม ${i}:*\n`;
    const players = teamPlayers[i] || [];
    if (players.length > 0) {
      players.forEach((player: string, idx: number) => {
        message += `${idx + 1}. ${player}\n`;
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

/** No open event message */
export const noOpenEventMessage = (): string => {
  return `❌ *ไม่มีอีเวนต์ที่เปิด*

ขณะนี้ไม่มีอีเวนต์ที่เปิดให้ลงทะเบียนครับ`;
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

/** Lineup message */
export const lineupMessage = (event: Event): string => {
  return `⚽ *รายชื่อทีม*

📋 รายชื่อสำหรับ ${event.title || 'แมตซ์ฟุตบอล'}:

ใช้คำสั่ง !teams เพื่อดูทีมของคุณครับ`;
};

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

/** Invalid command message */
export const invalidCommandMessage = (command: string): string => {
  return `⚠️ *คำสั่งไม่ถูกต้อง*

คำสั่ง !${command} ไม่ถูกต้อง

ใช้ !help เพื่อดูคำสั่งทั้งหมดครับ`;
};
