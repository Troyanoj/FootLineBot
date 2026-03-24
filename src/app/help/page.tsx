'use client';

import { useState, useEffect, Suspense } from 'react';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';

// ============================================================
// DATA
// ============================================================
const LANGS = ['en', 'es', 'th'] as const;
type Lang = (typeof LANGS)[number];

const UI: Record<Lang, { flag: string; name: string; hero: string; subtitle: string; playerTab: string; adminTab: string; tutorialTab: string; cmdTip: string; tipText: string }> = {
  en: {
    flag: '🇬🇧',
    name: 'English',
    hero: 'FootLine Bot',
    subtitle: 'Your intelligent football group manager on LINE',
    playerTab: '🏃 Players',
    adminTab: '👑 Admins',
    tutorialTab: '📖 Tutorial',
    cmdTip: 'Commands',
    tipText: 'Type the command in your LINE chat. Start every command with ! or /',
  },
  es: {
    flag: '🇪🇸',
    name: 'Español',
    hero: 'FootLine Bot',
    subtitle: 'Tu asistente inteligente de fútbol en LINE',
    playerTab: '🏃 Jugadores',
    adminTab: '👑 Administradores',
    tutorialTab: '📖 Tutorial',
    cmdTip: 'Comandos',
    tipText: 'Escribe el comando en tu chat de LINE. Todos los comandos comienzan con ! o /',
  },
  th: {
    flag: '🇹🇭',
    name: 'ภาษาไทย',
    hero: 'FootLine Bot',
    subtitle: 'ผู้ช่วยจัดการกลุ่มฟุตบอลอัจฉริยะบน LINE',
    playerTab: '🏃 ผู้เล่น',
    adminTab: '👑 แอดมิน',
    tutorialTab: '📖 วิธีใช้',
    cmdTip: 'คำสั่ง',
    tipText: 'พิมพ์คำสั่งในแชท LINE โดยทุกคำสั่งเริ่มต้นด้วย ! หรือ /',
  },
};

type Cmd = { cmd: string; desc: string; example?: string };
type Section = { title: string; cmds: Cmd[] };

