const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/lib/line/handlers/admin.handlers.ts', 'utf8');

// Replace 1: Format message (lines ~404-420)
content = content.replace(
  /if \(args\.length === 0\) \{\n      return \{\n        success: false,\n        message: `⚠️ \*รูปแบบไม่ถูกต้อง\*\n\nใช้: !recurrente \[เพิ่ม\|พัก\|ต่อ\|ลบ\|ดู\] \[วัน\] \[เวลา\]\nหรือ: !recurrente \[agregar\|pausar\|reanudar\|eliminar\|listar\]\n\n\*คำสั่ง:\*\n• !recurrente เพิ่ม พุธ 18:00 - สร้างเหตุการณ์ทุกวันพุธ\n• !recurrente พัก พุธ - พักเหตุการณ์ชั่วคราว\n• !recurrente ต่อ พุธ - กลับมาจัดอีกครั้ง\n• !recurrente ลบ พุธ - ลบการจัดทุกสัปดาห์\n• !recurrente ดู - ดูรายการทั้งหมด\n\n\*วันในสัปดาห์:\*\nอาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`,\n      \}\n    \}/,
  `if (args.length === 0) {
      return {
        success: false,
        message: getMsg(context).recurrenteFormatMessage(),
      };
    }`
);

// Replace 2: Empty list message (lines ~435-445)
content = content.replace(
  /if \(recurringEvents\.length === 0\) \{\n        return \{\n          success: true,\n          message: `📋 \*เหตุการณ์ประจำ\*\n\nยังไม่มีเหตุการณ์ประจำที่ตั้งค่าไว้\n\nใช้คำสั่ง !recurrente เพิ่ม เพื่อสร้างเหตุการณ์ทุกสัปดาห์`,\n        \}\n      \}/,
  `if (recurringEvents.length === 0) {
        return {
          success: true,
          message: getMsg(context).recurrenteEmptyListMessage(),
        };
      }`
);

// Replace 3: List message block (lines ~447-460) - this is complex, handle differently
// First, add lang variable in the list block
content = content.replace(
  /\/\/ Handle listar action\n    if \(action === 'listar' \|\| action === 'list'\) \{\n      const recurringEvents = await recurringEventService\.getByGroupId\(group\.id\);\n      \n      if \(recurringEvents\.length === 0\) \{\n        return \{\n          success: true,\n          message: getMsg\(context\)\.recurrenteEmptyListMessage\(\),\n        \}\;\n      \}\n      \n      let message = `📋 \*เหตุการณ์ประจำทุกสัปดาห์:\*\\n\\n`;\n      recurringEvents\.forEach\(\(re: any, idx: number\) => \{\n        const dayName = recurringEventService\.getDayNameThai\(re\.dayOfWeek\);\n        const status = re\.isActive \? '✅ � active' : '⏸️ พักอยู่';\n        message \+= `\$\{idx \+ 1\}\. \*\$\{dayName\}\* \$\{re\.startTime\}\\n`;\n        message \+= `   \$\{status\} \| \$\{re\.gameType\}v\$\{re\.gameType\} \| \$\{re\.teamsCount\} ทีม\\n\\n`;\n      \}\);\n      \n      return \{\n        success: true,\n        message,\n      \}\;\n    \}/,
  `// Handle listar action
    if (action === 'listar' || action === 'list') {
      const recurringEvents = await recurringEventService.getByGroupId(group.id);
      const lang = context.lang || 'th';
      
      if (recurringEvents.length === 0) {
        return {
          success: true,
          message: getMsg(context).recurrenteEmptyListMessage(),
        };
      }
      
      const getDayName = (dayOfWeek: number) => recurringEventService.getDayName(dayOfWeek, lang);
      return {
        success: true,
        message: getMsg(context).recurrenteListMessage(recurringEvents, getDayName),
      };
    }`
);

// Replace 4: Day required message (lines ~444-449)
content = content.replace(
  /\/\/ For other actions, we need more arguments\n    if \(args\.length < 2\) \{\n      return \{\n        success: false,\n        message: `⚠️ \*ต้องระบุวัน\*\\n\\nใช้: !recurrente \$\{action\} \[วัน\] \[เวลา\]\\nตัวอย่าง: !recurrente \$\{action\} พุธ 18:00`,\n      \}\;\n    \}/,
  `// For other actions, we need more arguments
    if (args.length < 2) {
      return {
        success: false,
        message: getMsg(context).recurrenteDayRequiredMessage(action),
      };
    }`
);

// Replace 5: Invalid day message (lines ~455-460)
content = content.replace(
  /if \(dayOfWeek === null\) \{\n      return \{\n        success: false,\n        message: `⚠️ \*วันไม่ถูกต้อง\*\\n\\nวันที่ใช้ได้: อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`,\n      \}\;\n    \}/,
  `if (dayOfWeek === null) {
      return {
        success: false,
        message: getMsg(context).recurrenteInvalidDayMessage(),
      };
    }`
);

