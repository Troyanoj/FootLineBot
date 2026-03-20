import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | FootLineBot',
  description: 'Privacy Policy for FootLineBot',
};

const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: March 2024',
    intro: 'This Privacy Policy describes how FootLineBot collects, uses, and discloses information.',
    collection: 'Information We Collect',
    collectionDesc: 'We collect the following types of information:',
    collectionList: [
      'LINE User ID and Display Name',
      'Player position preferences',
      'Group membership information',
      'Event registration data',
      'Team assignment data',
    ],
    use: 'How We Use Your Information',
    useList: [
      'To provide and maintain our service',
      'To manage your registration for events',
      'To generate balanced team formations',
      'To communicate with you about events and updates',
      'To improve and optimize our service',
    ],
    sharing: 'Information Sharing',
    sharingDesc: 'We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share information with:',
    sharingList: [
      'Group administrators (for group management purposes)',
      'Service providers who assist in our operations',
      'Legal authorities when required by law',
    ],
    security: 'Data Security',
    securityDesc: 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.',
    retention: 'Data Retention',
    retentionDesc: 'We retain your personal information for as long as your account is active or as needed to provide you services.',
    children: "Children's Privacy",
    childrenDesc: 'Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.',
    rights: 'Your Rights',
    rightsList: [
      'Access your personal information',
      'Correct inaccurate data',
      'Request deletion of your data',
      'Opt-out of communications',
    ],
    line: 'LINE Platform',
    lineDesc: 'Our service uses the LINE platform. Please review LINE\'s Privacy Policy for information about how LINE handles your data.',
    changes: 'Changes to This Policy',
    changesDesc: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.',
    contact: 'Contact Us',
    contactDesc: 'If you have any questions about this Privacy Policy, please contact the bot administrator.',
    backToHome: 'Back to Home',
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: Marzo 2024',
    intro: 'Esta Política de Privacidad describe cómo FootLineBot recopila, usa y divulga información.',
    collection: 'Información que Recopilamos',
    collectionDesc: 'Recopilamos los siguientes tipos de información:',
    collectionList: [
      'ID de Usuario de LINE y Nombre para Mostrar',
      'Preferencias de posición del jugador',
      'Información de membresía de grupo',
      'Datos de registro de eventos',
      'Datos de asignación de equipos',
    ],
    use: 'Cómo Usamos Su Información',
    useList: [
      'Para proporcionar y mantener nuestro servicio',
      'Para gestionar su registro en eventos',
      'Para generar formaciones de equipos equilibradas',
      'Para comunicarle sobre eventos y actualizaciones',
      'Para mejorar y optimizar nuestro servicio',
    ],
    sharing: 'Compartir Información',
    sharingDesc: 'No vendemos, intercambiamos ni transferimos su información personal a terceros. Podemos compartir información con:',
    sharingList: [
      'Administradores de grupo (para propósitos de gestión)',
      'Proveedores de servicios que nos asisten en operaciones',
      'Autoridades legales cuando sea requerido por ley',
    ],
    security: 'Seguridad de Datos',
    securityDesc: 'Implementamos medidas de seguridad apropiadas para proteger su información personal. Sin embargo, ningún método de transmisión por Internet es 100% seguro.',
    retention: 'Retención de Datos',
    retentionDesc: 'Retenemos su información personal mientras su cuenta esté activa o según sea necesario para proporcionarle servicios.',
    children: 'Privacidad de Niños',
    childrenDesc: 'Nuestro servicio no está destinado a niños menores de 13 años. No recopilamos knowingly información personal de niños menores de 13 años.',
    rights: 'Sus Derechos',
    rightsList: [
      'Acceder a su información personal',
      'Corregir datos inexactos',
      'Solicitar eliminación de sus datos',
      'Opt-out de comunicaciones',
    ],
    line: 'Plataforma LINE',
    lineDesc: 'Nuestro servicio utiliza la plataforma LINE. Por favor revise la Política de Privacidad de LINE para información sobre cómo LINE maneja sus datos.',
    changes: 'Cambios a Esta Política',
    changesDesc: 'Podemos actualizar esta política de privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva política en esta página.',
    contact: 'Contáctenos',
    contactDesc: 'Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contacte al administrador del bot.',
    backToHome: 'Volver al Inicio',
  },
  th: {
    title: 'นโยบายความเป็นส่วนตัว',
    lastUpdated: 'อัปเดตล่าสุด: มีนาคม 2567',
    intro: 'นโยบายความเป็นส่วนตัวนี้อธิบายวิธีที่ FootLineBot เก็บรวบรวม ใช้ และเปิดเผยข้อมูล',
    collection: 'ข้อมูลที่เราเก็บรวบรวม',
    collectionDesc: 'เราเก็บรวบรวมประเภทข้อมูลดังต่อไปนี้:',
    collectionList: [
      'LINE User ID และชื่อที่แสดง',
      'ความชอบตำแหน่งของผู้เล่น',
      'ข้อมูลการเป็นสมาชิกกลุ่ม',
      'ข้อมูลการลงทะเบียนอีเวนต์',
      'ข้อมูลการจัดทีม',
    ],
    use: 'วิธีที่เราใช้ข้อมูลของคุณ',
    useList: [
      'เพื่อให้บริการและดูแลบริการของเรา',
      'เพื่อจัดการการลงทะเบียนของคุณสำหรับอีเวนต์',
      'เพื่อสร้างการจัดทีมที่สมดุล',
      'เพื่อสื่อสารกับคุณเกี่ยวกับอีเวนต์และการอัปเดต',
      'เพื่อปรับปรุงและเพิ่มประสิทธิภาพบริการของเรา',
    ],
    sharing: 'การแบ่งปันข้อมูล',
    sharingDesc: 'เราไม่ขาย แลกเปลี่ยน หรือโอนข้อมูลส่วนบุคคลของคุณไปยังบุคคลที่สาม เราอาจแบ่งปันข้อมูลกับ:',
    sharingList: [
      'ผู้ดูแลกลุ่ม (เพื่อวัตถุประสงค์ในการจัดการกลุ่ม)',
      'ผู้ให้บริการที่ช่วยเหลือในการดำเนินงานของเรา',
      'หน่วยงานทางกฎหมายเมื่อกฎหมายกำหนด',
    ],
    security: 'ความปลอดภัยของข้อมูล',
    securityDesc: 'เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ อย่างไรก็ตาม ไม่มีวิธีการส่งผ่านอินเทอร์เน็ตใดที่ปลอดภัย 100%',
    retention: 'การเก็บรักษาข้อมูล',
    retentionDesc: 'เราเก็บรักษาข้อมูลส่วนบุคคลของคุณตราบเท่าที่บัญชีของคุณยังใช้งานอยู่หรือตามที่จำเป็นเพื่อให้บริการแก่คุณ',
    children: 'ความเป็นส่วนตัวของเด็ก',
    childrenDesc: 'บริการของเราไม่ได้มีไว้สำหรับเด็กอายุต่ำกว่า 13 ปี เราไม่ได้เก็บรวบรวมข้อมูลส่วนบุคคลจากเด็กอายุต่ำกว่า 13 ปีโดยเจตนา',
    rights: 'สิทธิ์ของคุณ',
    rightsList: [
      'เข้าถึงข้อมูลส่วนบุคคลของคุณ',
      'แก้ไขข้อมูลที่ไม่ถูกต้อง',
      'ขอให้ลบข้อมูลของคุณ',
      'ปฏิเสธการสื่อสาร',
    ],
    line: 'แพลตฟอร์ม LINE',
    lineDesc: 'บริการของเราใช้แพลตฟอร์ม LINE โปรดดูนโยบายความเป็นส่วนตัวของ LINE สำหรับข้อมูลเกี่ยวกับวิธีที่ LINE จัดการข้อมูลของคุณ',
    changes: 'การเปลี่ยนแปลงนโยบายนี้',
    changesDesc: 'เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว เราจะแจ้งให้คุณทราบเกี่ยวกับการเปลี่ยนแปลงโดยโพสต์นโยบายใหม่บนหน้านี้',
    contact: 'ติดต่อเรา',
    contactDesc: 'หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อผู้ดูแลบอท',
    backToHome: 'กลับไปหน้าหลัก',
  },
};

