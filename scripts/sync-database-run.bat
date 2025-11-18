@echo off
REM PowerShell 脚本启动器
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "%~dp0sync-database.ps1"
pause