// ============================================================
// TUTORIALS
// ============================================================
const TUTORIALS: Record<Lang, { player: { title: string; steps: { title: string; desc: string }[] }; admin: { title: string; steps: { title: string; desc: string }[] } }> = {
  en: {
    player: {
      title: 'How to Use FootLine as a Player',
      steps: [
        { title: '1. Join a Group', desc: 'Ask your group admin for the group ID and use !join [id] to join the football group.' },
        { title: '2. Set Your Position', desc: 'Use !posicion [pos1] [pos2] [pos3] to set your preferred positions. Example: !posicion ST CM GK' },
        { title: '3. Register for Matches', desc: 'When an event is open, use !register to sign up. You\'ll be notified when the admin closes registration.' },
        { title: '4. Check Your Team', desc: 'After the admin generates teams with !generar, use !alineacion to see which team you\'re on and your position.' },
        { title: '5. View Schedule', desc: 'Use !schedule to see all upcoming matches in your group.' },
        { title: '6. Update Profile', desc: 'Use !profile to view your stats, rating, and position preferences.' },
        { title: '7. Cancel Registration', desc: 'If you can\'t make it, use !unregister to remove yourself before the admin closes registration.' },
      ],
    },
    admin: {
      title: 'How to Manage Your Football Group',
      steps: [
        { title: '1. Setup Your Group', desc: 'Add FootLine Bot to your LINE group, then type !setup to register the group and become the admin.' },
        { title: '2. Configure Game Type', desc: 'Use !configurar [5|7|11] to set the default format (5-a-side, 7-a-side, or 11-a-side).' },
        { title: '3. Create an Event', desc: 'Use !create_event [date] [time] [duration] [min_players] [teams]. Example: !create_event 2024-04-20 19:00 90 14 2' },
        { title: '4. Let Players Register', desc: 'Players use !register to sign up. Wait for enough players to join.' },
        { title: '5. Generate Teams', desc: 'When ready, use !generar to automatically create balanced teams based on player ratings.' },
        { title: '6. Close Registration', desc: 'Use !close to prevent new players from registering.' },
        { title: '7. View Lineup', desc: 'Use !lineup to see the final team assignments.' },
        { title: '8. Delete Event', desc: 'Use !delete_event [id] to remove an event if needed.' },
        { title: '9. Set Up Recurring Events', desc: 'Use !recurring add [day] [time] to create weekly automatic events. Example: !recurring add Wednesday 19:00' },
        { title: '10. Manage Tactics', desc: 'Use !tactica agregar [formation] to add formations. Example: !tactica agregar 3-2-1' },
        { title: '11. Remove Players', desc: 'Use !kick [userId] to remove a member from the group.' },
        { title: '12. Delete Group', desc: 'Use !delete_group to delete the group and all its data (use with caution).' },
      ],
    },
  },
  es: {
    player: {
      title: 'Cómo Usar FootLine como Jugador',
      steps: [
        { title: '1. Únete a un Grupo', desc: 'Pide al administrador el ID del grupo y usa !unirse [id] para unirte al grupo de fútbol.' },
        { title: '2. Configura Tu Posición', desc: 'Usa !posicion [pos1] [pos2] [pos3] para establecer tus posiciones preferidas. Ejemplo: !posicion ST CM GK' },
        { title: '3. Apúntate a los Partidos', desc: 'Cuando hay un evento abierto, usa !apuntar para registrarte. Te notifyarán cuando el admin cierre la inscripción.' },
        { title: '4. Consulta Tu Equipo', desc: 'Después de que el admin genere los equipos con !generar, usa !alineacion para ver en qué equipo estás y tu posición.' },
        { title: '5. Ver el Horario', desc: 'Usa !horario para ver todos los próximos partidos de tu grupo.' },
        { title: '6. Actualizar Perfil', desc: 'Usa !perfil para ver tus estadísticas, nivel y preferencias de posición.' },
        { title: '7. Cancelar Inscripción', desc: 'Si no puedes asistir, usa !baja para darte de baja antes de que el admin cierre la inscripción.' },
      ],
    },
    admin: {
      title: 'Cómo Gestionar Tu Grupo de Fútbol',
      steps: [
        { title: '1. Configura Tu Grupo', desc: 'Añade FootLine Bot a tu grupo de LINE, luego escribe !iniciar para registrar el grupo y convertirte en administrador.' },
        { title: '2. Configura el Tipo de Juego', desc: 'Usa !configurar [5|7|11] para establecer el formato (5, 7 u 11 jugadores).' },
        { title: '3. Crear un Evento', desc: 'Usa !crear_evento [fecha] [hora] [duracion] [min_jugadores] [equipos] [max_jugadores]. Ejemplo: !crear_evento 2024-04-20 19:00 90 8 2 14' },
        { title: '4. Permite que los Jugadores se Apunten', desc: 'Los jugadores usan !apuntar para registrarse. Espera a que se unan suficientes jugadores.' },
        { title: '5. Generar Equipos', desc: 'Cuando esté listo, usa !generar para crear equipos balanceados automáticamente según el nivel de los jugadores.' },
        { title: '6. Cerrar Inscripción', desc: 'Usa !cerrar para evitar que nuevos jugadores se registren.' },
        { title: '7. Ver Alineación', desc: 'Usa !alineacion para ver la asignación final de equipos.' },
        { title: '8. Eliminar Evento', desc: 'Usa !borrar_evento [id] para eliminar un evento si es necesario.' },
        { title: '9. Configurar Eventos Recurrentes', desc: 'Usa !recurrente agregar [día] [hora] [duración] [min] [equipos] [max] para eventos automáticos. Ejemplo: !recurrente agregar Jueves 19:00 120 8 3 9' },
        { title: '10. Gestionar Tácticas', desc: 'Usa !tactica agregar [formación] para añadir formaciones. Ejemplo: !tactica agregar 3-2-1' },
        { title: '11. Expulsar Jugadores', desc: 'Usa !expulsar [userId] para eliminar a un miembro del grupo.' },
        { title: '12. Eliminar Grupo', desc: 'Usa !borrar_grupo para eliminar el grupo y todos sus datos (usa con precaución).' },
      ],
    },
  },
  th: {
    player: {
      title: 'วิธีใช้ FootLine สำหรับผู้เล่น',
      steps: [
        { title: '1. เข้าร่วมกลุ่ม', desc: 'ขอ ID กลุ่มจากแอดมินแล้วใช้ !join [id] เพื่อเข้าร่วมกลุ่มฟุตบอล' },
        { title: '2. ตั้งค่าตำแหน่ง', desc: 'ใช้ !position [pos1] [pos2] [pos3] เพื่อตั้งค่าตำแหน่งที่ชอบ ตัวอย่าง: !position ST CM GK' },
        { title: '3. ลงทะเบียนเข้าร่วม', desc: 'เมื่อมีอีเวนต์เปิดอยู่ ใช้ !ลงทะเบียน เพื่อสมัคร คุณจะได้รับแจ้งเมื่อแอดมินปิดการลงทะเบียน' },
        { title: '4. ดูรายชื่อทีม', desc: 'หลังจากแอดมินใช้ !generate แล้ว ใช้ !lineup เพื่อดูว่าคุณอยู่ทีมไหนและตำแหน่งอะไร' },
        { title: '5. ดูตารางอีเวนต์', desc: 'ใช้ !อีเวนต์ เพื่อดูอีเวนต์ที่กำลังจะมาถึงทั้งหมดในกลุ่ม' },
        { title: '6. ดูโปรไฟล์', desc: 'ใช้ !โปรไฟล์ เพื่อดูสถิติ ระดับ และความชอบตำแหน่ง' },
        { title: '7. ยกเลิกการลงทะเบียน', desc: 'หากไม่สามารถเข้าร่วมได้ ใช้ !ยกเลิก เพื่อถอนการลงทะเบียนก่อนที่แอดมินจะปิด' },
      ],
    },
    admin: {
      title: 'วิธีจัดการกลุ่มฟุตบอล',
      steps: [
        { title: '1. ตั้งค่ากลุ่ม', desc: 'เพิ่ม FootLine Bot เข้ากลุ่ม LINE ของคุณ แล้วพิมพ์ !เริ่มต้น เพื่อลงทะเบียนกลุ่มและเป็นแอดมิน' },
        { title: '2. ตั้งค่าประเภทเกม', desc: 'ใช้ !ตั้งค่า [5|7|11] เพื่อตั้งค่ารูปแบบเกม (5, 7 หรือ 11 คน)' },
        { title: '3. สร้างอีเวนต์', desc: 'ใช้ !สร้าง [วันที่] [เวลา] [ระยะ] [นาที] [ทีม] [สูงสุด] ตัวอย่าง: !สร้าง 2024-04-20 19:00 90 8 2 14' },
        { title: '4. ให้ผู้เล่นลงทะเบียน', desc: 'ผู้เล่นใช้ !ลงทะเบียน เพื่อสมัคร รอจนมีผู้เล่นเพียงพอ' },
        { title: '5. จัดทีม', desc: 'เมื่อพร้อม ใช้ !จัดทีม เพื่อสร้างทีมอัตโนมัติตามระดับผู้เล่น' },
        { title: '6. ปิดการลงทะเบียน', desc: 'ใช้ !ปิด เพื่อห้ามผู้เล่นใหม่ลงทะเบียน' },
        { title: '7. ดูรายชื่อทีม', desc: 'ใช้ !รายชื่อ เพื่อดูการจัดทีมสุดท้าย' },
        { title: '8. ลบอีเวนต์', desc: 'ใช้ !ลบ [id] เพื่อลบอีเวนต์หากจำเป็น' },
        { title: '9. ตั้งค่าอีเวนต์ประจำ', desc: 'ใช้ !recurrente เพิ่ม [วัน] [เวลา] [ระยะ] [นาที] [ทีม] [สูงสุด] ตัวอย่าง: !recurrente เพิ่ม พุธ 19:00 120 8 3 9' },
        { title: '10. จัดการกลยุทธ์', desc: 'ใช้ !กลยุทธ์ เพิ่ม [formation] เพื่อเพิ่มการจัดทีม ตัวอย่าง: !กลยุทธ์ เพิ่ม 3-2-1' },
        { title: '11. ลบผู้เล่น', desc: 'ใช้ !kick [userId] เพื่อลบสมาชิกออกจากกลุ่ม' },
        { title: '12. ลบกลุ่ม', desc: 'ใช้ !ลบกลุ่ม เพื่อลบกลุ่มและข้อมูลทั้งหมด (ใช้ด้วยความระมัดระวัง)' },
      ],
    },
  },
};

