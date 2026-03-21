const fs = require('fs');
let code = fs.readFileSync('src/lib/line/handlers/admin.handlers.ts', 'utf-8');

// 1. Remove จัดทีม from handleTactica
code = code.replace(/case 'จัดทีม':\r?\n\s+case 'tactics':/g, "case 'tactics':");

// 2. Add จัดทีม to handleGenerar (if not already there from previous partial success)
if (!code.includes("case 'generate':\r\n    case 'จัดทีม':") && !code.includes("case 'generate':\n    case 'จัดทีม':")) {
  code = code.replace(/case 'generate':/g, "case 'generate':\n    case 'จัดทีม':");
}

fs.writeFileSync('src/lib/line/handlers/admin.handlers.ts', code);
console.log('Admin dispatcher cleanup complete.');
