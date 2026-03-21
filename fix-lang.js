const fs = require('fs');

function fixFile(filePath, isUser) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  // Replace import
  code = code.replace(
    /import \* as msg from '@\/lib\/line\/messages';/,
    "import * as msgTh from '@/lib/line/messages';\nimport * as msgEs from '@/lib/line/messages.es';\n\nconst getMsg = (context: any) => context?.lang === 'es' ? msgEs : msgTh;"
  );
  
  // Fix context missing in some functions in user.handlers.ts
  if (isUser) {
    code = code.replace(/export async function handleGrupos\(\): Promise<HandlerResult> \{/g, 'export async function handleGrupos(context: HandlerContext): Promise<HandlerResult> {');
    code = code.replace(/export async function handleAyuda\(\): Promise<HandlerResult> \{/g, 'export async function handleAyuda(context: HandlerContext): Promise<HandlerResult> {');
    code = code.replace(/return handleGrupos\(\);/g, 'return handleGrupos(context);');
    code = code.replace(/return handleAyuda\(\);/g, 'return handleAyuda(context);');
  }
  
  // Replace msg. calls with getMsg(context).
  code = code.replace(/msg\./g, 'getMsg(context).');
  
  // Add lang property to Context exported types if not present
  if (isUser) {
    code = code.replace(/export interface HandlerContext \{/, 'export interface HandlerContext {\n  lang?: "es" | "th";');
  } else {
    code = code.replace(/export interface AdminHandlerContext \{/, 'export interface AdminHandlerContext {\n  lang?: "es" | "th";');
  }

  // Admin handleBorrarEvento and others might use msg in an inner scope without context? No, context is always passed!
  fs.writeFileSync(filePath, code);
}

fixFile('src/lib/line/handlers/admin.handlers.ts', false);
fixFile('src/lib/line/handlers/user.handlers.ts', true);
