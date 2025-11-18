# 数据库脚本使用说明

## 1. 数据库同步脚本

### sync-database.bat (Windows)

一键从云服务器同步数据库到本地。

**使用方法:**
```bash
# 在项目根目录执行
cd d:\Code\MiniProgram\129club\129club_server
scripts\sync-database.bat
```

**功能:**
1. 自动读取 `.env` 文件中的数据库配置
2. 从云服务器导出数据库
3. 可选备份本地数据库
4. 导入数据到本地
5. 验证数据完整性

**注意事项:**
- 需要在项目根目录运行（因为要读取.env文件）
- 确保本地MySQL服务已启动
- 备份文件会保存在当前目录

---

### sync-database.sh (Linux/Mac)

功能与Windows版本相同。

**使用方法:**
```bash
# 在项目根目录执行
cd /path/to/129club_server
chmod +x scripts/sync-database.sh  # 首次使用需要添加执行权限
./scripts/sync-database.sh
```

---

## 2. 队伍成员更新脚本

### update-team-members.sql

更新已确认球员的队伍信息（基于 `tests/confirmed_players.json`）。

**使用方法:**
```bash
# Windows
mysql -h localhost -P 3306 -u root -p559439Mysql 129club < scripts\update-team-members.sql

# Linux/Mac
mysql -h localhost -P 3306 -u root -p559439Mysql 129club < scripts/update-team-members.sql
```

**功能:**
1. 更新 `users` 表的 `current_team_id`
2. 插入 `team_members` 表记录
3. 验证更新结果

**更新内容:**
- 嘉陵摩托队员: 16人
- 长江黄河队员: 10人

---

## 3. 清理数据脚本

### clear-user-and-match-data.sql

清空用户和比赛相关数据（保留队伍和赛季）。

**使用方法:**
```bash
mysql -h localhost -P 3306 -u root -p559439Mysql 129club < scripts\clear-user-and-match-data.sql
```

**警告:** 此操作会删除所有用户、比赛、统计数据，谨慎使用！

---

## 常见问题

### Q1: sync-database 提示找不到 .env 文件
**A:** 确保在项目根目录运行脚本，不要在 scripts 目录中运行。

### Q2: 导出/导入失败
**A:** 检查：
1. MySQL 是否已安装并添加到 PATH
2. .env 文件中的数据库配置是否正确
3. 本地 MySQL 服务是否已启动

### Q3: Windows 脚本中文乱码
**A:** 脚本已设置 UTF-8 编码（chcp 65001），如仍有问题，请检查终端编码设置。

### Q4: Linux/Mac 脚本无法执行
**A:** 运行 `chmod +x scripts/sync-database.sh` 添加执行权限。

---

## 备份文件管理

同步脚本会生成以下文件:
- `129club_sync_YYYYMMDD_HHMMSS.sql` - 云端导出的数据
- `local_backup_YYYYMMDD_HHMMSS.sql` - 本地备份（可选）

建议定期清理旧的备份文件，或移动到专门的备份目录。

---

## 脚本开发参考

如需修改或扩展脚本功能，请参考：
- `.env` - 数据库配置文件
- `tests/confirmed_players.json` - 已确认球员列表
- `tests/unconfirmed_players.json` - 未确认球员列表