// Replace 6: Pause not found (lines ~467-472)
content = content.replace(
  /if \(action === 'pausar' \|\| action === 'pause'\) \{\n      if \(!existingRecurring\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*ไม่พบเหตุการณ์ประจำ\*\\n\\nไม่มีเหตุการณ์ประจำในวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}`,\n        \}\;\n      \}/,
  `if (action === 'pausar' || action === 'pause') {
      if (!existingRecurring) {
        const lang = context.lang || 'th';
        return {
          success: false,
          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),
        };
      }`
);

// Replace 7: Pause success (lines ~474-480)
content = content.replace(
  /await recurringEventService\.pause\(existingRecurring\.id\);\n      \n      return \{\n        success: true,\n        message: `⏸️ \*พักเหตุการณ์ประจำแล้ว\*\\n\\nวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\} - การจัดอีเวนต์ถูกพักไว้ชั่วคราว\\n\\nใช้คำสั่ง !recurrente ต่อ \$\{dayInput\} เพื่อกลับมาจัดอีกครั้ง`,\n      \}\;\n    \}/,
  `await recurringEventService.pause(existingRecurring.id);
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrentePausedMessage(recurringEventService.getDayName(dayOfWeek, lang)),
      };
    }`
);

// Replace 8: Resume not found (lines ~484-489)
content = content.replace(
  /if \(action === 'reanudar' \|\| action === 'resume'\) \{\n      if \(!existingRecurring\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*ไม่พบเหตุการณ์ประจำ\*\\n\\nไม่มีเหตุการณ์ประจำในวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}`,\n        \}\;\n      \}/,
  `if (action === 'reanudar' || action === 'resume') {
      if (!existingRecurring) {
        const lang = context.lang || 'th';
        return {
          success: false,
          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),
        };
      }`
);

// Replace 9: Resume success (lines ~492-498)
content = content.replace(
  /await recurringEventService\.resume\(existingRecurring\.id\);\n      \n      return \{\n        success: true,\n        message: `✅ \*กลับมาจัดอีกครั้งแล้ว\*\\n\\nวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\} - การจัดอีเวนต์กลับมาทำงานแล้ว`,\n      \}\;\n    \}/,
  `await recurringEventService.resume(existingRecurring.id);
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrenteResumedMessage(recurringEventService.getDayName(dayOfWeek, lang)),
      };
    }`
);

// Replace 10: Delete not found (lines ~502-507)
content = content.replace(
  /if \(action === 'eliminar' \|\| action === 'delete'\) \{\n      if \(!existingRecurring\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*ไม่พบเหตุการณ์ประจำ\*\\n\\nไม่มีเหตุการณ์ประจำในวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}`,\n        \}\;\n      \}/,
  `if (action === 'eliminar' || action === 'delete') {
      if (!existingRecurring) {
        const lang = context.lang || 'th';
        return {
          success: false,
          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),
        };
      }`
);

// Replace 11: Delete success (lines ~510-516)
content = content.replace(
  /await recurringEventService\.delete\(existingRecurring\.id\);\n      \n      return \{\n        success: true,\n        message: `🗑️ \*ลบเหตุการณ์ประจำแล้ว\*\\n\\nวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\} - การจัดทุกสัปดาห์ถูกลบแล้ว`,\n      \}\;\n    \}/,
  `await recurringEventService.delete(existingRecurring.id);
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrenteDeletedMessage(recurringEventService.getDayName(dayOfWeek, lang)),
      };
    }`
);

// Replace 12: Invalid time message (lines ~524-529)
content = content.replace(
  /if \(!timeRegex\.test\(timeInput\)\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*เวลาไม่ถูกต้อง\*\\n\\nใช้รูปแบบ HH:MM เช่น 18:00`,\n        \}\;\n      \}/,
  `if (!timeRegex.test(timeInput)) {
        return {
          success: false,
          message: getMsg(context).recurrenteInvalidTimeMessage(),
        };
      }`
);

// Replace 13: Created success message (lines ~543-552)
content = content.replace(
  /await recurringEventService\.create\(\{\n        groupId: group\.id,\n        dayOfWeek,\n        startTime: timeInput,\n        gameType,\n        teamsCount: 2,\n        totalDurationMinutes: 90,\n        minutesPerMatch: 20,\n      \}\);\n      \n      return \{\n        success: true,\n        message: `✅ \*สร้างเหตุการณ์ประจำแล้ว\*\\n\\n📅 ทุก\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}\\n⏰ เวลา: \$\{timeInput\}\\n⚽ ประเภท: ฟุตบอล \$\{gameType\} คน\\n\\n💡 ใช้คำสั่ง !recurrente พัก \$\{dayInput\} เพื่อพักการจัดชั่วคราว`,\n      \}\;\n    \}/,
  `await recurringEventService.create({
        groupId: group.id,
        dayOfWeek,
        startTime: timeInput,
        gameType,
        teamsCount: 2,
        totalDurationMinutes: 90,
        minutesPerMatch: 20,
      });
      
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrenteCreatedMessage(recurringEventService.getDayName(dayOfWeek, lang), timeInput, gameType),
      };
    }`
);

// Replace 14: Invalid action message (lines ~555-559)
content = content.replace(
  /return \{\n      success: false,\n      message: `⚠️ \*การดำเนินการไม่ถูกต้อง\*\\n\\nใช้: เพิ่ม, พัก, ต่อ, ลบ, ดู`,\n    \}/,
  `return {
      success: false,
      message: getMsg(context).recurrenteInvalidActionMessage(),
    }`
);

// Write the file
fs.writeFileSync('src/lib/line/handlers/admin.handlers.ts', content);

console.log('Done! All replacements made.');
