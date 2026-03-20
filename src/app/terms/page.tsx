import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | FootLineBot',
  description: 'Terms and Conditions for using FootLineBot',
};

const translations = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: March 2024',
    intro: 'Welcome to FootLineBot. By using our service, you agree to these terms.',
    acceptance: 'Acceptance of Terms',
    acceptanceDesc: 'By accessing and using FootLineBot, you accept and agree to be bound by the terms and provision of this agreement.',
    service: 'Description of Service',
    serviceDesc: 'FootLineBot is a LINE bot application that helps manage amateur football groups, including event scheduling, player registration, team generation, and tactical formations.',
    userResponsibilities: 'User Responsibilities',
    userResponsibilitiesList: [
      'Provide accurate information when registering',
      'Use the bot in accordance with LINE platform policies',
      'Not engage in any unlawful or abusive behavior',
      'Respect other users and group administrators',
    ],
    privacy: 'Privacy',
    privacyDesc: 'We collect and store user data necessary for the operation of the service, including LINE user IDs, display names, and player preferences. All data is handled in accordance with our Privacy Policy.',
    disclaimer: 'Disclaimer',
    disclaimerDesc: 'FootLineBot is provided "as is" without warranty of any kind. We do not guarantee uninterrupted service or accuracy of team formations.',
    limitation: 'Limitation of Liability',
    limitationDesc: 'We shall not be liable for any indirect, incidental, or consequential damages arising from the use of this service.',
    changes: 'Changes to Terms',
    changesDesc: 'We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.',
    contact: 'Contact',
    contactDesc: 'For questions about these terms, please contact the bot administrator.',
    backToHome: 'Back to Home',
    language: 'Language',
  },
  es: {
    title: 'Términos de Servicio',
    lastUpdated: 'Última actualización: Marzo 2024',
    intro: 'Bienvenido a FootLineBot. Al usar nuestro servicio, aceptas estos términos.',
    acceptance: 'Aceptación de Términos',
    acceptanceDesc: 'Al acceder y usar FootLineBot, aceptas y acuerdas estar obligado por los términos y disposiciones de este acuerdo.',
    service: 'Descripción del Servicio',
    serviceDesc: 'FootLineBot es una aplicación de bot de LINE que ayuda a gestionar grupos de fútbol amateur, incluyendo programación de eventos, registro de jugadores, generación de equipos y formaciones tácticas.',
    userResponsibilities: 'Responsabilidades del Usuario',
    userResponsibilitiesList: [
      'Proporcionar información precisa al registrarse',
      'Usar el bot de acuerdo con las políticas de la plataforma LINE',
      'No participar en comportamiento ilegal o abusivo',
      'Respetar a otros usuarios y administradores del grupo',
    ],
    privacy: 'Privacidad',
    privacyDesc: 'Recopilamos y almacenamos datos de usuario necesarios para la operación del servicio, incluyendo IDs de usuario de LINE, nombres para mostrar y preferencias de jugadores. Todos los datos se manejan de acuerdo con nuestra Política de Privacidad.',
    disclaimer: 'Renuncia de Garantías',
    disclaimerDesc: 'FootLineBot se proporciona "tal cual" sin garantía de ningún tipo. No garantizamos servicio ininterrumpido o precisión de las formaciones de equipos.',
    limitation: 'Limitación de Responsabilidad',
    limitationDesc: 'No seremos responsables por daños indirectos, incidentales o consecuentes derivados del uso de este servicio.',
    changes: 'Cambios a los Términos',
    changesDesc: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuo del servicio constituye aceptación de los términos modificados.',
    contact: 'Contacto',
    contactDesc: 'Para preguntas sobre estos términos, por favor contacta al administrador del bot.',
    backToHome: 'Volver al Inicio',
    language: 'Idioma',
  },
  th: {
    title: 'ข้อกำหนดการใช้งาน',
    lastUpdated: 'อัปเดตล่าสุด: มีนาคม 2567',
    intro: 'ยินดีต้อนรับสู่ FootLineBot การใช้บริการของเราถือว่าคุณยอมรับข้อกำหนดเหล่านี้',
    acceptance: 'การยอมรับข้อกำหนด',
    acceptanceDesc: 'เมื่อเข้าถึงและใช้ FootLineBot คุณยอมรับและตกลงที่จะผูกพันตามข้อกำหนดและบทบัญญัติของข้อตกลงนี้',
    service: 'คำอธิบายบริการ',
    serviceDesc: 'FootLineBot เป็นแอปพลิเคชันบอท LINE ที่ช่วยจัดการกลุ่มฟุตบอลสมัครเล่น รวมถึงการจัดกำหนดการอีเวนต์ การลงทะเบียนผู้เล่น การสร้างทีม และการจัดวางแผนการเล่น',
    userResponsibilities: 'ความรับผิดชอบของผู้ใช้',
    userResponsibilitiesList: [
      'ให้ข้อมูลที่ถูกต้องเมื่อลงทะเบียน',
      'ใช้บอทตามนโยบายของแพลตฟอร์ม LINE',
      'ไม่มีส่วนร่วมในพฤติกรรมที่ผิดกฎหมายหรือทารุณ',
      'เคารพผู้ใช้อื่นและผู้ดูแลกลุ่ม',
    ],
    privacy: 'ความเป็นส่วนตัว',
    privacyDesc: 'เราเก็บรวบรวมและจัดเก็บข้อมูลผู้ใช้ที่จำเป็นสำหรับการทำงานของบริการ รวมถึง LINE user ID ชื่อที่แสดง และความชอบของผู้เล่น ข้อมูลทั้งหมดได้รับการจัดการตามนโยบายความเป็นส่วนตัวของเรา',
    disclaimer: 'ข้อจำกัดของการรับประกัน',
    disclaimerDesc: 'FootLineBot มีให้ตามสภาพ "ตามที่เป็น" โดยไม่มีการรับประกันใดๆ เราไม่รับประกันการให้บริการที่ไม่ขาดตอนหรือความถูกต้องของการจัดทีม',
    limitation: 'ข้อจำกัดของความรับผิด',
    limitationDesc: 'เราจะไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายโดยบังเอิญ หรือผลที่ตามมาจากการใช้บริการนี้',
    changes: 'การเปลี่ยนแปลงข้อกำหนด',
    changesDesc: 'เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา การใช้บริการต่อเนื่องถือเป็นการยอมรับข้อกำหนดที่แก้ไขแล้ว',
    contact: 'ติดต่อ',
    contactDesc: 'หากมีคำถามเกี่ยวกับข้อกำหนดเหล่านี้ โปรดติดต่อผู้ดูแลบอท',
    backToHome: 'กลับไปหน้าหลัก',
    language: 'ภาษา',
  },
};

