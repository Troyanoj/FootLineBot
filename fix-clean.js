const fs = require('fs');

for (const file of ['src/lib/line/handlers/admin.handlers.ts', 'src/lib/line/handlers/user.handlers.ts']) {
  console.log('\n--- Fixing', file, '---');
  let code = fs.readFileSync(file, 'utf-8');

  // 1. Remove any duplicate lang field (e.g. lang?: "es" | "en" | "th";|lang?: "es" | "en" | "th";)
  code = code.replace(/lang\?: \"es\" \| \"en\" \| \"th\";?\|lang\?: \"es\" \| \"en\" \| \"th\";?/g, 'lang?: "es" | "en" | "th";');

  // 2. Fix the import block — remove existing scattered imports and rebuild clean
  // Remove everything between first line comment and 'import type' line to rebuild
  const interfaceName = file.includes('admin') ? 'AdminHandlerContext' : 'HandlerContext';
  
  // Build the clean import block
  const cleanImportBlock = `import * as msgTh from '@/lib/line/messages';
import * as msgEs from '@/lib/line/messages.es';
import * as msgEn from '@/lib/line/messages.en';

const getMsg = (context: any) =>
  context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);`;

  // Remove all variations of the import block (could be LF or CRLF mixed)
  code = code.replace(/import \* as msgTh from '@\/lib\/line\/messages'[^\n]*\n?[^\n]*msgEs[^\n]*\n?([^\n]*msgEn[^\n]*\n?)?[^\n]*\n?const getMsg[^\n]*/g, '');
  
  // Also remove orphaned getMsg line if still present
  code = code.replace(/^const getMsg[^\n]*\n?/gm, '');
  
  // Remove orphaned import msgEn line
  code = code.replace(/^import \* as msgEn[^\n]*\n?/gm, '');
  // Remove orphaned import msgEs line
  code = code.replace(/^import \* as msgEs[^\n]*\n?/gm, '');
  // Remove orphaned import msgTh line
  code = code.replace(/^import \* as msgTh[^\n]*\n?/gm, '');

  // 3. Remove duplicate lang fields in interfaces (the |lang? pattern)
  code = code.replace(/lang\?:[^;]+;?\|lang\?:[^;\r\n]+/g, 'lang?: "es" | "en" | "th";');
  // Remove lone duplicate lang? lines if they appear twice
  code = code.replace(/(  lang\?: "es" \| "en" \| "th";\r?\n)\s*lang\?: "es" \| "th";\r?\n/g, '$1');
  code = code.replace(/(  lang\?: "es" \| "th";\r?\n)\s*lang\?: "es" \| "en" \| "th";\r?\n/g, '  lang?: "es" | "en" | "th";\r\n');

  // 4. Insert clean import block right before 'import type' line
  code = code.replace(/(import type {)/, cleanImportBlock + '\r\nimport type {');

  // 5. Fix the interface to have exactly one lang field
  const ifaceRegex = new RegExp(`(export interface ${interfaceName} \\{)([^}]*?)(})`, 's');
  code = code.replace(ifaceRegex, (match, open, body, close) => {
    // Remove all lang? lines from body
    let cleaned = body.replace(/\s*lang\?[^\r\n]*\r?\n/g, '\r\n');
    // Add lang field as first field
    return `${open}\r\n  lang?: "es" | "en" | "th";${cleaned}${close}`;
  });

  fs.writeFileSync(file, code);
  console.log('✅', file, 'fixed');
}
