#!/bin/bash

echo "================================================================"
echo "数据库同步脚本 - 从云服务器同步到本地"
echo "================================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查.env文件
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}[错误] 找不到 .env 文件${NC}"
    exit 1
fi

echo "[1/5] 正在读取数据库配置..."

# 读取配置
export $(grep -v '^#' $ENV_FILE | xargs)

REMOTE_HOST=${DB_HOST}
REMOTE_PORT=${DB_PORT}
REMOTE_DB=${DB_NAME}
REMOTE_USER=${DB_USER}
REMOTE_PASSWORD=${DB_PASSWORD}

LOCAL_HOST=${DB_LOCAL_HOST}
LOCAL_PORT=${DB_LOCAL_PORT}
LOCAL_DB=${DB_LOCAL_NAME}
LOCAL_USER=${DB_LOCAL_USER}
LOCAL_PASSWORD=${DB_LOCAL_PASSWORD}

echo "   云服务器: ${REMOTE_HOST}:${REMOTE_PORT}/${REMOTE_DB}"
echo "   本地数据库: ${LOCAL_HOST}:${LOCAL_PORT}/${LOCAL_DB}"
echo ""

# 设置备份文件路径
BACKUP_FILE="129club_sync_$(date +%Y%m%d_%H%M%S).sql"

echo "[2/5] 从云服务器导出数据库..."
echo "   导出到: ${BACKUP_FILE}"

mysqldump -h ${REMOTE_HOST} -P ${REMOTE_PORT} -u ${REMOTE_USER} -p${REMOTE_PASSWORD} \
    --no-tablespaces --single-transaction ${REMOTE_DB} > "${BACKUP_FILE}" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}[错误] 数据库导出失败${NC}"
    exit 1
fi

echo -e "   ${GREEN}✓ 导出成功${NC}"
echo ""

# 检查文件大小
FILE_SIZE=$(stat -f%z "${BACKUP_FILE}" 2>/dev/null || stat -c%s "${BACKUP_FILE}" 2>/dev/null)
if [ ${FILE_SIZE} -lt 1024 ]; then
    echo -e "${RED}[错误] 导出的SQL文件太小，可能导出失败${NC}"
    exit 1
fi

echo "   文件大小: ${FILE_SIZE} 字节"
echo ""

echo "[3/5] 备份本地数据库（可选）..."
LOCAL_BACKUP="local_backup_$(date +%Y%m%d_%H%M%S).sql"

read -p "是否备份本地数据库? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   备份到: ${LOCAL_BACKUP}"
    mysqldump -h ${LOCAL_HOST} -P ${LOCAL_PORT} -u ${LOCAL_USER} -p${LOCAL_PASSWORD} \
        --no-tablespaces ${LOCAL_DB} > "${LOCAL_BACKUP}" 2>&1

    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✓ 本地备份成功${NC}"
    else
        echo -e "   ${YELLOW}⚠ 本地备份失败（可能数据库不存在，继续执行）${NC}"
    fi
else
    echo "   跳过本地备份"
fi
echo ""

echo "[4/5] 导入数据到本地数据库..."
echo "   目标数据库: ${LOCAL_DB}"

mysql -h ${LOCAL_HOST} -P ${LOCAL_PORT} -u ${LOCAL_USER} -p${LOCAL_PASSWORD} \
    ${LOCAL_DB} < "${BACKUP_FILE}" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}[错误] 数据库导入失败${NC}"
    exit 1
fi

echo -e "   ${GREEN}✓ 导入成功${NC}"
echo ""

echo "[5/5] 验证数据..."
mysql -h ${LOCAL_HOST} -P ${LOCAL_PORT} -u ${LOCAL_USER} -p${LOCAL_PASSWORD} -e \
    "USE ${LOCAL_DB};
    SELECT 'users' as table_name, COUNT(*) as count FROM users
    UNION ALL SELECT 'teams', COUNT(*) FROM teams
    UNION ALL SELECT 'matches', COUNT(*) FROM matches
    UNION ALL SELECT 'seasons', COUNT(*) FROM seasons;" 2>&1

echo ""
echo "================================================================"
echo -e "${GREEN}同步完成！${NC}"
echo "================================================================"
echo ""
echo "文件信息:"
echo "  - 云端导出: ${BACKUP_FILE}"
if [ -f "${LOCAL_BACKUP}" ]; then
    echo "  - 本地备份: ${LOCAL_BACKUP}"
fi
echo ""
echo "提示: 备份文件保存在当前目录，可以删除或移动到备份文件夹"
echo ""
