const fs = require('fs');
let code = fs.readFileSync('src/lib/line/handlers/user.handlers.ts', 'utf-8');

const handlePosicionCode = `/**
 * Handle !posicion / !position / !ตำแหน่ง command
 * Set user's preferred positions
 */
export async function handlePosicion(context: HandlerContext, args: string[]): Promise<HandlerResult> {
  try {
    const user = await getOrCreateUser(context.userId);
    const lang = context.lang || 'th';

    // If no arguments, show current positions and help
    if (args.length === 0) {
      const pos1Value = user.position1;
      const pos2Value = user.position2 || '';
      const pos3Value = user.position3 || '';

      const pos1Name = getPositionName(pos1Value as any, lang as any);
      const pos2Name = pos2Value ? getPositionName(pos2Value as any, lang as any) : (lang === 'es' ? 'Ninguna' : (lang === 'en' ? 'None' : 'ไม่ได้ตั้ง'));
      const pos3Name = pos3Value ? getPositionName(pos3Value as any, lang as any) : (lang === 'es' ? 'Ninguna' : (lang === 'en' ? 'None' : 'ไม่ได้ตั้ง'));

      let response = '';
      if (lang === 'es') {
        response = \`👤 *Tus Posiciones actuales:*\\n1. \${pos1Name}\\n2. \${pos2Name}\\n3. \${pos3Name}\\n\\n\`;
        response += \`💡 *Cómo cambiar cada una:*\\nUsa: !posicion [Pos1] [Pos2] [Pos3]\\nEjemplo: !posicion ST CM GK\\n\\n\`;
        response += \`✅ *Valores válidos:*\\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF\`;
      } else if (lang === 'en') {
        response = \`👤 *Your current positions:*\\n1. \${pos1Name}\\n2. \${pos2Name}\\n3. \${pos3Name}\\n\\n\`;
        response += \`💡 *How to change:*\\nUse: !position [Pos1] [Pos2] [Pos3]\\nExample: !position ST CM GK\\n\\n\`;
        response += \`✅ *Valid values:*\\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF\`;
      } else {
        response = \`👤 *ตำแหน่งปัจจุบันของคุณ:*\\n1. \${pos1Name}\\n2. \${pos2Name}\\n3. \${pos3Name}\\n\\n\`;
        response += \`💡 *วิธีเปลี่ยนตำแหน่ง:*\\nใช้: !ตำแหน่ง [ตำแหน่ง1] [ตำแหน่ง2] [ตำแหน่ง3]\\nตัวอย่าง: !ตำแหน่ง ST CM GK\\n\\n\`;
        response += \`✅ *ค่าที่ใช้ได้:*\\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF\`;
      }

      return { success: true, message: response };
    }

    // Validate and update positions
    const newPositions = [];
    for (const arg of args.slice(0, 3)) {
      const upperPos = arg.toUpperCase();
      if (isValidPosition(upperPos)) {
        newPositions.push(upperPos);
      }
    }

    if (newPositions.length === 0) {
      return {
        success: false,
        message: lang === 'es' 
          ? '⚠️ Debes especificar al menos una posición válida (ej: !posicion ST)' 
          : (lang === 'en' ? '⚠️ You must specify at least one valid position (e.g., !position ST)' : '⚠️ คุณต้องระบุอย่างน้อยหนึ่งตำแหน่งที่ถูกต้อง (เช่น !ตำแหน่ง ST)'),
      };
    }

    // Update user in DB
    await userService.update(user.id, {
      position1: newPositions[0],
      position2: newPositions[1] || null,
      position3: newPositions[2] || null,
    });

    // Success response
    const p1 = getPositionName(newPositions[0], lang);
    const p2 = newPositions[1] ? getPositionName(newPositions[1], lang) : '';
    const p3 = newPositions[2] ? getPositionName(newPositions[2], lang) : '';

    let successMsg = '';
    if (lang === 'es') {
      successMsg = \`✅ *¡Posiciones actualizadas!*\\n\\n1. \${p1}\${p2 ? \`\\n2. \${p2}\` : ''}\${p3 ? \`\\n3. \${p3}\` : ''}\\n\\nEl bot las usará en el próximo !generar.\`;
    } else if (lang === 'en') {
      successMsg = \`✅ *Positions updated!*\\n\\n1. \${p1}\${p2 ? \`\\n2. \${p2}\` : ''}\${p3 ? \`\\n3. \${p3}\` : ''}\\n\\nThe bot will use these for the next !generate.\`;
    } else {
      successMsg = \`✅ *อัปเดตตำแหน่งเรียบร้อย!*\\n\\n1. \${p1}\${p2 ? \`\\n2. \${p2}\` : ''}\${p3 ? \`\\n3. \${p3}\` : ''}\\n\\nบอทจะใช้ข้อมูลนี้ในการ !จัดทีม ครั้งถัดไป\`;
    }

    return { success: true, message: successMsg };
  } catch (error) {
    console.error('Error in handlePosicion:', error);
    return {
      success: false,
      message: getMsg(context).errorMessage(),
    };
  }
}
`;

const newDispatcher = `/**
 * Main user command dispatcher
 */
export async function handleUserCommand(
  command: string,
  args: string[],
  context: HandlerContext
): Promise<HandlerResult> {
  const normalizedCommand = command.toLowerCase().replace(/^!/, '');
  
  switch (normalizedCommand) {
    case 'apuntar':
    case 'inscribirme':
    case 'register':
    case 'ลงทะเบียน':
      return handleApuntar(context);
    
    case 'baja':
    case 'desinscribirme':
    case 'unregister':
    case 'ยกเลิก':
      return handleBaja(context);
    
    case 'perfil':
    case 'profile':
    case 'โปรไฟล์':
      return handlePerfil(context);
    
    case 'alineacion':
    case 'lineup':
    case 'รายชื่อ':
      return handleAlineacion(context);
    
    case 'horario':
    case 'schedule':
    case 'อีเวนต์':
      return handleHorario(context);
    
    case 'grupos':
    case 'groups_list':
    case 'กลุ่ม':
      return handleGrupos(context);
    
    case 'unirse':
    case 'join':
      return handleUnirse(context, args[0]);
    
    case 'posicion':
    case 'position':
    case 'ตำแหน่ง':
      return handlePosicion(context, args);
    
    case 'ayuda':
    case 'help':
    case 'ช่วย':
      return handleAyuda(context);
    
    case 'start':
      return handleStart(context);
    
    default:
      return {
        success: false,
        message: getMsg(context).invalidCommandMessage(),
      };
  }
}
`;

// Replace dispatcher
code = code.replace(/export async function handleUserCommand[\\s\\S]+$/, newDispatcher);

// Insert handlePosicion before handleUserCommand
code = code.replace('/**\n * Main user command dispatcher\n */', handlePosicionCode + '\n/**\n * Main user command dispatcher\n */');

fs.writeFileSync('src/lib/line/handlers/user.handlers.ts', code);
console.log('User handlers fixed.');
