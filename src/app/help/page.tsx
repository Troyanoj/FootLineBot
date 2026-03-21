'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';

// ============================================================
// DATA
// ===========================================-=================
const LANGS = ['en', 'es', 'th'] as const;
type Lang = (typeof LANGS)[number];

const UI: Record<Lang, { flag: string; name: string; hero: string; subtitle: string; playerTab: string; adminTab: string; cmdTip: string; tipText: string }> = {
  en: {
    flag: '🇬🇧',
    name: 'English',
    hero: 'FootLine Bot',
    subtitle: 'Your intelligent football group manager on LINE',
    playerTab: '🏃 Players',
    adminTab: '👑 Admins',
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
    cmdTip: 'คำสั่ง',
    tipText: 'พิมพ์คำสั่งในแชท LINE โดยทุกคำสั่งเริ่มต้นด้วย ! หรือ /',
  },
};

type Cmd = { cmd: string; desc: string; example?: string };
type Section = { title: string; cmds: Cmd[] };

const PLAYER_CMDS: Record<Lang, Section[]> = {
  en: [
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
        { cmd: '!position [pos1] [pos2] [pos3]', desc: 'Set up to 3 preferred positions in priority order. Values: GK (Goalie), CB (Center Back), LB/RB (Fullback), CDM (Def. Mid), CM (Midfield), CAM (Att. Mid), LW/RW (Winger), ST/CF (Striker).', example: '!position ST CM GK' },
        { cmd: '!groups_list', desc: 'List all groups you belong to.', example: '!groups_list' },
        { cmd: '!join [id]', desc: 'Join a group using its ID.', example: '!join abc12345' },
        { cmd: '!help', desc: 'Show this help message.', example: '!help' },
      ],
    },
  ],
  es: [
    {
      title: 'Partidos',
      cmds: [
        { cmd: '!apuntar  /  !inscribirme', desc: 'Anótate al partido que está abierto actualmente.', example: '!apuntar' },
        { cmd: '!baja  /  !desinscribirme', desc: 'Cancela tu lugar si no puedes asistir.', example: '!baja' },
        { cmd: '!alineacion', desc: 'Consulta a qué equipo te asignó el bot.', example: '!alineacion' },
        { cmd: '!horario', desc: 'Mira los próximos partidos agendados.', example: '!horario' },
      ],
    },
    {
      title: 'Perfil y Grupos',
      cmds: [
        { cmd: '!perfil', desc: 'Consulta tu posición favorita, tu nivel y estadísticas.', example: '!perfil' },
        { cmd: '!posicion [pos1] [pos2] [pos3]', desc: 'Configura 3 posiciones preferidas en orden de prioridad. Valores: GK (Portero), CB (Defensa), LB/RB (Lateral), CDM (Pivote), CM (Mediocentro), CAM (Mediapunta), LW/RW (Extremo), ST/CF (Delantero).', example: '!posicion ST CM GK' },
        { cmd: '!grupos', desc: 'Lista los grupos a los que perteneces.', example: '!grupos' },
        { cmd: '!unirse [id]', desc: 'Únete a un grupo usando su ID.', example: '!unirse abc12345' },
        { cmd: '!ayuda', desc: 'Muestra el mensaje de ayuda.', example: '!ayuda' },
      ],
    },
  ],
  th: [
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
        { cmd: '!ตำแหน่ง [pos1] [pos2] [pos3]', desc: 'ตั้งค่า 3 ตำแหน่งตามความถนัด. ค่าที่ใช้ได้: GK (ผู้รักษาประตู), CB (กองหลัง), LB/RB (แบ็คซ้าย/ขวา), CDM (กลางรับ), CM (กลาง), CAM (กลางรุก), LW/RW (ปีก), ST/CF (กองหน้า).', example: '!ตำแหน่ง ST CM GK' },
        { cmd: '!กลุ่ม / !groups_list', desc: 'ดูรายการกลุ่มที่คุณเข้าร่วม', example: '!groups_list' },
        { cmd: '!join [id]', desc: 'เข้าร่วมกลุ่มด้วย ID', example: '!join abc12345' },
        { cmd: '!ช่วย / !help', desc: 'แสดงข้อความช่วยเหลือ', example: '!help' },
      ],
    },
  ],
};

