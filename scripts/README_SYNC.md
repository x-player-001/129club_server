# 数据库同步指南

## 从远程服务器同步数据到本地

### Windows 系统

在 `scripts` 目录下打开命令行，按顺序执行：

```bash
# 1. 导出远程数据库
mysqldump -h 106.53.217.216 -u 129club -p559439Mysql 129club > 129club_remote_sync.sql

# 2. 备份本地数据库（可选）
mysqldump -u root -p559439Mysql 129club > 129club_local_backup.sql

# 3. 删除并重建本地数据库
mysql -u root -p559439Mysql -e "DROP DATABASE IF EXISTS 129club; CREATE DATABASE 129club DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. 导入远程数据到本地
mysql -u root -p559439Mysql 129club < 129club_remote_sync.sql

echo "同步完成！"
```

### 或者直接运行脚本

```bash
# Windows
cd scripts
sync-from-remote.bat

# Linux/Mac
cd scripts
chmod +x sync-from-remote.sh
./sync-from-remote.sh
```

## 从本地同步数据到远程服务器（谨慎使用！）

```bash
# 1. 导出本地数据库
mysqldump -u root -p559439Mysql 129club > 129club_local_export.sql

# 2. 备份远程数据库
mysqldump -h 106.53.217.216 -u 129club -p559439Mysql 129club > 129club_remote_backup.sql

# 3. 导入到远程服务器
mysql -h 106.53.217.216 -u 129club -p559439Mysql 129club < 129club_local_export.sql
```

## 注意事项

1. 同步前请确保已备份重要数据
2. 同步会**完全覆盖**目标数据库
3. 建议在低峰期执行同步操作
4. 同步完成后重启应用服务
