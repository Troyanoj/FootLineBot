const fs = require('fs');
const path = 'src/lib/line/handlers/user.handlers.ts';
let code = fs.readFileSync(path, 'utf-8');

// Fix the literal '\n' characters I accidentally inserted
code = code.replace(/case 'register':\\n    case 'ลงทะเบียน':/g, "case 'register':\n    case 'ลงทะเบียน':");
code = code.replace(/case 'help':\\n    case 'ช่วย':/g, "case 'help':\n    case 'ช่วย':");

fs.writeFileSync(path, code);
console.log('Fixed literal newlines.');
