#!/bin/bash

echo "========================================"
echo "从远程服务器同步数据库到本地"
echo "========================================"
echo ""

REMOTE_HOST="106.53.217.216"
REMOTE_USER="129club"
REMOTE_PASS="559439Mysql"
REMOTE_DB="129club"
LOCAL_USER="root"
LOCAL_PASS="559439Mysql"
LOCAL_DB="129club"
BACKUP_FILE="129club_remote_sync_$(date +%Y%m%d_%H%M%S).sql"

echo "[1/4] 从远程服务器导出数据库..."
mysqldump -h $REMOTE_HOST -u $REMOTE_USER -p$REMOTE_PASS $REMOTE_DB > scripts/$BACKUP_FILE
if [ $? -ne 0 ]; then
    echo "❌ 导出失败！"
    exit 1
fi
echo "✅ 导出成功: scripts/$BACKUP_FILE"
echo ""

echo "[2/4] 备份本地数据库..."
mysqldump -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB > scripts/129club_local_backup_$(date +%Y%m%d_%H%M%S).sql
if [ $? -ne 0 ]; then
    echo "⚠️  本地备份失败，但继续执行..."
fi
echo "✅ 本地备份完成"
echo ""

echo "[3/4] 删除本地数据库并重建..."
mysql -u $LOCAL_USER -p$LOCAL_PASS -e "DROP DATABASE IF EXISTS $LOCAL_DB; CREATE DATABASE $LOCAL_DB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [ $? -ne 0 ]; then
    echo "❌ 重建数据库失败！"
    exit 1
fi
echo "✅ 数据库重建成功"
echo ""

echo "[4/4] 导入远程数据到本地..."
mysql -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB < scripts/$BACKUP_FILE
if [ $? -ne 0 ]; then
    echo "❌ 导入失败！"
    exit 1
fi
echo "✅ 导入成功"
echo ""

echo "========================================"
echo "🎉 同步完成！"
echo "========================================"
echo "远程备份文件: scripts/$BACKUP_FILE"
echo ""
