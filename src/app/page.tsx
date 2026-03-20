import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FootLineBot - LINE Bot for Football Group Management',
  description: 'Manage your amateur football group with FootLineBot. Schedule events, register players, generate teams automatically.',
};

const translations = {
  en: {
    heroTitle: 'FootLineBot',
    heroSubtitle: 'LINE Bot for Amateur Football Management',
    description: 'Easily manage your football group with automated event scheduling, player registration, team generation, and tactical formations.',
    features: 'Features',
    feature1Title: 'Event Scheduling',
    feature1Desc: 'Create and manage football events with flexible scheduling options',
    feature2Title: 'Team Generation',
    feature2Desc: 'Automatically generate balanced teams based on player ratings',
    feature3Title: 'Tactical Formations',
    feature3Desc: 'Support for multiple formations (4-3-3, 4-4-2, 3-2-1, and more)',
    feature4Title: 'Recurring Events',
    feature4Desc: 'Set up weekly recurring events that automatically generate',
    getStarted: 'Get Started',
    addBot: 'Add Bot to LINE',
    howItWorks: 'How It Works',
    step1Title: '1. Add to Group',
    step1Desc: 'Add FootLineBot to your LINE group',
    step2Title: '2. Create Event',
    step2Desc: 'Use !create to schedule a match',
    step3Title: '3. Register Players',
    step3Desc: 'Players register with !register',
    step4Title: '4. Generate Teams',
    step4Desc: 'Use !lineup to create balanced teams',
    links: 'Quick Links',
    help: 'Help Center',
    helpDesc: 'Learn how to use the bot',
    terms: 'Terms of Service',
    termsDesc: 'Terms and conditions',
    privacy: 'Privacy Policy',
    privacyDesc: 'How we handle your data',
    contact: 'Contact',
    contactDesc: 'Get in touch with us',
    footer: '© 2024 FootLineBot. All rights reserved.',
  },
  es: {
    heroTitle: 'FootLineBot',
    heroSubtitle: 'Bot de LINE para Gestión de Fútbol Aficionado',
    description: 'Administra fácilmente tu grupo de fútbol con programación automática de eventos, registro de jugadores, generación de equipos y formaciones tácticas.',
    features: 'Características',
    feature1Title: 'Programación de Eventos',
    feature1Desc: 'Crear y administrar eventos de fútbol con opciones flexibles',
    feature2Title: 'Generación de Equipos',
    feature2Desc: 'Generar equipos equilibrados automáticamente según la clasificación de jugadores',
    feature3Title: 'Formaciones Tácticas',
    feature3Desc: 'Soporte para múltiples formaciones (4-3-3, 4-4-2, 3-2-1 y más)',
    feature4Title: 'Eventos Recurrentes',
    feature4Desc: 'Configura eventos semanales que se generan automáticamente',
    getStarted: 'Comenzar',
    addBot: 'Agregar Bot a LINE',
    howItWorks: 'Cómo Funciona',
    step1Title: '1. Agregar al Grupo',
    step1Desc: 'Agrega FootLineBot a tu grupo de LINE',
    step2Title: '2. Crear Evento',
    step2Desc: 'Usa !create para programar un partido',
    step3Title: '3. Registrar Jugadores',
    step3Desc: 'Los jugadores se registran con !register',
    step4Title: '4. Generar Equipos',
    step4Desc: 'Usa !lineup para crear equipos equilibrados',
    links: 'Enlaces Rápidos',
    help: 'Centro de Ayuda',
    helpDesc: 'Aprende a usar el bot',
    terms: 'Términos de Servicio',
    termsDesc: 'Términos y condiciones',
    privacy: 'Política de Privacidad',
    privacyDesc: 'Cómo manejamos tus datos',
    contact: 'Contacto',
    contactDesc: 'Escríbenos',
    footer: '© 2024 FootLineBot. Todos los derechos reservados.',
  },
  th: {
    heroTitle: 'FootLineBot',
    heroSubtitle: 'บอท LINE สำหรับจัดการฟุตบอลสมัครเล่น',
    description: 'จัดการกลุ่มฟุตบอลของคุณได้อย่างง่ายดายด้วยการจัดกำหนดการอีเวนต์อัตโนมัติ การลงทะเบียนผู้เล่น การสร้างทีม และการจัดวางแผนการเล่น',
    features: 'คุณสมบัติ',
    feature1Title: 'การจัดกำหนดการอีเวนต์',
    feature1Desc: 'สร้างและจัดการอีเวนต์ฟุตบอลด้วยตัวเลือกที่ยืดหยุ่น',
    feature2Title: 'การสร้างทีม',
    feature2Desc: 'สร้างทีมที่สมดุลโดยอัตโนมัติตามระดับผู้เล่น',
    feature3Title: 'การจัดวางแผน',
    feature3Desc: 'รองรับการจัดวางหลายรูปแบบ (4-3-3, 4-4-2, 3-2-1 และอื่นๆ)',
    feature4Title: 'อีเวนต์ประจำ',
    feature4Desc: 'ตั้งค่าอีเวนต์ประจำสัปดาห์ที่สร้างอัตโนมัติ',
    getStarted: 'เริ่มต้น',
    addBot: 'เพิ่มบอทเข้า LINE',
    howItWorks: 'วิธีใช้งาน',
    step1Title: '1. เพิ่มเข้ากลุ่ม',
    step1Desc: 'เพิ่ม FootLineBot เข้ากลุ่ม LINE ของคุณ',
    step2Title: '2. สร้างอีเวนต์',
    step2Desc: 'ใช้ !create เพื่อสร้างการแข่งขัน',
    step3Title: '3. ลงทะเบียนผู้เล่น',
    step3Desc: 'ผู้เล่นลงทะเบียนด้วย !register',
    step4Title: '4. สร้างทีม',
    step4Desc: 'ใช้ !lineup เพื่อสร้างทีมที่สมดุล',
    links: 'ลิงก์ด่วน',
    help: 'ศูนย์ช่วยเหลือ',
    helpDesc: 'เรียนรู้วิธีใช้บอท',
    terms: 'ข้อกำหนดการใช้งาน',
    termsDesc: 'ข้อตกลงและเงื่อนไข',
    privacy: 'นโยบายความเป็นส่วนตัว',
    privacyDesc: 'วิธีที่เราจัดการข้อมูลของคุณ',
    contact: 'ติดต่อ',
    contactDesc: 'ติดต่อเรา',
    footer: '© 2024 FootLineBot สงวนลิขสิทธิ์',
  },
};

