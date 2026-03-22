'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const LANGS = ['en', 'es', 'th'] as const;
type Lang = (typeof LANGS)[number];

const UI: Record<Lang, any> = {
  en: {
    hero: 'Privacy Policy',
    subtitle: 'How we handle and protect your data',
    lastUpdate: 'Last updated: March 2024',
    sections: [
      { t: 'Data Collection', d: 'We collect your LINE User ID, Display Name, and football preferences (positions, rating).' },
      { t: 'Purpose', d: 'Your data is used solely to manage matches, generate lineups, and track your stats within your groups.' },
      { t: 'Third Parties', d: 'We do not share your data with third parties. Your info is only visible to group members and admins.' },
      { t: 'Security', d: 'We use secure database connections and encryption to keep your data safe.' }
    ]
  },
  es: {
    hero: 'Política de Privacidad',
    subtitle: 'Cómo manejamos y protegemos tus datos',
    lastUpdate: 'Última actualización: Marzo 2024',
    sections: [
      { t: 'Recolección de Datos', d: 'Recopilamos tu LINE ID, nombre de usuario y preferencias de fútbol (posiciones, nivel).' },
      { t: 'Propósito', d: 'Tus datos se usan exclusivamente para gestionar partidos, generar alineaciones y seguir tus estadísticas.' },
      { t: 'Terceros', d: 'No compartimos tus datos con terceros. Tu información solo es visible para miembros y admins del grupo.' },
      { t: 'Seguridad', d: 'Usamos conexiones de base de datos seguras y encriptación para mantener tus datos a salvo.' }
    ]
  },
  th: {
    hero: 'นโยบายความเป็นส่วนตัว',
    subtitle: 'วิธีที่เราจัดการและปกป้องข้อมูลของคุณ',
    lastUpdate: 'อัปเดตล่าสุด: มีนาคม 2567',
    sections: [
      { t: 'การเก็บข้อมูล', d: 'เราเก็บรวบรวม LINE User ID ชื่อที่แสดง และความชอบส่วนตัว (ตำแหน่ง ระดับฝีมือ)' },
      { t: 'วัตถุประสงค์', d: 'ข้อมูลของคุณใช้เพื่อจัดการแข่งขัน สร้างรายชื่อทีม และติดตามสถิติภายในกลุ่มของคุณเท่านั้น' },
      { t: 'บุคคลที่สาม', d: 'เราไม่แบ่งปันข้อมูลของคุณกับบุคคลที่สาม ข้อมูลของคุณจะเห็นได้เฉพาะสมาชิกกลุ่มและแอดมินเท่านั้น' },
      { t: 'ความปลอดภัย', d: 'เราใช้การเชื่อมต่อฐานข้อมูลที่ปลอดภัยและการเข้ารหัสเพื่อรักษาข้อมูลของคุณให้ปลอดภัย' }
    ]
  }
};

function PrivacyPageContent() {
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

      <title>FootLine Bot – Privacy</title>

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

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0'}}>Loading...</div>}>
      <PrivacyPageContent />
    </Suspense>
  );
}