const ADMIN_CMDS: Record<Lang, Section[]> = {
  en: [
    {
      title: 'Match Management',
      cmds: [
        { cmd: '!create_event [date] [time] [dur] [min_game] [teams]', desc: 'Create a new match event.', example: '!create_event 2024-04-20 19:00 90 20 2' },
        { cmd: '!generate', desc: 'Automatically generate balanced teams based on player ratings.', example: '!generate' },
        { cmd: '!close', desc: 'Close registrations. No new sign-ups after this.', example: '!close' },
        { cmd: '!delete_event [id]', desc: 'Permanently delete an event by its ID.', example: '!delete_event abc12345' },
      ],
    },
    {
      title: 'Group Settings',
      cmds: [
        { cmd: '!config [5|7|11]', desc: 'Set the default game type for your group.', example: '!config 7' },
        { cmd: '!tactics add [formation]', desc: 'Add a formation to your group tactics library.', example: '!tactics add 3-2-1' },
        { cmd: '!tactics remove [formation]', desc: 'Remove a formation from the library.', example: '!tactics remove 3-2-1' },
        { cmd: '!kick [userId]', desc: 'Remove a member from the group.', example: '!kick U123...' },
      ],
    },
    {
      title: 'Recurring Events',
      cmds: [
        { cmd: '!recurring add [Day] [Time]', desc: 'Create a weekly match that auto-generates every week.', example: '!recurring add Wednesday 19:00' },
        { cmd: '!recurring pause [Day]', desc: 'Temporarily pause the weekly event.', example: '!recurring pause Wednesday' },
        { cmd: '!recurring resume [Day]', desc: 'Resume a paused weekly event.', example: '!recurring resume Wednesday' },
        { cmd: '!recurring list', desc: 'Show all configured weekly events.', example: '!recurring list' },
      ],
    },
  ],
  es: [
    {
      title: 'Gestión de Partidos',
      cmds: [
        { cmd: '!crear_evento [fecha] [hora] [dur] [min_partido] [equipos]', desc: 'Crea un nuevo partido con todos sus parámetros.', example: '!crear_evento 2024-04-20 19:00 90 20 2' },
        { cmd: '!generar', desc: 'Genera los equipos balanceados automáticamente según el rating de los jugadores.', example: '!generar' },
        { cmd: '!cerrar', desc: 'Cierra las inscripciones. Nadie más podrá apuntarse luego.', example: '!cerrar' },
        { cmd: '!borrar_evento [id]', desc: 'Elimina permanentemente un evento por su ID.', example: '!borrar_evento abc12345' },
      ],
    },
    {
      title: 'Configuración del Grupo',
      cmds: [
        { cmd: '!configurar [5|7|11]', desc: 'Define el tipo de juego predeterminado del grupo.', example: '!configurar 7' },
        { cmd: '!tactica agregar [formación]', desc: 'Agrega una formación a la biblioteca de tácticas del grupo.', example: '!tactica agregar 3-2-1' },
        { cmd: '!tactica quitar [formación]', desc: 'Quita una formación de la biblioteca.', example: '!tactica quitar 3-2-1' },
        { cmd: '!expulsar [userId]', desc: 'Elimina a un miembro del grupo.', example: '!expulsar U123...' },
      ],
    },
    {
      title: 'Eventos Recurrentes',
      cmds: [
        { cmd: '!recurrente agregar [Día] [Hora]', desc: 'Crea un partido semanal que se convoca automáticamente.', example: '!recurrente agregar Jueves 19:00' },
        { cmd: '!recurrente pausar [Día]', desc: 'Pausa el evento semanal temporalmente.', example: '!recurrente pausar Jueves' },
        { cmd: '!recurrente reanudar [Día]', desc: 'Reanuda el evento semanal pausado.', example: '!recurrente reanudar Jueves' },
        { cmd: '!recurrente listar', desc: 'Muestra todos los eventos semanales configurados.', example: '!recurrente listar' },
      ],
    },
  ],
  th: [
    {
      title: 'จัดการอีเวนต์',
      cmds: [
        { cmd: '!สร้าง / !create_event [วันที่] [เวลา] [ระยะเวลา] [นาที/คู่] [ทีม]', desc: 'สร้างอีเวนต์ฟุตบอลใหม่', example: '!create_event 2024-04-20 19:00 90 20 2' },
        { cmd: '!จัดทีม / !generate', desc: 'สร้างรายชื่อทีมอัตโนมัติตามระดับผู้เล่น', example: '!generate' },
        { cmd: '!ปิด / !close', desc: 'ปิดการลงทะเบียน ไม่รับสมัครเพิ่มอีก', example: '!close' },
        { cmd: '!ลบ / !delete_event [id]', desc: 'ลบอีเวนต์ด้วย ID', example: '!delete_event abc12345' },
      ],
    },
    {
      title: 'ตั้งค่ากลุ่ม',
      cmds: [
        { cmd: '!ตั้งค่า / !config [5|7|11]', desc: 'ตั้งค่าประเภทเกมเริ่มต้น', example: '!config 7' },
        { cmd: '!กลยุทธ์ เพิ่ม [formation]', desc: 'เพิ่มการจัดวางทีมในคลัง', example: '!กลยุทธ์ เพิ่ม 3-2-1' },
        { cmd: '!กลยุทธ์ ลบ [formation]', desc: 'ลบการจัดวางออกจากคลัง', example: '!กลยุทธ์ ลบ 3-2-1' },
        { cmd: '!kick [userId]', desc: 'ลบสมาชิกออกจากกลุ่ม', example: '!kick U123...' },
      ],
    },
    {
      title: 'อีเวนต์ประจำสัปดาห์',
      cmds: [
        { cmd: '!recurrente เพิ่ม [วัน] [เวลา]', desc: 'สร้างอีเวนต์ประจำสัปดาห์อัตโนมัติ', example: '!recurrente เพิ่ม พุธ 19:00' },
        { cmd: '!recurrente พัก [วัน]', desc: 'พักอีเวนต์ประจำชั่วคราว', example: '!recurrente พัก พุธ' },
        { cmd: '!recurrente ต่อ [วัน]', desc: 'กลับมาจัดอีเวนต์ที่พักอยู่', example: '!recurrente ต่อ พุธ' },
        { cmd: '!recurrente ดู', desc: 'ดูรายการอีเวนต์ประจำทั้งหมด', example: '!recurrente ดู' },
      ],
    },
  ],
};

// ============================================================
// COMPONENT
// ============================================================
export default function HelpPage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<'player' | 'admin'>('player');

  useEffect(() => {
    const l = searchParams.get('lang') as Lang;
    if (l && LANGS.includes(l)) {
      setLang(l);
    }
  }, [searchParams]);

  const ui = UI[lang];
  const sections = tab === 'player' ? PLAYER_CMDS[lang] : ADMIN_CMDS[lang];

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
        }
        .tab-btn {
          flex: 1;
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
          <button className={`tab-btn ${tab === 'player' ? 'active' : ''}`} onClick={() => setTab('player')}>
            {ui.playerTab}
          </button>
          <button className={`tab-btn ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')}>
            {ui.adminTab}
          </button>
        </div>

        {sections.map((section) => (
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
