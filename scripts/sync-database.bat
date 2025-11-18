@echo off
chcp 65001 >nul

echo ================================================================
echo 数据库同步脚本 - 从云服务器同步到本地
echo ================================================================
echo.

REM 读取.env文件获取数据库配置
set "ENV_FILE=.env"
if not exist "%ENV_FILE%" (
    echo [错误] 找不到 .env 文件
    pause
    exit /b 1
)

echo [1/5] 正在读取数据库配置...

REM 使用临时文件存储过滤后的配置
findstr /b "DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD DB_LOCAL" "%ENV_FILE%" > temp_config.txt

REM 读取配置
for /f "tokens=1,* delims==" %%a in (temp_config.txt) do (
    if "%%a"=="DB_HOST" set "REMOTE_HOST=%%b"
    if "%%a"=="DB_PORT" set "REMOTE_PORT=%%b"
    if "%%a"=="DB_NAME" set "REMOTE_DB=%%b"
    if "%%a"=="DB_USER" set "REMOTE_USER=%%b"
    if "%%a"=="DB_PASSWORD" set "REMOTE_PASSWORD=%%b"

    if "%%a"=="DB_LOCAL_HOST" set "LOCAL_HOST=%%b"
    if "%%a"=="DB_LOCAL_PORT" set "LOCAL_PORT=%%b"
    if "%%a"=="DB_LOCAL_NAME" set "LOCAL_DB=%%b"
    if "%%a"=="DB_LOCAL_USER" set "LOCAL_USER=%%b"
    if "%%a"=="DB_LOCAL_PASSWORD" set "LOCAL_PASSWORD=%%b"
)

REM 删除临时文件
del temp_config.txt

echo    云服务器: %REMOTE_HOST%:%REMOTE_PORT%/%REMOTE_DB%
echo    本地数据库: %LOCAL_HOST%:%LOCAL_PORT%/%LOCAL_DB%
echo.

REM 设置备份文件路径
set "BACKUP_FILE=129club_sync_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql"
set "BACKUP_FILE=%BACKUP_FILE: =0%"

echo [2/5] 从云服务器导出数据库...
echo    导出到: %BACKUP_FILE%
mysqldump -h %REMOTE_HOST% -P %REMOTE_PORT% -u %REMOTE_USER% -p%REMOTE_PASSWORD% --no-tablespaces --single-transaction %REMOTE_DB% > "%BACKUP_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [错误] 数据库导出失败
    pause
    exit /b 1
)
echo    成功导出
echo.

REM 检查文件大小
for %%A in ("%BACKUP_FILE%") do set "FILE_SIZE=%%~zA"
if %FILE_SIZE% lss 1024 (
    echo [错误] 导出的SQL文件太小，可能导出失败
    pause
    exit /b 1
)
echo    文件大小: %FILE_SIZE% 字节
echo.

echo [3/5] 备份本地数据库（可选）...
set "LOCAL_BACKUP=local_backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql"
set "LOCAL_BACKUP=%LOCAL_BACKUP: =0%"

choice /C YN /M "是否备份本地数据库"
if %errorlevel%==2 (
    echo    跳过本地备份
) else (
    echo    备份到: %LOCAL_BACKUP%
    mysqldump -h %LOCAL_HOST% -P %LOCAL_PORT% -u %LOCAL_USER% -p%LOCAL_PASSWORD% --no-tablespaces %LOCAL_DB% > "%LOCAL_BACKUP%" 2>&1
    if %errorlevel%==0 (
        echo    本地备份成功
    ) else (
        echo    本地备份失败（可能数据库不存在，继续执行）
    )
)
echo.

echo [4/5] 导入数据到本地数据库...
echo    目标数据库: %LOCAL_DB%
mysql -h %LOCAL_HOST% -P %LOCAL_PORT% -u %LOCAL_USER% -p%LOCAL_PASSWORD% %LOCAL_DB% < "%BACKUP_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [错误] 数据库导入失败
    pause
    exit /b 1
)
echo    导入成功
echo.

echo [5/5] 验证数据...
mysql -h %LOCAL_HOST% -P %LOCAL_PORT% -u %LOCAL_USER% -p%LOCAL_PASSWORD% -e "USE %LOCAL_DB%; SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'teams', COUNT(*) FROM teams UNION ALL SELECT 'matches', COUNT(*) FROM matches UNION ALL SELECT 'seasons', COUNT(*) FROM seasons;" 2>&1

echo.
echo ================================================================
echo 同步完成！
echo ================================================================
echo.
echo 文件信息:
echo   - 云端导出: %BACKUP_FILE%
if exist "%LOCAL_BACKUP%" (
    echo   - 本地备份: %LOCAL_BACKUP%
)
echo.
echo 提示: 备份文件保存在当前目录，可以删除或移动到备份文件夹
echo.
pause