type Lang = 'en' | 'es' | 'th';

export default function TermsPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = (searchParams.lang as Lang) || 'en';
  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-green-800 mb-2">{t.title}</h1>
        <p className="text-gray-500 mb-8">{t.lastUpdated}</p>

        {/* Language Selector */}
        <div className="mb-8 flex gap-2">
          <Link href="/terms?lang=en" className={`px-4 py-2 rounded-full ${lang === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>English</Link>
          <Link href="/terms?lang=es" className={`px-4 py-2 rounded-full ${lang === 'es' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Español</Link>
          <Link href="/terms?lang=th" className={`px-4 py-2 rounded-full ${lang === 'th' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>ภาษาไทย</Link>
        </div>

        <div className="prose max-w-none space-y-8">
          <section>
            <p className="text-lg text-gray-700">{t.intro}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.acceptance}</h2>
            <p className="text-gray-600">{t.acceptanceDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.service}</h2>
            <p className="text-gray-600">{t.serviceDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.userResponsibilities}</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {t.userResponsibilitiesList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.privacy}</h2>
            <p className="text-gray-600">{t.privacyDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.disclaimer}</h2>
            <p className="text-gray-600">{t.disclaimerDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.limitation}</h2>
            <p className="text-gray-600">{t.limitationDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.changes}</h2>
            <p className="text-gray-600">{t.changesDesc}</p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-2">{t.contact}</h2>
            <p className="text-gray-600">{t.contactDesc}</p>
          </section>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-green-600 hover:underline">{t.backToHome}</Link>
        </div>
      </div>
    </div>
  );
}
