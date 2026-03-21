$path = "d:\Proyectos\FootLineBot\src\lib\line\handlers\user.handlers.ts"
$c = Get-Content -Raw -Encoding UTF8 $path

$regex = 'case ''start'':\s*return handleStart\(context\);'
$replacement = "case 'start':
      return handleStart(context);
    
    case 'setup':
    case 'iniciar':
    case 'config_group':
      return handleRegisterGroup(context);"

$c = $c -replace $regex, $replacement
$c | Set-Content -Encoding UTF8 $path
Write-Host "Updated handleUserCommand via PowerShell"
