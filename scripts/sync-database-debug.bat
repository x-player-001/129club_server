@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================================================
echo 数据库同步脚本 - 调试版本
echo ================================================================
echo.

echo 当前目录: %CD%
echo.

REM 读取.env文件获取数据库配置
set "ENV_FILE=.env"
echo 检查文件: %ENV_FILE%
if not exist "%ENV_FILE%" (
    echo [错误] 找不到 .env 文件
    echo 当前目录内容:
    dir /b
    pause
    exit /b 1
)
echo [✓] 找到 .env 文件
echo.

echo [1/5] 正在读取数据库配置...
for /f "tokens=1,2 delims==" %%a in ('type %ENV_FILE% ^| findstr /v "^#"') do (
    set "key=%%a"
    set "value=%%b"

    REM 去除空格
    set "key=!key: =!"
    set "value=!value: =!"

    echo 读取: !key! = !value!

    if "!key!"=="DB_HOST" set "REMOTE_HOST=!value!"
    if "!key!"=="DB_PORT" set "REMOTE_PORT=!value!"
    if "!key!"=="DB_NAME" set "REMOTE_DB=!value!"
    if "!key!"=="DB_USER" set "REMOTE_USER=!value!"
    if "!key!"=="DB_PASSWORD" set "REMOTE_PASSWORD=!value!"

    if "!key!"=="DB_LOCAL_HOST" set "LOCAL_HOST=!value!"
    if "!key!"=="DB_LOCAL_PORT" set "LOCAL_PORT=!value!"
    if "!key!"=="DB_LOCAL_NAME" set "LOCAL_DB=!value!"
    if "!key!"=="DB_LOCAL_USER" set "LOCAL_USER=!value!"
    if "!key!"=="DB_LOCAL_PASSWORD" set "LOCAL_PASSWORD=!value!"
)
echo.

echo 配置汇总:
echo    云服务器: %REMOTE_HOST%:%REMOTE_PORT%/%REMOTE_DB%
echo    用户: %REMOTE_USER% / %REMOTE_PASSWORD%
echo    本地数据库: %LOCAL_HOST%:%LOCAL_PORT%/%LOCAL_DB%
echo    用户: %LOCAL_USER% / %LOCAL_PASSWORD%
echo.

echo 检查 MySQL 是否可用...
where mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 找不到 mysql 命令，请确保 MySQL 已安装并添加到 PATH
    pause
    exit /b 1
)
echo [✓] MySQL 命令可用
echo.

echo 测试本地数据库连接...
mysql -h %LOCAL_HOST% -P %LOCAL_PORT% -u %LOCAL_USER% -p%LOCAL_PASSWORD% -e "SELECT 1" 2>&1
if %errorlevel% neq 0 (
    echo [错误] 无法连接本地数据库
    pause
    exit /b 1
)
echo [✓] 本地数据库连接成功
echo.

echo 测试远程数据库连接...
mysql -h %REMOTE_HOST% -P %REMOTE_PORT% -u %REMOTE_USER% -p%REMOTE_PASSWORD% -e "SELECT 1" 2>&1
if %errorlevel% neq 0 (
    echo [错误] 无法连接远程数据库
    pause
    exit /b 1
)
echo [✓] 远程数据库连接成功
echo.

echo ================================================================
echo 所有检查通过！可以继续执行同步操作
echo ================================================================
echo.
pause
