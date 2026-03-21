const fs = require('fs');

for (const file of ['src/lib/line/handlers/admin.handlers.ts', 'src/lib/line/handlers/user.handlers.ts']) {
  let code = fs.readFileSync(file, 'utf-8');

  // We need: all imports first, then const getMsg, then the rest
  // Strategy: extract the import type line, remove it from current position,
  // then move it before const getMsg.

  const isAdmin = file.includes('admin');

  // Remove the clean import block we inserted + rogue \n inserted
  // and rebuild the top 18 lines entirely
  const serviceImportsAdmin = `import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import { eventService } from '@/services/event.service';
import { registrationService } from '@/services/registration.service';
import { lineupService } from '@/services/lineup.service';
import { recurringEventService } from '@/services/recurring-event.service';`;

  const serviceImportsUser = `import { replyMessage, pushMessage, getUserProfile } from '@/lib/line/client';
import { userService } from '@/services/user.service';
import { groupService } from '@/services/group.service';
import { eventService } from '@/services/event.service';
import { registrationService } from '@/services/registration.service';
import { lineupService } from '@/services/lineup.service';`;

  const importTypeAdmin = `import type { User, Group, Event, GameType, CreateEventInput, UpdateEventInput } from '@/types';`;
  const importTypeUser = `import type { User, Group, Event, Position } from '@/types';
import prisma from '@/lib/db/prisma';`;

  const msgImports = `import * as msgTh from '@/lib/line/messages';
import * as msgEs from '@/lib/line/messages.es';
import * as msgEn from '@/lib/line/messages.en';`;

  const getMsgFn = `
const getMsg = (context: any) =>
  context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);`;

  // Strip all import lines and const getMsg from top
  // Find where the interface starts
  const ifaceMarker = isAdmin ? '// Context passed to all handlers' : '// Context passed to all handlers';
  const ifaceIdx = code.indexOf(ifaceMarker);
  if (ifaceIdx === -1) { console.error('Could not find interface marker in', file); process.exit(1); }

  const restOfFile = code.slice(ifaceIdx);

  const serviceImports = isAdmin ? serviceImportsAdmin : serviceImportsUser;
  const importType = isAdmin ? importTypeAdmin : importTypeUser;

  const newTop = `// ${isAdmin ? 'Admin' : 'User'} Command Handlers\r\n// Handles all ${isAdmin ? 'admin' : 'user'}-facing commands for LINE bot\r\n\r\n${serviceImports}\r\n${msgImports}\r\n${importType}\r\n${getMsgFn}\r\n\r\n`;

  fs.writeFileSync(file, newTop + restOfFile);
  console.log('✅', file, 'header rebuilt');
}
