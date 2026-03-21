$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Trade Pro Terminal.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "c:\Users\User\Documents\Quant\trading-terminal\launch.bat"
$Shortcut.WorkingDirectory = "c:\Users\User\Documents\Quant\trading-terminal"
$Shortcut.IconLocation = "c:\Users\User\Documents\Quant\trading-terminal\public\icon.png"
$Shortcut.Description = "Professional Trading Terminal"
$Shortcut.Save()
Write-Host "Desktop shortcut created at: $ShortcutPath"
