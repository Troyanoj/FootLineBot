const fs = require('fs');
const file = 'src/lib/line/handlers/admin.handlers.ts';
let content = fs.readFileSync(file, 'utf8');

// Split into lines for easier manipulation
let lines = content.split('\n');

// Find and replace each Thai message
for (let i = 0; i < lines.length; i++) {
  // Line 407: Format message
  if (lines[i].includes('message: `⚠️ *รูปแบบไม่ถูกต้อง*')) {
    // Find the closing backtick
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrenteFormatMessage(),';
      // Remove lines from i+1 to endIdx
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 439: Empty list message
  if (lines[i].includes('message: `📋 *เหตุการณ์ประจำ*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('ใช้คำสั่ง !recurrente เพิ่ม เพื่อสร้างเหตุการณ์ทุกสัปดาห์`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '          message: getMsg(context).recurrenteEmptyListMessage(),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 447: List message
  if (lines[i].includes('let message = `📋 *เหตุการณ์ประจำทุกสัปดาห์:*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('const status = re.isActive')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '      const lang = context.lang || \'th\';';
      lines[i + 1] = '      const getDayName = (dayOfWeek: number) => recurringEventService.getDayName(dayOfWeek, lang);';
      lines[i + 2] = '      return {';
      lines[i + 3] = '        success: true,';
      lines[i + 4] = '        message: getMsg(context).recurrenteListMessage(recurringEvents, getDayName),';
      lines[i + 5] = '      };';
      lines[i + 6] = '    }';
      // Remove old lines
      lines.splice(i + 7, endIdx - i - 6);
    }
  }
  
  // Line 462: Day required message
  if (lines[i].includes('message: `⚠️ *ต้องระบุวัน*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('ตัวอย่าง: !recurrente')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrenteDayRequiredMessage(action),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 472: Invalid day message
  if (lines[i].includes('message: `⚠️ *วันไม่ถูกต้อง*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrenteInvalidDayMessage(),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 482: Pause not found message
  if (lines[i].includes('message: `⚠️ *ไม่พบเหตุการณ์ประจำ*') && lines[i-1] && lines[i-1].includes('if (!existingRecurring)')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('getDayNameThai(dayOfWeek)`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 490: Pause success message
  if (lines[i].includes('message: `⏸️ *พักเหตุการณ์ประจำแล้ว*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('เพื่อกลับมาจัดอีกครั้ง`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrentePausedMessage(recurringEventService.getDayName(dayOfWeek, lang)),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 500: Resume not found message
  if (lines[i].includes('message: `⚠️ *ไม่พบเหตุการณ์ประจำ*') && lines[i-1] && lines[i-1].includes('if (!existingRecurring)')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('getDayNameThai(dayOfWeek)`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 508: Resume success message
  if (lines[i].includes('message: `✅ *กลับมาจัดอีกครั้งแล้ว*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('การจัดอีเวนต์กลับมาทำงานแล้ว`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrenteResumedMessage(recurringEventService.getDayName(dayOfWeek, lang)),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 518: Delete not found message
  if (lines[i].includes('message: `⚠️ *ไม่พบเหตุการณ์ประจำ*') && lines[i-1] && lines[i-1].includes('if (!existingRecurring)')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('getDayNameThai(dayOfWeek)`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 526: Delete success message
  if (lines[i].includes('message: `🗑️ *ลบเหตุการณ์ประจำแล้ว*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('การจัดทุกสัปดาห์ถูกลบแล้ว`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrenteDeletedMessage(recurringEventService.getDayName(dayOfWeek, lang)),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 538: Invalid time message
  if (lines[i].includes('message: `⚠️ *เวลาไม่ถูกต้อง*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('ใช้รูปแบบ HH:MM เช่น 18:00`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '          message: getMsg(context).recurrenteInvalidTimeMessage(),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 558: Created success message
  if (lines[i].includes('message: `✅ *สร้างเหตุการณ์ประจำแล้ว*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('เพื่อพักการจัดชั่วคราว`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '        message: getMsg(context).recurrenteCreatedMessage(recurringEventService.getDayName(dayOfWeek, lang), timeInput, gameType),';
      lines.splice(i + 1, endIdx - i);
    }
  }
  
  // Line 570: Invalid action message
  if (lines[i].includes('message: `⚠️ *การดำเนินการไม่ถูกต้อง*')) {
    let endIdx = i;
    while (endIdx < lines.length && !lines[endIdx].includes('ใช้: เพิ่ม, พัก, ต่อ, ลบ, ดู`')) {
      endIdx++;
    }
    if (endIdx < lines.length) {
      lines[i] = '      message: getMsg(context).recurrenteInvalidActionMessage(),';
      lines.splice(i + 1, endIdx - i);
    }
  }
}

// Join lines back together
content = lines.join('\n');

fs.writeFileSync(file, content);
console.log('Done!');