// ============================================================
// COMMANDS
// ============================================================
const PLAYER_CMDS: Record<Lang, Section[]> = {
  en: [
    {
      title: 'Getting Started',
      cmds: [
        { cmd: '!start', desc: 'Start the bot and get a welcome message with setup instructions.', example: '!start' },
        { cmd: '!help', desc: 'Show this help message with all available commands.', example: '!help' },
      ],
    },
    {
      title: 'Events',
      cmds: [
        { cmd: '!register', desc: 'Sign up for the current open match.', example: '!register' },
        { cmd: '!unregister', desc: "Cancel your spot if you can't make it.", example: '!unregister' },
        { cmd: '!lineup', desc: "See the team assignments once the admin has generated them.", example: '!lineup' },
        { cmd: '!schedule', desc: 'View all upcoming matches.', example: '!schedule' },
      ],
    },
    {
      title: 'Profile & Groups',
      cmds: [
        { cmd: '!profile', desc: 'View your profile: position, rating, and stats.', example: '!profile' },
        { cmd: '!posicion / !position [pos1] [pos2] [pos3]', desc: 'Set up to 3 preferred positions in priority order. Values: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST, CF.', example: '!posicion ST CM GK' },
        { cmd: '!groups_list', desc: 'List all groups you belong to.', example: '!groups_list' },
        { cmd: '!join [id]', desc: 'Join a group using its ID.', example: '!join abc12345' },
      ],
    },
  ],
  es: [
    {
      title: 'Primeros Pasos',
      cmds: [
        { cmd: '!start', desc: 'Inicia el bot y recibe un mensaje de bienvenida con instrucciones.', example: '!start' },
        { cmd: '!ayuda', desc: 'Muestra este mensaje de ayuda con todos los comandos disponibles.', example: '!ayuda' },
      ],
    },
    {
      title: 'Partidos',
      cmds: [
        { cmd: '!apuntar / !register', desc: 'Anótate al partido que está abierto actualmente.', example: '!apuntar' },
        { cmd: '!baja / !unregister', desc: 'Cancela tu lugar si no puedes asistir.', example: '!baja' },
        { cmd: '!alineacion / !lineup', desc: 'Consulta a qué equipo te asignó el bot.', example: '!alineacion' },
        { cmd: '!horario / !schedule', desc: 'Mira los próximos partidos agendados.', example: '!horario' },
      ],
    },
    {
      title: 'Perfil y Grupos',
      cmds: [
        { cmd: '!perfil / !profile', desc: 'Consulta tu posición favorita, tu nivel y estadísticas.', example: '!perfil' },
        { cmd: '!posicion [pos1] [pos2] [pos3]', desc: 'Configura 3 posiciones preferidas en orden de prioridad. Valores: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST, CF.', example: '!posicion ST CM GK' },
        { cmd: '!grupos / !groups_list', desc: 'Lista los grupos a los que perteneces.', example: '!grupos' },
        { cmd: '!unirse [id] / !join [id]', desc: 'Únete a un grupo usando su ID.', example: '!unirse abc12345' },
      ],
    },
  ],
  th: [
    {
      title: 'เริ่มต้นใช้งาน',
      cmds: [
        { cmd: '!start', desc: 'เริ่มต้นบอทและรับข้อความต้อนรับ', example: '!start' },
        { cmd: '!ช่วย / !help', desc: 'แสดงข้อความช่วยเหลือนี้', example: '!ช่วย' },
      ],
    },
    {
      title: 'อีเวนต์',
      cmds: [
        { cmd: '!ลงทะเบียน / !register', desc: 'ลงทะเบียนเข้าร่วมอีเวนต์ที่เปิดอยู่', example: '!register' },
        { cmd: '!ยกเลิก / !unregister', desc: 'ยกเลิกการลงทะเบียน', example: '!unregister' },
        { cmd: '!รายชื่อ / !lineup', desc: 'ดูรายชื่อทีมที่แอดมินจัดแล้ว', example: '!lineup' },
        { cmd: '!อีเวนต์ / !schedule', desc: 'ดูรายการอีเวนต์ที่กำลังจะมาถึง', example: '!schedule' },
      ],
    },
    {
      title: 'โปรไฟล์และกลุ่ม',
      cmds: [
        { cmd: '!โปรไฟล์ / !profile', desc: 'ดูตำแหน่งที่ชอบ ระดับ และสถิติ', example: '!profile' },
        { cmd: '!position / !ตำแหน่ง [pos1] [pos2] [pos3]', desc: 'ตั้งค่า 3 ตำแหน่งตามความถนัด. ค่า: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST, CF.', example: '!position ST CM GK' },
        { cmd: '!กลุ่ม / !groups_list', desc: 'ดูรายการกลุ่มที่คุณเข้าร่วม', example: '!groups_list' },
        { cmd: '!join [id]', desc: 'เข้าร่วมกลุ่มด้วย ID', example: '!join abc12345' },
      ],
    },
  ],
};