type Lang = 'en' | 'es' | 'th';

export default function PrivacyPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = (searchParams.lang as Lang) || 'en';
  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-green-800 mb-2">{t.title}</h1>
        <p className="text-gray-500 mb-8">{t.lastUpdated}</p>

        {/* Language Selector */}
        <div className="mb-8 flex gap-2">
          <Link href="/privacy?lang=en" className={`px-4 py-2 rounded-full ${lang === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>English</Link>
          <Link href="/privacy?lang=es" className={`px-4 py-2 rounded-full ${lang === 'es' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Español</Link>
          <Link href="/privacy?lang=th" className={`px-4 py-2 rounded-full ${lang === 'th' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>ภาษาไทย</Link>
        </div>

        <div className="prose max-w-none space-y-8">
          <section>
            <p className="text-lg text-gray-700">{t.intro}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.collection}</h2>
            <p className="text-gray-600 mb-4">{t.collectionDesc}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {t.collectionList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.use}</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {t.useList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.sharing}</h2>
            <p className="text-gray-600 mb-4">{t.sharingDesc}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {t.sharingList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.security}</h2>
            <p className="text-gray-600">{t.securityDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.retention}</h2>
            <p className="text-gray-600">{t.retentionDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.children}</h2>
            <p className="text-gray-600">{t.childrenDesc}</p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.rights}</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {t.rightsList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">{t.line}</h2>
            <p className="text-gray-600">{t.lineDesc}</p>
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
