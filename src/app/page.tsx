'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const LANGS = ['en', 'es', 'th'] as const;
type Lang = (typeof LANGS)[number];

const UI: Record<Lang, any> = {
  en: {
    hero: 'FootLine Bot',
    subtitle: 'The ultimate AI assistant for your amateur football group',
    description: 'Manage matches, generate balanced teams, and track stats directly from LINE.',
    cta: 'View Guide',
    featuresTitle: 'Smart Features',
    feature1: { title: 'Auto-Scheduling', desc: 'Create matches and recurring weekly events with one command.' },
    feature2: { title: 'AI Formations', desc: 'Balanced teams based on player level and preferred positions.' },
    feature3: { title: 'Admin Control', desc: 'Full control over registrations, groups, and kicked members.' },
    feature4: { title: 'Zero Friction', desc: 'Add the bot to a group, run !setup, and start playing.' },
    linksTitle: 'Quick Access',
    help: 'Help Center',
    helpDesc: 'Full command list and usage guide.',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    footer: 'FootLine Bot ©'
  },
  es: {
    hero: 'FootLine Bot',
    subtitle: 'El asistente definitivo para tu grupo de fútbol aficionado',
    description: 'Gestiona partidos, genera equipos equilibrados y sigue estadísticas directamente desde LINE.',
    cta: 'Ver Guía',
    featuresTitle: 'Funciones Inteligentes',
    feature1: { title: 'Programación Auto', desc: 'Crea partidos y eventos recurrentes con un solo comando.' },
    feature2: { title: 'Equipos por IA', desc: 'Equipos nivelados según el nivel y posiciones preferidas.' },
    feature3: { title: 'Control Total', desc: 'Gestión completa de inscritos, grupos y expulsiones.' },
    feature4: { title: 'Sin Fricción', desc: 'Añade el bot, escribe !iniciar y empieza a jugar.' },
    linksTitle: 'Acceso Rápido',
    help: 'Centro de Ayuda',
    helpDesc: 'Lista completa de comandos y guía de uso.',
    terms: 'Términos de Servicio',
    privacy: 'Política de Privacidad',
    footer: 'FootLine Bot ©'
  },
  th: {
    hero: 'FootLine Bot',
    subtitle: 'ผู้ช่วยจัดการกลุ่มฟุตบอลอัจฉริยะบน LINE',
    description: 'จัดการแข่งขัน สร้างทีมที่สมดุล และติดตามสถิติได้โดยตรงจากแอป LINE ของคุณ',
    cta: 'ดูคู่มือ',
    featuresTitle: 'คุณสมบัติอัจฉริยะ',
    feature1: { title: 'จัดตารางอัตโนมัติ', desc: 'สร้างแมตซ์และเหตุการณ์รายสัปดาห์ด้วยคำสั่งเดียว' },
    feature2: { title: 'จัดทีมด้วย IA', desc: 'ทีมที่สมดุลตามระดับฝีมือและตำแหน่งที่ผู้เล่นชอบ' },
    feature3: { title: 'ระบบจัดการแอดมิน', desc: 'ควบคุมการลงทะเบียน กลุ่ม และสมาชิกได้อย่างเต็มที่' },
    feature4: { title: 'เริ่มเล่นง่าย', desc: 'เพิ่มบอทเข้ากลุ่ม พิมพ์ !เริ่มต้น และเริ่มเล่นได้ทันที' },
    linksTitle: 'ลิงก์ด่วน',
    help: 'ศูนย์ช่วยเหลือ',
    helpDesc: 'รายการคำสั่งและวิธีใช้งานทั้งหมด',
    terms: 'ข้อกำหนดการใช้งาน',
    privacy: 'นโยบายความเป็นส่วนตัว',
    footer: 'FootLine Bot ©'
  }
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const l = searchParams.get('lang') as Lang;
    if (l && LANGS.includes(l)) {
      setLang(l);
    }
  }, [searchParams]);

  const ui = UI[lang];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #0a0e1a; color: #e2e8f0; min-height: 100vh; }

        .hero {
          background: linear-gradient(135deg, #1a2744 0%, #0f1e40 50%, #0a1628 100%);
          border-bottom: 1px solid rgba(66, 153, 225, 0.15);
          padding: 5rem 1.5rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(66, 153, 225, 0.15) 0%, transparent 70%);
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
          margin-bottom: 1.5rem;
        }
        .hero h1 {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, #90cdf4 50%, #63b3ed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin-bottom: 1rem;
        }
        .hero .subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          background: #3182ce;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 100px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, background 0.2s ease;
          box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.3);
        }
        .hero-cta:hover { background: #2b6cb0; transform: translateY(-2px); }

        .container { max-width: 1000px; margin: 0 auto; padding: 4rem 1.5rem; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }
        .feat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }
        .feat-card:hover { transform: translateY(-3px); background: rgba(66, 153, 225, 0.04); border-color: rgba(66,153,225,0.2); }
        .feat-icon { font-size: 2rem; margin-bottom: 1rem; display: block; }
        .feat-title { font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .feat-desc { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .lnk-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 1.25rem;
          border-radius: 12px;
          text-decoration: none;
          display: block;
          transition: border-color 0.2s ease;
        }
        .lnk-card:hover { border-color: rgba(66,153,225,0.3); }
        .lnk-title { color: #63b3ed; font-weight: 700; margin-bottom: 0.25rem; }
        .lnk-desc { font-size: 0.8rem; color: #64748b; }

        .footer {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #2d3748;
          font-size: 0.85rem;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .lang-nav {
           display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;
        }
        .lang-nav a {
          text-decoration: none; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.75rem; 
          border: 1px solid rgba(255,255,255,0.08); color: #4a5568; transition: all 0.2s;
        }
        .lang-nav a.active { background: rgba(66, 153, 225, 0.15); color: #63b3ed; border-color: rgba(66,153,225,0.3); }
      `}</style>

      <title>FootLine Bot – AI Football Manager</title>

      <header className="hero">
        <div className="hero-badge">⚽ Next Generation Management</div>
        <h1>{ui.hero}</h1>
        <p className="subtitle">{ui.subtitle}</p>
        <Link href={`/help?lang=${lang}`} className="hero-cta">{ui.cta}</Link>
        
        <nav className="lang-nav">
          <Link href="/?lang=en" className={lang === 'en' ? 'active' : ''}>ENG</Link>
          <Link href="/?lang=es" className={lang === 'es' ? 'active' : ''}>ESP</Link>
          <Link href="/?lang=th" className={lang === 'th' ? 'active' : ''}>THA</Link>
        </nav>
      </header>

      <main className="container">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>{ui.featuresTitle}</h2>
        <div className="features-grid">
          <div className="feat-card">
            <span className="feat-icon">🗓️</span>
            <div className="feat-title">{ui.feature1.title}</div>
            <div className="feat-desc">{ui.feature1.desc}</div>
          </div>
          <div className="feat-card">
            <span className="feat-icon">🤖</span>
            <div className="feat-title">{ui.feature2.title}</div>
            <div className="feat-desc">{ui.feature2.desc}</div>
          </div>
          <div className="feat-card">
            <span className="feat-icon">⚡</span>
            <div className="feat-title">{ui.feature3.title}</div>
            <div className="feat-desc">{ui.feature3.desc}</div>
          </div>
          <div className="feat-card">
            <span className="feat-icon">💎</span>
            <div className="feat-title">{ui.feature4.title}</div>
            <div className="feat-desc">{ui.feature4.desc}</div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#4a5568' }}>{ui.linksTitle}</h2>
        <div className="links-grid">
          <Link href={`/help?lang=${lang}`} className="lnk-card">
            <div className="lnk-title">{ui.help}</div>
            <div className="lnk-desc">{ui.helpDesc}</div>
          </Link>
          <Link href={`/terms?lang=${lang}`} className="lnk-card">
            <div className="lnk-title">{ui.terms}</div>
            <div className="lnk-desc">Legal info and usage terms.</div>
          </Link>
          <Link href={`/privacy?lang=${lang}`} className="lnk-card">
            <div className="lnk-title">{ui.privacy}</div>
            <div className="lnk-desc">How we protect your data.</div>
          </Link>
        </div>
      </main>

      <footer className="footer">
        {ui.footer} {new Date().getFullYear()} – Made for the Beautiful Game
      </footer>
    </>
  );
}
