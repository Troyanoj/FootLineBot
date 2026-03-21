const fs = require('fs');

function addEnglish(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  // Replace the old getMsg implementation to support English
  code = code.replace(
    /import \* as msgTh from '@\/lib\/line\/messages';\nimport \* as msgEs from '@\/lib\/line\/messages.es';\n\nconst getMsg = \(context: any\) => context\?\.lang === 'es' \? msgEs : msgTh;/,
    "import * as msgTh from '@/lib/line/messages';\nimport * as msgEs from '@/lib/line/messages.es';\nimport * as msgEn from '@/lib/line/messages.en';\n\nconst getMsg = (context: any) => context?.lang === 'es' ? msgEs : (context?.lang === 'en' ? msgEn : msgTh);"
  );
  
  // Update the TS interface for HandlerContext to support 'en'
  code = code.replace(/lang\?: "es" | "th";/g, 'lang?: "es" | "en" | "th";');
  
  fs.writeFileSync(filePath, code);
}

addEnglish('src/lib/line/handlers/admin.handlers.ts');
addEnglish('src/lib/line/handlers/user.handlers.ts');
