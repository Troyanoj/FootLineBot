import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help | FootLineBot',
  description: 'User guides and instructions for FootLineBot',
};

const translations = {
  en: {
    title: 'Help Center',
    subtitle: 'Learn how to use FootLineBot',
    gettingStarted: 'Getting Started',
    addingBot: 'Adding the Bot to Your Group',
    addingBotDesc: 'Follow these steps to add FootLineBot to your LINE group:',
    step1: 'Search for "FootLineBot" in LINE',
    step2: 'Open your group settings',
    step3: 'Select "Add Member" and choose FootLineBot',
    step4: 'The bot will automatically send a welcome message',
    playerCommands: 'Commands for Players',
    adminCommands: 'Commands for Administrators',
    register: 'Register for current event',
    unregister: 'Cancel registration',
    profile: 'View profile and positions',
    lineup: 'View team lineup',
    events: 'View upcoming events',
    groups: 'View available groups',
    help: 'View all commands',
    create: 'Create new event',
    config: 'Set game type (5, 7, or 11)',
    tactica: 'Add tactical formation',
    lineupCmd: 'Generate teams automatically',
    close: 'Close registration',
    recurring: 'Manage recurring events',
    recurringAdd: 'Add recurring event (e.g., every Wednesday)',
    recurringPause: 'Pause recurring event',
    recurringResume: 'Resume recurring event',
    recurringDelete: 'Delete recurring event',
    recurringList: 'List recurring events',
    formations: 'Available Formations',
    football5: 'Football 5: 2-2, 1-2-1, 1-1-2, 2-1-1',
    football7: 'Football 7: 3-2-1, 2-3-1, 2-2-2, 3-1-2',
    football11: 'Football 11: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3',
    positions: 'Positions in Thai',
    gk: 'Goalkeeper',
    cb: 'Center Back',
    lb: 'Left Back',
    rb: 'Right Back',
    cdm: 'Defensive Mid',
    cm: 'Midfielder',
    cam: 'Attacking Mid',
    st: 'Forward',
    days: 'Days of the Week',
    contact: 'Contact Support',
    contactDesc: 'For additional help, contact the bot administrator.',
    backToHome: 'Back to Home',
  },
  es: {
    title: 'Centro de Ayuda',
    subtitle: 'Aprende cómo usar FootLineBot',
    gettingStarted: 'Comenzar',
    addingBot: 'Agregar el Bot a tu Grupo',
    addingBotDesc: 'Sigue estos pasos para agregar FootLineBot a tu grupo de LINE:',
    step1: 'Busca "FootLineBot" en LINE',
    step2: 'Abre la configuración de tu grupo',
    step3: 'Selecciona "Añadir Miembro" y elige FootLineBot',
    step4: 'El bot enviará automáticamente un mensaje de bienvenida',
    playerCommands: 'Comandos para Jugadores',
    adminCommands: 'Comandos para Administradores',
    register: 'Registrarse al evento actual',
    unregister: 'Cancelar registro',
    profile: 'Ver perfil y posiciones',
    lineup: 'Ver alineación del equipo',
    events: 'Ver próximos eventos',
    groups: 'Ver grupos disponibles',
    help: 'Ver todos los comandos',
    create: 'Crear nuevo evento',
    config: 'Establecer tipo de juego (5, 7 u 11)',
    tactica: 'Agregar formación táctica',
    lineupCmd: 'Generar equipos automáticamente',
    close: 'Cerrar registro',
    recurring: 'Gestionar eventos recurrentes',
    recurringAdd: 'Agregar evento recurrente (ej., cada miércoles)',
    recurringPause: 'Pausar evento recurrente',
    recurringResume: 'Reanudar evento recurrente',
    recurringDelete: 'Eliminar evento recurrente',
    recurringList: 'Listar eventos recurrentes',
    formations: 'Formaciones Disponibles',
    football5: 'Fútbol 5: 2-2, 1-2-1, 1-1-2, 2-1-1',
    football7: 'Fútbol 7: 3-2-1, 2-3-1, 2-2-2, 3-1-2',
    football11: 'Fútbol 11: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3',
    positions: 'Posiciones en Tailandés',
    gk: 'Portero',
    cb: 'Defensa Central',
    lb: 'Lateral Izquierdo',
    rb: 'Lateral Derecho',
    cdm: 'Medio Centro Defensivo',
    cm: 'Centrocampista',
    cam: 'Mediapunta',
    st: 'Delantero',
    days: 'Días de la Semana',
    contact: 'Contactar Soporte',
    contactDesc: 'Para ayuda adicional, contacta al administrador del bot.',
    backToHome: 'Volver al Inicio',
  },
  th: {
    title: 'ศูนย์ช่วยเหลือ',
    subtitle: 'เรียนรู้วิธีใช้ FootLineBot',
    gettingStarted: 'เริ่มต้น',
    addingBot: 'การเพิ่มบอทเข้ากลุ่ม',
    addingBotDesc: 'ทำตามขั้นตอนเหล่านี้เพื่อเพิ่ม FootLineBot เข้ากลุ่ม LINE ของคุณ:',
    step1: 'ค้นหา "FootLineBot" ใน LINE',
    step2: 'เปิดการตั้งค่ากลุ่ม',
    step3: 'เลือก "เพิ่มสมาชิก" และเลือก FootLineBot',
    step4: 'บอทจะส่งข้อความต้อนรับอัตโนมัติ',
    playerCommands: 'คำสั่งสำหรับผู้เล่น',
    adminCommands: 'คำสั่งสำหรับผู้ดูแล',
    register: 'ลงทะเบียนเข้าร่วมอีเวนต์ปัจจุบัน',
    unregister: 'ยกเลิกการลงทะเบียน',
    profile: 'ดูโปรไฟล์และตำแหน่ง',
    lineup: 'ดูรายชื่อทีม',
    events: 'ดูอีเวนต์ที่กำลังจะมาถึง',
    groups: 'ดูกลุ่มที่มี',
    help: 'ดูคำสั่งทั้งหมด',
    create: 'สร้างอีเวนต์ใหม่',
    config: 'ตั้งค่าประเภทเกม (5, 7 หรือ 11)',
    tactica: 'เพิ่มการจัดวาง',
    lineupCmd: 'สร้างทีมอัตโนมัติ',
    close: 'ปิดการลงทะเบียน',
    recurring: 'จัดการอีเวนต์ประจำ',
    recurringAdd: 'เพิ่มอีเวนต์ประจำ (เช่น ทุกวันพุธ)',
    recurringPause: 'พักอีเวนต์ประจำ',
    recurringResume: 'กลับมาจัดอีเวนต์ประจำ',
    recurringDelete: 'ลบอีเวนต์ประจำ',
    recurringList: 'ดูรายการอีเวนต์ประจำ',
    formations: 'การจัดวางที่ใช้ได้',
    football5: 'ฟุตบอล 5 คน: 2-2, 1-2-1, 1-1-2, 2-1-1',
    football7: 'ฟุตบอล 7 คน: 3-2-1, 2-3-1, 2-2-2, 3-1-2',
    football11: 'ฟุตบอล 11 คน: 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3',
    positions: 'ตำแหน่งในภาษาไทย',
    gk: 'ผู้รักษาประตู',
    cb: 'กองหลังกลาง',
    lb: 'แบ็คซ้าย',
    rb: 'แบ็คขวา',
    cdm: 'กองกลางตัวรับ',
    cm: 'กองกลาง',
    cam: 'กองกลางตัวรุก',
    st: 'กองหน้า',
    days: 'วันในสัปดาห์',
    contact: 'ติดต่อฝ่ายสนับสนุน',
    contactDesc: 'สำหรับความช่วยเหลือเพิ่มเติม ติดต่อผู้ดูแลบอท',
    backToHome: 'กลับไปหน้าหลัก',
  },
};

