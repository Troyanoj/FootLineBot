const fs = require('fs');

// ============ FIX user.handlers.ts ============
{
  let code = fs.readFileSync('src/lib/line/handlers/user.handlers.ts', 'utf-8');

  code = code
    .replace(/case 'apuntar':\r?\n\s+case 'inscribirme':\r?\n/g, "case 'apuntar':\n    case 'inscribirme':\n    case 'register':\n")
    .replace(/case 'baja':\r?\n\s+case 'desinscribirme':\r?\n/g, "case 'baja':\n    case 'desinscribirme':\n    case 'unregister':\n")
    .replace(/case 'perfil':\r?\n      return handlePerfil/g, "case 'perfil':\n    case 'profile':\n      return handlePerfil")
    .replace(/case 'alineacion':\r?\n      return handleAlineacion/g, "case 'alineacion':\n    case 'lineup':\n      return handleAlineacion")
    .replace(/case 'horario':\r?\n      return handleHorario/g, "case 'horario':\n    case 'schedule':\n      return handleHorario")
    .replace(/case 'grupos':\r?\n      return handleGrupos/g, "case 'grupos':\n    case 'groups_list':\n      return handleGrupos")
    .replace(/case 'unirse':\r?\n      return handleUnirse/g, "case 'unirse':\n    case 'join':\n      return handleUnirse");

  fs.writeFileSync('src/lib/line/handlers/user.handlers.ts', code);
  console.log('✅ user.handlers.ts updated');
}

// ============ FIX admin.handlers.ts ============
{
  let code = fs.readFileSync('src/lib/line/handlers/admin.handlers.ts', 'utf-8');

  code = code
    // create_event
    .replace(
      /(case 'crear_evento':\r?\n\s+case '[^']+':)(\r?\n\s+return handleCrearEvento)/,
      "$1\n    case 'create_event':$2"
    )
    // config
    .replace(
      /(case 'configurar':\r?\n\s+case '[^']+':)(\r?\n\s+return handleConfigurar)/,
      "$1\n    case 'config':$2"
    )
    // tactics
    .replace(
      /(case 'tactica':[^;]*?case '[^']+':)(\r?\n\s+return handleTactica)/s,
      "$1\n    case 'tactics':$2"
    )
    // generate
    .replace(/case 'generar':\r?\n      return handleGenerar/g, "case 'generar':\n    case 'generate':\n      return handleGenerar")
    // close
    .replace(
      /(case 'cerrar':\r?\n\s+case '[^']+':)(\r?\n\s+return handleCerrar)/,
      "$1\n    case 'close':$2"
    )
    // delete_event
    .replace(
      /(case 'borrar_evento':\r?\n\s+case '[^']+':)(\r?\n\s+return handleBorrarEvento)/,
      "$1\n    case 'delete_event':$2"
    )
    // kick
    .replace(/case 'expulsar':\r?\n      return handleExpulsar/g, "case 'expulsar':\n    case 'kick':\n      return handleExpulsar")
    // recurring_events
    .replace(
      /(case 'recurrente':\r?\n\s+case 'recurring':)(\r?\n\s+return handleRecurrente)/,
      "$1\n    case 'recurring_events':$2"
    );

  fs.writeFileSync('src/lib/line/handlers/admin.handlers.ts', code);
  console.log('✅ admin.handlers.ts updated');
}

// ============ FIX messages.en import in handlers ============
for (const file of ['src/lib/line/handlers/admin.handlers.ts', 'src/lib/line/handlers/user.handlers.ts']) {
  let code = fs.readFileSync(file, 'utf-8');

  // Check if messages.en import is already present
  if (!code.includes("messages.en")) {
    code = code.replace(
      /import \* as msgTh from '@\/lib\/line\/messages';\nimport \* as msgEs from '@\/lib\/line\/messages.es';\n\nconst getMsg = \(context: any\) => context\?\.lang === 'es' \? msgEs : msgTh;/,
      `import * as msgTh from '@/lib/line/messages';
import * as msgEs from '@/lib/line/messages.es';
import * as msgEn from '@/lib/line/messages.en';

const getMsg = (context: any) => 
  context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);`
    );
    fs.writeFileSync(file, code);
    console.log(`✅ ${file} - English import added`);
  } else {
    // Update existing getMsg to include english
    code = code.replace(
      /const getMsg = \(context: any\) => context\?\.lang === 'es' \? msgEs : msgTh;/,
      `const getMsg = (context: any) => 
  context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);`
    );
    fs.writeFileSync(file, code);
    console.log(`✅ ${file} - getMsg updated`);
  }
}

console.log('\n🎉 All handlers updated with English support!');
