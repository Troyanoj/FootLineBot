const fs = require('fs');

// Add positions import to user.handlers.ts
let code = fs.readFileSync('src/lib/line/handlers/user.handlers.ts', 'utf-8');

// Add import after the prisma import line
code = code.replace(
  "import prisma from '@/lib/db/prisma';",
  "import prisma from '@/lib/db/prisma';\nimport { isValidPosition, getPositionName, VALID_POSITIONS } from '@/lib/positions';"
);

// Now add the handlePosicion function before handleUserCommand
const handlePosicion = `
/**
 * Handle !posicion / !position / !ตำแหน่ง command
 * Set up to 3 position preferences for the user
 * 
 * Format (ES): !posicion [pos1] [pos2] [pos3]
 * Format (EN): !position [pos1] [pos2] [pos3]
 * Format (TH): !ตำแหน่ง [pos1] [pos2] [pos3]
 *
 * Example: !posicion GK CB CM
 * Example: !position ST CM
 */
export async function handlePosicion(context: HandlerContext, args: string[]): Promise<HandlerResult> {
  try {
    const lang = (context as any).lang || 'th';

    if (args.length === 0) {
      // Show current positions and valid list
      const user = await getOrCreateUser(context.userId);
      const posLines = VALID_POSITIONS.map(p => \`• \${p} — \${getPositionName(p, lang as any)}\`).join('\\n');

      if (lang === 'es') {
        return {
          success: true,
          message: \`👤 *Tus Posiciones Actuales*

1️⃣ Mejor: \${user.position1 ? getPositionName(user.position1, 'es') + ' (\' + user.position1 + \')\' : '(sin asignar)'}
2️⃣ Segunda: \${user.position2 ? getPositionName(user.position2, 'es') + ' (\' + user.position2 + \')\' : '(sin asignar)'}
3️⃣ Tercera: \${user.position3 ? getPositionName(user.position3, 'es') + ' (\' + user.position3 + \')\' : '(sin asignar)'}

📋 *Posiciones disponibles:*
\${posLines}

💡 *Uso:* !posicion [pos1] [pos2] [pos3]
*Ejemplo:* !posicion GK CB CM\`,
        };
      } else if (lang === 'en') {
        return {
          success: true,
          message: \`👤 *Your Current Positions*

1️⃣ Best: \${user.position1 ? getPositionName(user.position1, 'en') + ' (\' + user.position1 + \')\' : '(not set)'}
2️⃣ Second: \${user.position2 ? getPositionName(user.position2, 'en') + ' (\' + user.position2 + \')\' : '(not set)'}
3️⃣ Third: \${user.position3 ? getPositionName(user.position3, 'en') + ' (\' + user.position3 + \')\' : '(not set)'}

📋 *Available positions:*
\${posLines}

💡 *Usage:* !position [pos1] [pos2] [pos3]
*Example:* !position ST CM RW\`,
        };
      } else {
        return {
          success: true,
          message: \`👤 *ตำแหน่งของคุณ*

1️⃣ ดีที่สุด: \${user.position1 ? getPositionName(user.position1, 'th') + ' (\' + user.position1 + \')\' : '(ยังไม่ตั้ง)'}
2️⃣ รอง: \${user.position2 ? getPositionName(user.position2, 'th') + ' (\' + user.position2 + \')\' : '(ยังไม่ตั้ง)'}
3️⃣ สาม: \${user.position3 ? getPositionName(user.position3, 'th') + ' (\' + user.position3 + \')\' : '(ยังไม่ตั้ง)'}

📋 *ตำแหน่งที่ใช้ได้:*
\${posLines}

💡 *วิธีใช้:* !ตำแหน่ง [pos1] [pos2] [pos3]
*ตัวอย่าง:* !ตำแหน่ง GK CB CM\`,
        };
      }
    }

    // Validate positions
    const rawPositions = args.slice(0, 3).map(p => p.toUpperCase());
    const invalid = rawPositions.filter(p => !isValidPosition(p));

    if (invalid.length > 0) {
      const validList = VALID_POSITIONS.join(', ');
      if (lang === 'es') {
        return { success: false, message: \`⚠️ *Posición inválida:* \${invalid.join(', ')}\\n\\nPosiciones válidas: \${validList}\\n\\nEjemplo: !posicion ST CM GK\` };
      } else if (lang === 'en') {
        return { success: false, message: \`⚠️ *Invalid position:* \${invalid.join(', ')}\\n\\nValid positions: \${validList}\\n\\nExample: !position ST CM GK\` };
      } else {
        return { success: false, message: \`⚠️ *ตำแหน่งไม่ถูกต้อง:* \${invalid.join(', ')}\\n\\nตำแหน่งที่ใช้ได้: \${validList}\` };
      }
    }

    // Get or create user
    const user = await getOrCreateUser(context.userId);

    // Update positions
    const [pos1, pos2, pos3] = rawPositions;
    await userService.update(user.id, {
      position1: pos1 as any,
      position2: pos2 as any || undefined,
      position3: pos3 as any || undefined,
    });

    // Build confirmation message
    const p1Name = getPositionName(pos1, lang as any);
    const p2Name = pos2 ? getPositionName(pos2, lang as any) : null;
    const p3Name = pos3 ? getPositionName(pos3, lang as any) : null;

    if (lang === 'es') {
      return {
        success: true,
        message: \`✅ *¡Perfil Actualizado!*

1️⃣ Mejor posición: \${p1Name} (\${pos1})
2️⃣ Segunda opción: \${p2Name ? p2Name + ' (' + pos2 + ')' : '(sin asignar)'}
3️⃣ Tercera opción: \${p3Name ? p3Name + ' (' + pos3 + ')' : '(sin asignar)'}

⚽ El bot usará estas posiciones para armarte el equipo. Tu posición principal siempre se prioriza. Si ya está ocupada, usará la segunda, y así sucesivamente.\`,
      };
    } else if (lang === 'en') {
      return {
        success: true,
        message: \`✅ *Profile Updated!*

1️⃣ Best position: \${p1Name} (\${pos1})
2️⃣ Second choice: \${p2Name ? p2Name + ' (' + pos2 + ')' : '(not set)'}
3️⃣ Third choice: \${p3Name ? p3Name + ' (' + pos3 + ')' : '(not set)'}

⚽ The bot will use these positions when building your team. Your primary position is always prioritized. If taken, it falls back to your 2nd, then 3rd choice.\`,
      };
    } else {
      return {
        success: true,
        message: \`✅ *อัปเดตโปรไฟล์แล้ว!*

1️⃣ ตำแหน่งหลัก: \${p1Name} (\${pos1})
2️⃣ ตำแหน่งรอง: \${p2Name ? p2Name + ' (' + pos2 + ')' : '(ยังไม่ตั้ง)'}
3️⃣ ตำแหน่งสาม: \${p3Name ? p3Name + ' (' + pos3 + ')' : '(ยังไม่ตั้ง)'}

⚽ บอทจะใช้ตำแหน่งเหล่านี้ในการจัดทีม โดยจัดให้ตำแหน่งที่ 1 ก่อน ถ้าไม่ว่างจะใช้ตำแหน่งที่ 2 และ 3 ตามลำดับ\`,
      };
    }

  } catch (error) {
    console.error('Error in handlePosicion:', error);
    return { success: false, message: getMsg(context).errorMessage() };
  }
}
`;

// Insert before the dispatcher
code = code.replace(
  '/**\n * Main user command dispatcher\n */',
  handlePosicion + '\n/**\n * Main user command dispatcher\n */'
);

// Add cases to the dispatcher switch
code = code.replace(
  "    case 'join':\n      return handleUnirse(context, args[0]);",
  "    case 'join':\n      return handleUnirse(context, args[0]);\n    \n    case 'posicion':\n    case 'position':\n    case 'ตำแหน่ง':\n      return handlePosicion(context, args);"
);

fs.writeFileSync('src/lib/line/handlers/user.handlers.ts', code);
console.log('✅ handlePosicion added to user.handlers.ts');
