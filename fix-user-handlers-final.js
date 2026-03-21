const fs = require('fs');
const path = 'src/lib/line/handlers/user.handlers.ts';
let code = fs.readFileSync(path, 'utf-8');

const handlePosicionCode = `
/**
 * Handle !posicion / !position / !ตำแหน่ง command
 * Set user's preferred positions
 */
export async function handlePosicion(context, args) {
  try {
    const user = await getOrCreateUser(context.userId);
    const lang = context.lang || 'th';
    const msg = getMsg(context);

    // If no arguments, show current positions and help
    if (args.length === 0) {
      const pos1Value = user.position1;
      const pos2Value = user.position2 || '';
      const pos3Value = user.position3 || '';

      const pos1Name = getPositionName(pos1Value, lang);
      const pos2Name = pos2Value ? getPositionName(pos2Value, lang) : (lang === 'es' ? 'Ninguna' : (lang === 'en' ? 'None' : 'ไม่ได้ตั้ง'));
      const pos3Name = pos3Value ? getPositionName(pos3Value, lang) : (lang === 'es' ? 'Ninguna' : (lang === 'en' ? 'None' : 'ไม่ได้ตั้ง'));

      let response = '';
      if (lang === 'es') {
        response = "👤 *Tus Posiciones actuales:*\\n1. " + pos1Name + "\\n2. " + pos2Name + "\\n3. " + pos3Name + "\\n\\n";
        response += "💡 *Cómo cambiar cada una:*\\nUsa: !posicion [Pos1] [Pos2] [Pos3]\\nEjemplo: !posicion ST CM GK\\n\\n";
        response += "✅ *Valores válidos:*\\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF";
      } else if (lang === 'en') {
        response = "👤 *Your current positions:*\\n1. " + pos1Name + "\\n2. " + pos2Name + "\\n3. " + pos3Name + "\\n\\n";
        response += "💡 *How to change:*\\nUse: !position [Pos1] [Pos2] [Pos3]\\nExample: !position ST CM GK\\n\\n";
        response += "✅ *Valid values:*\\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF";
      } else {
        response = "👤 *ตำแหน่งปัจจุบันของคุณ:*\\n1. " + pos1Name + "\\n2. " + pos2Name + "\\n3. " + pos3Name + "\\n\\n";
        response += "💡 *วิธีเปลี่ยนตำแหน่ง:*\\nใช้: !ตำแหน่ง [ตำแหน่ง1] [ตำแหน่ง2] [ตำแหน่ง3]\\nตัวอย่าง: !ตำแหน่ง ST CM GK\\n\\n";
        response += "✅ *ค่าที่ใช้ได้:*\\nGK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF";
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
      successMsg = "✅ *¡Posiciones actualizadas!*\\n\\n1. " + p1 + (p2 ? "\\n2. " + p2 : "") + (p3 ? "\\n3. " + p3 : "") + "\\n\\nEl bot las usará en el próximo !generar.";
    } else if (lang === 'en') {
      successMsg = "✅ *Positions updated!*\\n\\n1. " + p1 + (p2 ? "\\n2. " + p2 : "") + (p3 ? "\\n3. " + p3 : "") + "\\n\\nThe bot will use these for the next !generate.";
    } else {
      successMsg = "✅ *อัปเดตตำแหน่งเรียบร้อย!*\\n\\n1. " + p1 + (p2 ? "\\n2. " + p2 : "") + (p3 ? "\\n3. " + p3 : "") + "\\n\\nบอทจะใช้ข้อมูลนี้ในการ !จัดทีม ครั้งถัดไป";
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

// Just append the function at the very end
fs.appendFileSync(path, handlePosicionCode);

// Now fix the dispatcher cases
code = fs.readFileSync(path, 'utf-8');
code = code.replace(/case 'register':/g, "case 'register':\\n    case 'ลงทะเบียน':");
code = code.replace(/case 'help':/g, "case 'help':\\n    case 'ช่วย':");

fs.writeFileSync(path, code);
console.log('Fixed handlers file by appending.');
