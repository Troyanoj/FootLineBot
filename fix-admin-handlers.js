const fs = require('fs');
const path = require('path');

const targetFile = 'd:\\Proyectos\\FootLineBot\\src\\lib\\line\\handlers\\admin.handlers.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. handleCrearEvento
const crearEventoRegex = /if \(args\.length < 2\) \{[\s\S]*?message: `⚠️ \*Formato incorrecto\*[\s\S]*? equipos\]`[\s\S]*?\};[\s\S]*?\}/;
const crearEventoReplacement = `if (args.length < 2) {
      const lang = context.lang || 'th';
      const cmd = lang === 'es' ? 'crear_evento' : (lang === 'en' ? 'create_event' : 'สร้าง');
      const example = "[fecha] [hora] [duracion] [min_partido] [equipos]";
      return {
        success: false,
        message: getMsg(context).adminInvalidFormatMessage(cmd, example),
      };
    }`;

content = content.replace(crearEventoRegex, crearEventoReplacement);

// 2. handleConfigurar
const configRegex = /if \(args\.length === 0\) \{[\s\S]*?message: `⚠️ \*Formato incorrecto\*[\s\S]*?Ejemplo: !configurar 7`[\s\S]*?\};[\s\S]*?\}/;
const configReplacement = `if (args.length === 0) {
      const lang = context.lang || 'th';
      const cmd = lang === 'es' ? 'configurar' : (lang === 'en' ? 'config' : 'ตั้งค่า');
      return {
        success: false,
        message: getMsg(context).adminInvalidFormatMessage(cmd, "[5|7|11]"),
      };
    }`;

content = content.replace(configRegex, configReplacement);

// 3. handleConfigurar Success
const configSuccessRegex = /return \{[\s\S]*?message: `✅ \*Configuración actualizada\*[\s\S]*?efecto a los nuevos eventos creados\.`[\s\S]*?\};/;
const configSuccessReplacement = `return {
      success: true,
      message: getMsg(context).adminConfigUpdatedMessage(gameType),
    };`;

content = content.replace(configSuccessRegex, configSuccessReplacement);

fs.writeFileSync(targetFile, content);
console.log('Fixed admin handlers localization');
