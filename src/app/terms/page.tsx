'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const LANGS = ['en', 'es', 'th'] as const;
type Lang = (typeof LANGS)[number];

const UI: Record<Lang, any> = {
  en: {
    hero: 'Terms of Service',
    subtitle: 'Legal framework for FootLine Bot users',
    lastUpdate: 'Last updated: March 2024',
    sections: [
      { t: 'Acceptance', d: 'By using FootLine Bot, you agree to these terms.' },
      { t: 'Service', d: 'FootLine is an automated assistant for football groups. We provide scheduling and team generation tools "as is".' },
      { t: 'Privacy', d: 'We process your LINE ID and profile name to manage group memberships and stats.' },
      { t: 'Responsibilities', d: 'Users must not use the bot for spam or abusive purposes within LINE groups.' }
    ]
  },
  es: {
    hero: 'Términos de Servicio',
    subtitle: 'Marco legal para los usuarios de FootLine Bot',
    lastUpdate: 'Última actualización: Marzo 2024',
    sections: [
      { t: 'Aceptación', d: 'Al usar FootLine Bot, aceptas estos términos de uso.' },
      { t: 'Servicio', d: 'FootLine es un asistente para grupos de fútbol. Ofrecemos herramientas de gestión "tal cual".' },
      { t: 'Privacidad', d: 'Procesamos tu LINE ID y nombre para gestionar las inscripciones y estadísticas.' },
      { t: 'Responsabilidades', d: 'Los usuarios no deben usar el bot para spam o propósitos abusivos en grupos.' }
    ]
  },
  th: {
    hero: 'ข้อกำหนดการใช้งาน',
    subtitle: 'กรอบกฎหมายสำหรับผู้ใช้ FootLine Bot',
    lastUpdate: 'อัปเดตล่าสุด: มีนาคม 2567',
    sections: [
      { t: 'การยอมรับ', d: 'การใช้ FootLine Bot ถือว่าคุณยอมรับข้อกำหนดเหล่านี้' },
      { t: 'บริการด้านเทคนิค', d: 'FootLine เป็นผู้ช่วยอัตโนมัติสำหรับกลุ่มฟุตบอล เราให้บริการเครื่องมือ "ตามสภาพที่เป็นอยู่"' },
      { t: 'ความเป็นส่วนตัว', d: 'เราประมวลผล LINE ID และชื่อโปรไฟล์ของคุณเพื่อจัดการสมาชิกกลุ่มและสถิติ' },
      { t: 'ความรับผิดชอบ', d: 'ผู้ใช้ต้องไม่ใช้บอทเพื่อจุดประสงค์ที่เป็นสแปมหรือการละเมิดในกลุ่ม LINE' }
    ]
  }
};

function TermsPageContent() {
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
          padding: 4rem 1.5rem 3rem;
          text-align: center;
        }
        .hero h1 {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 900;
          color: #fff;
          margin-bottom: 0.8rem;
          letter-spacing: -0.03em;
        }
        .hero .subtitle { font-size: 1rem; color: #64748b; margin-bottom: 1rem; }
        .hero .update { font-size: 0.75rem; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em; }

        .container { max-width: 800px; margin: 0 auto; padding: 3rem 1.5rem; }

        .section-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .sec-title { font-size: 1.1rem; font-weight: 700; color: #63b3ed; margin-bottom: 0.75rem; }
        .sec-desc { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }

        .nav-home { text-align: center; margin-top: 2rem; }
        .nav-home a { color: #4a5568; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-home a:hover { color: #63b3ed; }
        
        .footer { text-align: center; padding: 2rem; color: #1e293b; font-size: 0.8rem; }
      `}</style>

      <title>FootLine Bot – Terms</title>

      <header className="hero">
        <h1>{ui.hero}</h1>
        <p className="subtitle">{ui.subtitle}</p>
        <p className="update">{ui.lastUpdate}</p>
      </header>

      <main className="container">
        {ui.sections.map((s: any, i: number) => (
          <div key={i} className="section-card">
            <div className="sec-title">{s.t}</div>
            <div className="sec-desc">{s.d}</div>
          </div>
        ))}

        <div className="nav-home">
          <Link href={`/?lang=${lang}`}>← Back to Home</Link>
        </div>
      </main>

      <footer className="footer">FootLine Bot © {new Date().getFullYear()}</footer>
    </>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0'}}>Loading...</div>}>
      <TermsPageContent />
    </Suspense>
  );
}
