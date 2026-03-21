$path = "d:\Proyectos\FootLineBot\src\lib\line\handlers\admin.handlers.ts"
$c = Get-Content -Raw -Encoding UTF8 $path

# Fix Crear Evento Format
$old1 = 'message: `⚠️ \*Formato incorrecto\*[\s\S]*?equipos\]`'
$new1 = 'message: getMsg(context).adminInvalidFormatMessage(context.lang === "en" ? "create_event" : (context.lang === "es" ? "crear_evento" : "สร้าง"), "[fecha] [hora] [duracion] [min_partido] [equipos]")'
$c = [Regex]::Replace($c, $old1, $new1)

# Fix Configurar Format
$old2 = 'message: `⚠️ \*Formato incorrecto\*[\s\S]*?Ejemplo: !configurar 7`'
$new2 = 'message: getMsg(context).adminInvalidFormatMessage(context.lang === "en" ? "config" : (context.lang === "es" ? "configurar" : "ตั้งค่า"), "[5|7|11]")'
$c = [Regex]::Replace($c, $old2, $new2)

# Fix Configurar Success
$old3 = 'message: `✅ \*Configuración actualizada\*[\s\S]*?nuevos eventos creados\.`'
$new3 = 'message: getMsg(context).adminConfigUpdatedMessage(gameType)'
$c = [Regex]::Replace($c, $old3, $new3)

$c | Set-Content -Encoding UTF8 $path
Write-Host "Admin handlers localized via PowerShell Regex"