const ADMIN_CMDS: Record<Lang, Section[]> = {
  en: [
    {
      title: 'Initial Setup',
      cmds: [
        { cmd: '!setup / !iniciar', desc: 'Register your current LINE group and set yourself as admin.', example: '!setup' },
      ],
    },
    {
      title: 'Match Management',
      cmds: [
        { cmd: '!create_event [date] [time] [dur] [min] [teams] [max]', desc: 'Create a new match event.', example: '!create_event 2024-04-20 19:00 90 8 2 14' },
        { cmd: '!generate / !generar', desc: 'Automatically generate balanced teams based on player ratings.', example: '!generate' },
        { cmd: '!close / !cerrar', desc: 'Close registrations. No new sign-ups after this.', example: '!close' },
        { cmd: '!delete_event [id] / !borrar_evento [id]', desc: 'Permanently delete an event by its ID.', example: '!delete_event abc12345' },
      ],
    },
    {
      title: 'Group Settings',
      cmds: [
        { cmd: '!config [5|7|11] / !configurar [5|7|11]', desc: 'Set the default game type for your group.', example: '!config 7' },
        { cmd: '!tactics add [formation] / !tactica agregar [formación]', desc: 'Add a formation to your group tactics library.', example: '!tactics add 3-2-1' },
        { cmd: '!tactics remove [formation] / !tactica quitar [formación]', desc: 'Remove a formation from the library.', example: '!tactics remove 3-2-1' },
        { cmd: '!kick [userId] / !expulsar [userId]', desc: 'Remove a member from the group.', example: '!kick U123...' },
      ],
    },
    {
      title: 'Recurring Events',
      cmds: [
        { cmd: '!recurring add [Day] [Time] [dur] [min] [teams] [max]', desc: 'Create a weekly match that auto-generates 3 days before.', example: '!recurring add Wednesday 19:00 120 8 3 9' },
        { cmd: '!recurring pause [Day] / !recurrente pausar [Día]', desc: 'Temporarily pause the weekly event.', example: '!recurring pause Wednesday' },
        { cmd: '!recurring resume [Day] / !recurrente reanudar [Día]', desc: 'Resume a paused weekly event.', example: '!recurring resume Wednesday' },
        { cmd: '!recurring list / !recurrente listar', desc: 'Show all configured weekly events.', example: '!recurring list' },
      ],
    },
    {
      title: 'Group Management',
      cmds: [
        { cmd: '!delete_group / !borrar_grupo / !ลบกลุ่ม', desc: 'Delete the group and all its data (use with caution!).', example: '!delete_group' },
      ],
    },
  ],
  es: [
    {
      title: 'Configuración Inicial',
      cmds: [
        { cmd: '!iniciar / !setup', desc: 'Registra el grupo actual de LINE y te asigna como administrador.', example: '!iniciar' },
      ],
    },
    {
      title: 'Gestión de Partidos',
      cmds: [
        { cmd: '!crear_evento [fecha] [hora] [dur] [min] [equipos] [max]', desc: 'Crea un nuevo partido con todos sus parámetros.', example: '!crear_evento 2024-04-20 19:00 90 8 2 14' },
        { cmd: '!generar / !generate', desc: 'Genera los equipos balanceados automáticamente según el rating de los jugadores.', example: '!generar' },
        { cmd: 'cerrar / !close', desc: 'Cierra las inscripciones. Nadie más podrá apuntarse luego.', example: '!cerrar' },
        { cmd: '!borrar_evento [id] / !delete_event [id]', desc: 'Elimina permanentemente un evento por su ID.', example: '!borrar_evento abc12345' },
      ],
    },
    {
      title: 'Configuración del Grupo',
      cmds: [
        { cmd: '!configurar [5|7|11] / !config [5|7|11]', desc: 'Define el tipo de juego predeterminado del grupo.', example: '!configurar 7' },
        { cmd: '!tactica agregar [formación] / !tactics add [formation]', desc: 'Agrega una formación a la biblioteca de tácticas del grupo.', example: '!tactica agregar 3-2-1' },
        { cmd: '!tactica quitar [formación] / !tactics remove [formation]', desc: 'Quita una formación de la biblioteca.', example: '!tactica quitar 3-2-1' },
        { cmd: '!expulsar [userId] / !kick [userId]', desc: 'Elimina a un miembro del grupo.', example: '!expulsar U123...' },
      ],
    },
    {
      title: 'Eventos Recurrentes',
      cmds: [
        { cmd: '!recurrente agregar [Día] [Hora] [dur] [min] [equipos] [max]', desc: 'Crea un partido semanal que se genera 3 días antes.', example: '!recurrente agregar Jueves 19:00 120 8 3 9' },
        { cmd: '!recurrente pausar [Día] / !recurring pause [Day]', desc: 'Pausa el evento semanal temporalmente.', example: '!recurrente pausar Jueves' },
        { cmd: '!recurrente reanudar [Día] / !recurring resume [Day]', desc: 'Reanuda el evento semanal pausado.', example: '!recurrente reanudar Jueves' },
        { cmd: '!recurrente listar / !recurring list', desc: 'Muestra todos los eventos semanales configurados.', example: '!recurrente listar' },
      ],
    },
    {
      title: 'Gestión del Grupo',
      cmds: [
        { cmd: '!borrar_grupo / !delete_group / !ลบกลุ่ม', desc: 'Elimina el grupo y todos sus datos (¡usa con precaución!).', example: '!borrar_grupo' },
      ],
    },
  ],
  th: [
    {
      title: 'การเริ่มต้นใช้งาน',
      cmds: [
        { cmd: '!เริ่มต้น / !setup / !ลงทะเบียนกลุ่ม', desc: 'ลงทะเบียนกลุ่ม LINE ปัจจุบันและตั้งค่าตัวคุณเป็นแอดมิน', example: '!เริ่มต้น' },
      ],
    },
    {
      title: 'จัดการอีเวนต์',
      cmds: [
        { cmd: '!สร้าง / !create_event [วันที่] [เวลา] [ระยะ] [นาที] [ทีม] [สูงสุด]', desc: 'สร้างอีเวนต์ฟุตบอลใหม่', example: '!สร้าง 2024-04-20 19:00 90 8 2 14' },
        { cmd: '!จัดทีม / !generate', desc: 'สร้างรายชื่อทีมอัตโนมัติตามระดับผู้เล่น', example: '!generate' },
        { cmd: '!ปิด / !close', desc: 'ปิดการลงทะเบียน ไม่รับสมัครเพิ่มอีก', example: '!ปิด' },
        { cmd: '!ลบ [id] / !delete_event [id]', desc: 'ลบอีเวนต์ด้วย ID', example: '!ลบ abc12345' },
      ],
    },
    {
      title: 'ตั้งค่ากลุ่ม',
      cmds: [
        { cmd: '!ตั้งค่า [5|7|11] / !config [5|7|11]', desc: 'ตั้งค่าประเภทเกมเริ่มต้น', example: '!ตั้งค่า 7' },
        { cmd: '!กลยุทธ์ เพิ่ม [formation] / !tactics add [formation]', desc: 'เพิ่มการจัดวางทีมในคลัง', example: '!กลยุทธ์ เพิ่ม 3-2-1' },
        { cmd: '!กลยุทธ์ ลบ [formation] / !tactics remove [formation]', desc: 'ลบการจัดวางออกจากคลัง', example: '!กลยุทธ์ ลบ 3-2-1' },
        { cmd: '!kick [userId] / !expulsar [userId]', desc: 'ลบสมาชิกออกจากกลุ่ม', example: '!kick U123...' },
      ],
    },
    {
      title: 'อีเวนต์ประจำสัปดาห์',
      cmds: [
        { cmd: '!recurrente เพิ่ม [วัน] [เวลา] [ระยะ] [นาที] [ทีม] [สูงสุด]', desc: 'สร้างอีเวนต์อัตโนมัติ 3 วันก่อน', example: '!recurrente เพิ่ม พุธ 19:00 120 8 3 9' },
        { cmd: '!recurrente พัก [วัน] / !recurring pause [Day]', desc: 'พักอีเวนต์ประจำชั่วคราว', example: '!recurrente พัก พุธ' },
        { cmd: '!recurrente ต่อ [วัน] / !recurring resume [Day]', desc: 'กลับมาจัดอีเวนต์ที่พักอยู่', example: '!recurrente ต่อ พุธ' },
        { cmd: '!recurrente ดู / !recurring list', desc: 'ดูรายการอีเวนต์ประจำทั้งหมด', example: '!recurrente ดู' },
      ],
    },
    {
      title: 'จัดการกลุ่ม',
      cmds: [
        { cmd: '!ลบกลุ่ม / !delete_group / !borrar_grupo', desc: 'ลบกลุ่มและข้อมูลทั้งหมด (ใช้ด้วยความระมัดระวัง!)', example: '!ลบกลุ่ม' },
      ],
    },
  ],
};

