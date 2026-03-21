$path = "d:\Proyectos\FootLineBot\src\lib\line\handlers\admin.handlers.ts"
$c = Get-Content -Raw -Encoding UTF8 $path

# 1. Replace handleCrearEvento Format Error
$regex1 = 'if \(args\.length < 2\) \{[\s\S]*?message: .*?\*Formato incorrecto\*[\s\S]*?equipos\]`[\s\S]*?\};[\s\S]*?\}'
$replacement1 = 'if (args.length < 2) {
      const lang = context.lang || "th";
      const cmd = lang === "es" ? "crear_evento" : (lang === "en" ? "create_event" : "สร้าง");
      const example = "[fecha] [hora] [duracion] [min_partido] [equipos]";
      return {
        success: false,
        message: getMsg(context).adminInvalidFormatMessage(cmd, example),
      };
    }'
$c = $c -replace $regex1, $replacement1

# 2. Replace handleConfigurar Format Error
$regex2 = 'if \(args\.length === 0\) \{[\s\S]*?message: .*?\*Formato incorrecto\*[\s\S]*?configurar 7`[\s\S]*?\};[\s\S]*?\}'
$replacement2 = 'if (args.length === 0) {
      const lang = context.lang || "th";
      const cmd = lang === "es" ? "configurar" : (lang === "en" ? "config" : "ตั้งค่า");
      return {
        success: false,
        message: getMsg(context).adminInvalidFormatMessage(cmd, "[5|7|11]"),
      };
    }'
$c = $c -replace $regex2, $replacement2

# 3. Replace handleConfigurar Success
$regex3 = 'return \{[\s\S]*?message: .*?Configuración actualizada[\s\S]*?eventos creados\.`[\s\S]*?\};'
$replacement3 = 'return {
      success: true,
      message: getMsg(context).adminConfigUpdatedMessage(gameType),
    };'
$c = $c -replace $regex3, $replacement3

$c | Set-Content -Encoding UTF8 $path
Write-Host "Admin handlers localized via PowerShell"
