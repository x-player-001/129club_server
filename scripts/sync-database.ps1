# 数据库同步脚本 - PowerShell 版本
# 从云服务器同步到本地

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "数据库同步脚本 - 从云服务器同步到本地" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 读取 .env 文件
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "[错误] 找不到 .env 文件" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[1/5] 正在读取数据库配置..." -ForegroundColor Yellow

# 解析 .env 文件
$config = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $config[$key] = $value
    }
}

$remoteHost = $config['DB_HOST']
$remotePort = $config['DB_PORT']
$remoteDb = $config['DB_NAME']
$remoteUser = $config['DB_USER']
$remotePassword = $config['DB_PASSWORD']

$localHost = $config['DB_LOCAL_HOST']
$localPort = $config['DB_LOCAL_PORT']
$localDb = $config['DB_LOCAL_NAME']
$localUser = $config['DB_LOCAL_USER']
$localPassword = $config['DB_LOCAL_PASSWORD']

Write-Host "   云服务器: $remoteHost`:$remotePort/$remoteDb" -ForegroundColor Gray
Write-Host "   本地数据库: $localHost`:$localPort/$localDb" -ForegroundColor Gray
Write-Host ""

# 设置备份文件路径
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "129club_sync_$timestamp.sql"

Write-Host "[2/5] 从云服务器导出数据库..." -ForegroundColor Yellow
Write-Host "   导出到: $backupFile" -ForegroundColor Gray

$mysqldumpCmd = "mysqldump -h $remoteHost -P $remotePort -u $remoteUser -p$remotePassword --no-tablespaces --single-transaction $remoteDb"
Invoke-Expression "$mysqldumpCmd > `"$backupFile`" 2>&1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 数据库导出失败" -ForegroundColor Red
    pause
    exit 1
}

# 检查文件大小
$fileSize = (Get-Item $backupFile).Length
if ($fileSize -lt 1024) {
    Write-Host "[错误] 导出的SQL文件太小，可能导出失败" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "   成功导出 (文件大小: $fileSize 字节)" -ForegroundColor Green
Write-Host ""

# 备份本地数据库
Write-Host "[3/5] 备份本地数据库（可选）..." -ForegroundColor Yellow
$response = Read-Host "   是否备份本地数据库? (Y/N)"

if ($response -eq 'Y' -or $response -eq 'y') {
    $localBackup = "local_backup_$timestamp.sql"
    Write-Host "   备份到: $localBackup" -ForegroundColor Gray

    $mysqldumpLocalCmd = "mysqldump -h $localHost -P $localPort -u $localUser -p$localPassword --no-tablespaces $localDb"
    Invoke-Expression "$mysqldumpLocalCmd > `"$localBackup`" 2>&1"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "   本地备份成功" -ForegroundColor Green
    } else {
        Write-Host "   本地备份失败（可能数据库不存在，继续执行）" -ForegroundColor Yellow
    }
} else {
    Write-Host "   跳过本地备份" -ForegroundColor Gray
}
Write-Host ""

# 导入数据到本地
Write-Host "[4/5] 导入数据到本地数据库..." -ForegroundColor Yellow
Write-Host "   目标数据库: $localDb" -ForegroundColor Gray

$mysqlCmd = "mysql -h $localHost -P $localPort -u $localUser -p$localPassword $localDb"
Get-Content $backupFile | & mysql -h $localHost -P $localPort -u $localUser -p$localPassword $localDb 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 数据库导入失败" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "   导入成功" -ForegroundColor Green
Write-Host ""

# 验证数据
Write-Host "[5/5] 验证数据..." -ForegroundColor Yellow
$verifyQuery = "USE $localDb; SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'teams', COUNT(*) FROM teams UNION ALL SELECT 'matches', COUNT(*) FROM matches UNION ALL SELECT 'seasons', COUNT(*) FROM seasons;"
mysql -h $localHost -P $localPort -u $localUser -p$localPassword -e $verifyQuery 2>&1

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "同步完成！" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "文件信息:" -ForegroundColor White
Write-Host "  - 云端导出: $backupFile" -ForegroundColor Gray
if (Test-Path $localBackup) {
    Write-Host "  - 本地备份: $localBackup" -ForegroundColor Gray
}
Write-Host ""
Write-Host "提示: 备份文件保存在当前目录，可以删除或移动到备份文件夹" -ForegroundColor Yellow
Write-Host ""
pause