// ============================================================
// COMPONENT
// ============================================================
function HelpPageContent() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<'player' | 'admin' | 'tutorial'>('tutorial');

  useEffect(() => {
    const l = searchParams.get('lang') as Lang;
    if (l && LANGS.includes(l)) {
      setLang(l);
    }
  }, [searchParams]);

  const ui = UI[lang];
  const tutorials = TUTORIALS[lang];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #0a0e1a; color: #e2e8f0; min-height: 100vh; }

        .hero {
          background: linear-gradient(135deg, #1a2744 0%, #0f1e40 50%, #0a1628 100%);
          border-bottom: 1px solid rgba(66, 153, 225, 0.15);
          padding: 3rem 1.5rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(66, 153, 225, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(66, 153, 225, 0.12);
          border: 1px solid rgba(66, 153, 225, 0.25);
          border-radius: 100px;
          padding: 0.35rem 1rem;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #63b3ed;
          margin-bottom: 1.2rem;
        }
        .hero h1 {
          font-size: clamp(2.2rem, 6vw, 3.8rem);
          font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, #90cdf4 50%, #63b3ed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 0.8rem;
        }
        .hero .subtitle {
          font-size: 1.05rem;
          color: #94a3b8;
          max-width: 520px;
          margin: 0 auto 1.8rem;
          line-height: 1.6;
        }
        .lang-switcher {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1.1rem;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lang-btn:hover { background: rgba(66, 153, 225, 0.12); color: #e2e8f0; border-color: rgba(66,153,225,0.3); }
        .lang-btn.active { background: rgba(66, 153, 225, 0.18); color: #63b3ed; border-color: rgba(66,153,225,0.5); font-weight: 600; }

        .container { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }

        .tip-box {
          background: rgba(66, 153, 225, 0.07);
          border: 1px solid rgba(66, 153, 225, 0.18);
          border-radius: 12px;
          padding: 0.9rem 1.2rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.8rem;
          font-size: 0.88rem;
          color: #90cdf4;
          line-height: 1.5;
        }
        .tip-icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.05rem; }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.8rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 0.3rem;
          flex-wrap: wrap;
        }
        .tab-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .tab-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .tab-btn.active { background: rgba(66, 153, 225, 0.15); color: #63b3ed; font-weight: 600; }

        /* Tutorial Styles */
        .tutorial-section {
          margin-bottom: 2rem;
        }
        .tutorial-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tutorial-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.2rem;
          margin-bottom: 1rem;
        }
        .tutorial-card h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #63b3ed;
          margin-bottom: 0.5rem;
        }
        .tutorial-card p {
          font-size: 0.9rem;
          color: #94a3b8;
          line-height: 1.6;
        }
        .tutorial-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .tutorial-toggle button {
          flex: 1;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .tutorial-toggle button:hover {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
        }
        .tutorial-toggle button.active {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        .section { margin-bottom: 2rem; }
        .section-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a5568;
          margin-bottom: 0.75rem;
          padding-left: 0.25rem;
        }

        .cmd-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 1rem 1.2rem;
          margin-bottom: 0.65rem;
          transition: border-color 0.2s ease, background 0.2s ease;
          cursor: default;
        }
        .cmd-card:hover {
          background: rgba(66, 153, 225, 0.05);
          border-color: rgba(66, 153, 225, 0.2);
        }
        .cmd-top { display: flex; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap; }
        .cmd-name {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #6ee7b7;
          padding: 0.3rem 0.75rem;
          border-radius: 8px;
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cmd-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.5;
          padding-top: 0.2rem;
          flex: 1;
          min-width: 160px;
        }
        .cmd-example {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.65rem;
          font-size: 0.78rem;
          color: #4a5568;
        }
        .example-code {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 0.2rem 0.55rem;
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          color: #7c8fa8;
          font-size: 0.78rem;
        }

        .footer {
          text-align: center;
          padding: 2rem 1.5rem;
          color: #2d3748;
          font-size: 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
      `}</style>

      <title>FootLine Bot – Help</title>

      <header className="hero">
        <div className="hero-badge">⚽ LINE Bot</div>
        <h1>{ui.hero}</h1>
        <p className="subtitle">{ui.subtitle}</p>
        <div className="lang-switcher">
          {LANGS.map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              <span>{UI[l].flag}</span>
              <span>{UI[l].name}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="container">
        <div className="tip-box">
          <span className="tip-icon">💡</span>
          <span>{ui.tipText}</span>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${tab === 'tutorial' ? 'active' : ''}`} onClick={() => setTab('tutorial')}>
            {ui.tutorialTab}
          </button>
          <button className={`tab-btn ${tab === 'player' ? 'active' : ''}`} onClick={() => setTab('player')}>
            {ui.playerTab}
          </button>
          <button className={`tab-btn ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')}>
            {ui.adminTab}
          </button>
        </div>

        {tab === 'tutorial' && (
          <div className="tutorial-section">
            <div className="tutorial-toggle">
              <button className="active">{lang === 'en' ? '👤 Player Tutorial' : lang === 'es' ? '👤 Tutorial Jugador' : '👤 วิธีใช้ผู้เล่น'}</button>
              <button>{lang === 'en' ? '👑 Admin Tutorial' : lang === 'es' ? '👑 Tutorial Admin' : '👑 วิธีใช้แอดมิน'}</button>
            </div>
            
            <h3 className="tutorial-title">{tutorials.player.title}</h3>
            {tutorials.player.steps.map((step, idx) => (
              <div key={idx} className="tutorial-card">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}

            <h3 className="tutorial-title" style={{ marginTop: '2rem' }}>{tutorials.admin.title}</h3>
            {tutorials.admin.steps.map((step, idx) => (
              <div key={idx} className="tutorial-card">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'player' && PLAYER_CMDS[lang].map((section) => (
          <div key={section.title} className="section">
            <div className="section-title">{section.title}</div>
            {section.cmds.map((cmd) => (
              <div key={cmd.cmd} className="cmd-card">
                <div className="cmd-top">
                  <span className="cmd-name">{cmd.cmd}</span>
                  <span className="cmd-desc">{cmd.desc}</span>
                </div>
                {cmd.example && (
                  <div className="cmd-example">
                    <span>Example:</span>
                    <span className="example-code">{cmd.example}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {tab === 'admin' && ADMIN_CMDS[lang].map((section) => (
          <div key={section.title} className="section">
            <div className="section-title">{section.title}</div>
            {section.cmds.map((cmd) => (
              <div key={cmd.cmd} className="cmd-card">
                <div className="cmd-top">
                  <span className="cmd-name">{cmd.cmd}</span>
                  <span className="cmd-desc">{cmd.desc}</span>
                </div>
                {cmd.example && (
                  <div className="cmd-example">
                    <span>Example:</span>
                    <span className="example-code">{cmd.example}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <footer className="footer">FootLine Bot © {new Date().getFullYear()}</footer>
    </>
  );
}

export default function HelpPageWrapper() {
  return (
    <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0'}}>Loading...</div>}>
      <HelpPageContent />
    </Suspense>
  );
}
