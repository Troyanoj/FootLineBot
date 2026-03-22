const fs = require('fs');
const file = 'src/lib/line/handlers/admin.handlers.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace format message (around lines 404-420)
content = content.replace(
  /if \(args\.length === 0\) \{\n      return \{\n        success: false,\n        message: `⚠️ \*รูปแบบไม่ถูกต้อง\*[\s\S]*?อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`,/,
  `if (args.length === 0) {
      return {
        success: false,
        message: getMsg(context).recurrenteFormatMessage(),`
);

// 2. Replace empty list message (around lines 435-445)
content = content.replace(
  /if \(recurringEvents\.length === 0\) \{\n        return \{\n          success: true,\n          message: `📋 \*เหตุการณ์ประจำ\*[\s\S]*?ใช้คำสั่ง !recurrente เพิ่ม เพื่อสร้างเหตุการณ์ทุกสัปดาห์`,/,
  `if (recurringEvents.length === 0) {
        return {
          success: true,
          message: getMsg(context).recurrenteEmptyListMessage(),`
);

// 3. Replace list message (around lines 447-455)
content = content.replace(
  /let message = `📋 \*เหตุการณ์ประจำทุกสัปดาห์:\*\\n\\n`;\n      recurringEvents\.forEach\(\(re: any, idx: number\) => \{\n        const dayName = recurringEventService\.getDayNameThai\(re\.dayOfWeek\);[\s\S]*?const status = re\.isActive \? '✅ � active' : '⏸️ พักอยู่';/,
  `const lang = context.lang || 'th';
      const getDayName = (dayOfWeek: number) => recurringEventService.getDayName(dayOfWeek, lang);
      return {
        success: true,
        message: getMsg(context).recurrenteListMessage(recurringEvents, getDayName),`
);

// 4. Replace day required message (around lines 460-465)
content = content.replace(
  /if \(args\.length < 2\) \{\n      return \{\n        success: false,\n        message: `⚠️ \*ต้องระบุวัน\*\\n\\nใช้: !recurrente \$\{action\} \[วัน\] \[เวลา\]\\nตัวอย่าง: !recurrente \$\{action\} พุธ 18:00`,/,
  `if (args.length < 2) {
      return {
        success: false,
        message: getMsg(context).recurrenteDayRequiredMessage(action),`
);

// 5. Replace invalid day message (around lines 470-475)
content = content.replace(
  /if \(dayOfWeek === null\) \{\n      return \{\n        success: false,\n        message: `⚠️ \*วันไม่ถูกต้อง\*\\n\\nวันที่ใช้ได้: อาทิตย์, จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์`,/,
  `if (dayOfWeek === null) {
      return {
        success: false,
        message: getMsg(context).recurrenteInvalidDayMessage(),`
);

// 6. Replace pause not found message (around lines 477-480)
content = content.replace(
  /if \(action === 'pausar' \|\| action === 'pause'\) \{\n      if \(!existingRecurring\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*ไม่พบเหตุการณ์ประจำ\*\\n\\nไม่มีเหตุการณ์ประจำในวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}`,/,
  `if (action === 'pausar' || action === 'pause') {
      if (!existingRecurring) {
        const lang = context.lang || 'th';
        return {
          success: false,
          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),`
);

// 7. Replace pause success message (around lines 485-492)
content = content.replace(
  /await recurringEventService\.pause\(existingRecurring\.id\);\n      \n      return \{\n        success: true,\n        message: `⏸️ \*พักเหตุการณ์ประจำแล้ว\*\\n\\nวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\} - การจัดอีเวนต์ถูกพักไว้ชั่วคราว\\n\\nใช้คำสั่ง !recurrente ต่อ \$\{dayInput\} เพื่อกลับมาจัดอีกครั้ง`,/,
  `await recurringEventService.pause(existingRecurring.id);
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrentePausedMessage(recurringEventService.getDayName(dayOfWeek, lang)),`
);

// 8. Replace resume not found message
content = content.replace(
  /if \(action === 'reanudar' \|\| action === 'resume'\) \{\n      if \(!existingRecurring\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*ไม่พบเหตุการณ์ประจำ\*\\n\\nไม่มีเหตุการณ์ประจำในวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}`,/,
  `if (action === 'reanudar' || action === 'resume') {
      if (!existingRecurring) {
        const lang = context.lang || 'th';
        return {
          success: false,
          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),`
);

// 9. Replace resume success message
content = content.replace(
  /await recurringEventService\.resume\(existingRecurring\.id\);\n      \n      return \{\n        success: true,\n        message: `✅ \*กลับมาจัดอีกครั้งแล้ว\*\\n\\nวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\} - การจัดอีเวนต์กลับมาทำงานแล้ว`,/,
  `await recurringEventService.resume(existingRecurring.id);
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrenteResumedMessage(recurringEventService.getDayName(dayOfWeek, lang)),`
);

// 10. Replace delete not found message
content = content.replace(
  /if \(action === 'eliminar' \|\| action === 'delete'\) \{\n      if \(!existingRecurring\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*ไม่พบเหตุการณ์ประจำ\*\\n\\nไม่มีเหตุการณ์ประจำในวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}`,/,
  `if (action === 'eliminar' || action === 'delete') {
      if (!existingRecurring) {
        const lang = context.lang || 'th';
        return {
          success: false,
          message: getMsg(context).recurrenteNotFoundMessage(recurringEventService.getDayName(dayOfWeek, lang)),`
);

// 11. Replace delete success message
content = content.replace(
  /await recurringEventService\.delete\(existingRecurring\.id\);\n      \n      return \{\n        success: true,\n        message: `🗑️ \*ลบเหตุการณ์ประจำแล้ว\*\\n\\nวัน\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\} - การจัดทุกสัปดาห์ถูกลบแล้ว`,/,
  `await recurringEventService.delete(existingRecurring.id);
      const lang = context.lang || 'th';
      return {
        success: true,
        message: getMsg(context).recurrenteDeletedMessage(recurringEventService.getDayName(dayOfWeek, lang)),`
);

// 12. Replace invalid time message
content = content.replace(
  /if \(!timeRegex\.test\(timeInput\)\) \{\n        return \{\n          success: false,\n          message: `⚠️ \*เวลาไม่ถูกต้อง\*\\n\\nใช้รูปแบบ HH:MM เช่น 18:00`,/,
  `if (!timeRegex.test(timeInput)) {
        return {
          success: false,
          message: getMsg(context).recurrenteInvalidTimeMessage(),`
);

// 13. Replace created success message
content = content.replace(
  /await recurringEventService\.create\(\{[\s\S]*?\}\);\n      \n      return \{\n        success: true,\n        message: `✅ \*สร้างเหตุการณ์ประจำแล้ว\*\\n\\n📅 ทุก\$\{recurringEventService\.getDayNameThai\(dayOfWeek\)\}\\n⏰ เวลา: \$\{timeInput\}\\n⚽ ประเภท: ฟุตบอล \$\{gameType\} คน\\n\\n💡 ใช้คำสั่ง !recurrente พัก \$\{dayInput\} เพื่อพักการจัดชั่วคราว`,/,
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
        message: getMsg(context).recurrenteCreatedMessage(recurringEventService.getDayName(dayOfWeek, lang), timeInput, gameType),`
);

// 14. Replace invalid action message
content = content.replace(
  /return \{\n      success: false,\n      message: `⚠️ \*การดำเนินการไม่ถูกต้อง\*\\n\\nใช้: เพิ่ม, พัก, ต่อ, ลบ, ดู`,\n    \};/,
  `return {
      success: false,
      message: getMsg(context).recurrenteInvalidActionMessage(),
    };`
);

fs.writeFileSync(file, content);
console.log('Done!');
