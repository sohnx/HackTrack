# Built-in Windows Task Scheduler setup - no third-party tools.

$root = "D:\Projects\hacktrack"

$backendAction  = New-ScheduledTaskAction -Execute "$root\backend\start-backend-service.bat" -WorkingDirectory "$root\backend"
$frontendAction = New-ScheduledTaskAction -Execute "$root\frontend\start-frontend-service.bat" -WorkingDirectory "$root\frontend"

$trigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet `
    -Hidden `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Days 0) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName "HackTrackBackend" -Action $backendAction -Trigger $trigger -Settings $settings -RunLevel Highest -Force
Register-ScheduledTask -TaskName "HackTrackFrontend" -Action $frontendAction -Trigger $trigger -Settings $settings -RunLevel Highest -Force

Start-ScheduledTask -TaskName "HackTrackBackend"
Start-ScheduledTask -TaskName "HackTrackFrontend"

Write-Host ""
Write-Host "Done. HackTrack now starts hidden every time you log into Windows."
Write-Host "No windows, no Alt-Tab clutter. Logs are in backend\logs and frontend\logs."
Write-Host "Manage it anytime via Task Scheduler (taskschd.msc) -> look for HackTrackBackend / HackTrackFrontend."