type Lang = 'en' | 'es' | 'th';

export default function Home({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = (searchParams.lang as Lang) || 'en';
  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">⚽ FootLineBot</h1>
          <nav className="flex gap-4">
            <Link href={`/help?lang=${lang}`} className="text-gray-600 hover:text-green-600">{t.help}</Link>
            <Link href={`/terms?lang=${lang}`} className="text-gray-600 hover:text-green-600">{t.terms}</Link>
            <Link href={`/privacy?lang=${lang}`} className="text-gray-600 hover:text-green-600">{t.privacy}</Link>
          </nav>
        </div>
      </header>

      {/* Language Selector */}
      <div className="bg-green-600 py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-center gap-2">
          <Link href="/?lang=en" className={`px-3 py-1 rounded-full text-sm ${lang === 'en' ? 'bg-white text-green-700' : 'text-white hover:bg-green-500'}`}>English</Link>
          <Link href="/?lang=es" className={`px-3 py-1 rounded-full text-sm ${lang === 'es' ? 'bg-white text-green-700' : 'text-white hover:bg-green-500'}`}>Español</Link>
          <Link href="/?lang=th" className={`px-3 py-1 rounded-full text-sm ${lang === 'th' ? 'bg-white text-green-700' : 'text-white hover:bg-green-500'}`}>ภาษาไทย</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-green-800 mb-4">{t.heroTitle}</h2>
          <p className="text-xl text-green-600 mb-6">{t.heroSubtitle}</p>
          <p className="text-gray-600 mb-8">{t.description}</p>
          <div className="flex justify-center gap-4">
            <Link href={`/help?lang=${lang}`} className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition">
              {t.getStarted}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">{t.features}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="font-bold text-green-800 mb-2">{t.feature1Title}</h4>
              <p className="text-gray-600 text-sm">{t.feature1Desc}</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-4">⚽</div>
              <h4 className="font-bold text-green-800 mb-2">{t.feature2Title}</h4>
              <p className="text-gray-600 text-sm">{t.feature2Desc}</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-4">📋</div>
              <h4 className="font-bold text-green-800 mb-2">{t.feature3Title}</h4>
              <p className="text-gray-600 text-sm">{t.feature3Desc}</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-4">🔄</div>
              <h4 className="font-bold text-green-800 mb-2">{t.feature4Title}</h4>
              <p className="text-gray-600 text-sm">{t.feature4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">{t.howItWorks}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h4 className="font-bold text-gray-800">{t.step1Title}</h4>
                <p className="text-gray-600">{t.step1Desc}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h4 className="font-bold text-gray-800">{t.step2Title}</h4>
                <p className="text-gray-600">{t.step2Desc}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h4 className="font-bold text-gray-800">{t.step3Title}</h4>
                <p className="text-gray-600">{t.step3Desc}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <h4 className="font-bold text-gray-800">{t.step4Title}</h4>
                <p className="text-gray-600">{t.step4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">{t.links}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href={`/help?lang=${lang}`} className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <h4 className="font-bold text-green-800 mb-2">{t.help}</h4>
              <p className="text-gray-600 text-sm">{t.helpDesc}</p>
            </Link>
            <Link href={`/terms?lang=${lang}`} className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <h4 className="font-bold text-green-800 mb-2">{t.terms}</h4>
              <p className="text-gray-600 text-sm">{t.termsDesc}</p>
            </Link>
            <Link href={`/privacy?lang=${lang}`} className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <h4 className="font-bold text-green-800 mb-2">{t.privacy}</h4>
              <p className="text-gray-600 text-sm">{t.privacyDesc}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