type Lang = 'en' | 'es' | 'th';

export default function HelpPage({ 
  searchParams 
}: { 
  searchParams: { lang?: string } 
}) {
  const lang = (searchParams.lang as Lang) || 'en';
  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-green-800 mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>

        {/* Language Selector */}
        <div className="mb-8 flex gap-2">
          <Link href="/help?lang=en" className={`px-4 py-2 rounded-full ${lang === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>English</Link>
          <Link href="/help?lang=es" className={`px-4 py-2 rounded-full ${lang === 'es' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Español</Link>
          <Link href="/help?lang=th" className={`px-4 py-2 rounded-full ${lang === 'th' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>ภาษาไทย</Link>
        </div>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">{t.gettingStarted}</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.addingBot}</h3>
            <p className="text-gray-600 mb-4">{t.addingBotDesc}</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>{t.step1}</li>
              <li>{t.step2}</li>
              <li>{t.step3}</li>
              <li>{t.step4}</li>
            </ol>
          </div>
        </section>

        {/* Commands */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Player Commands */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.playerCommands}</h2>
            <ul className="space-y-3">
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!register</span>
                <span className="text-gray-600">{t.register}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!unregister</span>
                <span className="text-gray-600">{t.unregister}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!profile</span>
                <span className="text-gray-600">{t.profile}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!lineup</span>
                <span className="text-gray-600">{t.lineup}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!events</span>
                <span className="text-gray-600">{t.events}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!help</span>
                <span className="text-gray-600">{t.help}</span>
              </li>
            </ul>
          </section>

          {/* Admin Commands */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.adminCommands}</h2>
            <ul className="space-y-3">
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!create</span>
                <span className="text-gray-600">{t.create}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!config</span>
                <span className="text-gray-600">{t.config}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!tactica</span>
                <span className="text-gray-600">{t.tactica}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!lineup</span>
                <span className="text-gray-600">{t.lineupCmd}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!close</span>
                <span className="text-gray-600">{t.close}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">!recurrente</span>
                <span className="text-gray-600">{t.recurring}</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Formations */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-xl font-bold text-green-700 mb-4">{t.formations}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Football 5</h3>
              <p className="text-gray-700">{t.football5}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Football 7</h3>
              <p className="text-gray-700">{t.football7}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Football 11</h3>
              <p className="text-gray-700">{t.football11}</p>
            </div>
          </div>
        </section>

        {/* Positions */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-xl font-bold text-green-700 mb-4">{t.positions}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">GK</span>
              <p className="text-gray-600">{t.gk}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">CB</span>
              <p className="text-gray-600">{t.cb}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">LB/RB</span>
              <p className="text-gray-600">{t.lb}/{t.rb}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">CM</span>
              <p className="text-gray-600">{t.cm}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">CDM</span>
              <p className="text-gray-600">{t.cdm}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">CAM</span>
              <p className="text-gray-600">{t.cam}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <span className="font-mono font-bold">ST/CF</span>
              <p className="text-gray-600">{t.st}</p>
            </div>
          </div>
        </section>

        {/* Days of Week */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-xl font-bold text-green-700 mb-4">{t.days}</h2>
          <div className="flex flex-wrap gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
              <span key={day} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {lang === 'th' ? ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'][i] : day}
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-700 mb-2">{t.contact}</h2>
          <p className="text-gray-600">{t.contactDesc}</p>
        </section>

        {/* Back to Home */}
        <div className="mt-8">
          <Link href="/" className="text-green-600 hover:underline">{t.backToHome}</Link>
        </div>
      </div>
    </div>
  );
}
