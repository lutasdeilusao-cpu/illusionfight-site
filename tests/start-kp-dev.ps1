$ErrorActionPreference = 'Stop'
$port = 5199
$logOut = Join-Path (Get-Location) 'vite-kp-out.log'
$logErr = Join-Path (Get-Location) 'vite-kp-err.log'

$proc = Start-Process -FilePath 'powershell' -ArgumentList "-Command npm run dev '--port' $port" -NoNewWindow -PassThru -RedirectStandardOutput $logOut -RedirectStandardError $logErr
$proc.Id | Out-File (Join-Path (Get-Location) 'vite-kp.pid')
Write-Host "KP_DEV_PID=$($proc.Id)"
$proc.WaitForExit()
Write-Host "KP_DEV_EXIT=$($proc.ExitCode)"
