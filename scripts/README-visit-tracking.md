# 访问记录功能说明

## 功能概述

访问记录功能用于跟踪用户进入小程序的行为，包括访问时间、访问次数、设备信息、场景值等。

## 设计方案

采用**纯日志方案**，所有数据存储在 `user_visit_logs` 表中：

- ✅ 数据单一来源，避免不一致
- ✅ 永久保留所有访问记录
- ✅ 所有统计通过聚合查询实时计算
- ✅ 支持详细分析：按日期、平台、场景等维度

**表结构**：
- 访问时间戳和日期
- 平台信息（iOS/Android/devtools）
- 小程序版本号
- 场景值（从哪里进入）
- 设备型号和系统版本
- IP地址

## 数据库部署

### 1. 执行数据库迁移

```bash
# 在MySQL中执行以下SQL文件
mysql -u root -p 129club < scripts/add-visit-tracking.sql
```

**说明**：
- 迁移脚本会自动创建 `user_visit_logs` 表
- 不会修改 `users` 表，保持表结构简洁
- 外键使用 `utf8mb4_0900_ai_ci` 字符集，与现有数据库一致

### 2. 验证部署

启动服务器后，可以通过健康检查接口验证：

```bash
curl http://localhost:3000/health
```

## API接口

### 1. 记录访问

```http
POST /api/visit/record
Authorization: Bearer {token}
Content-Type: application/json

{
  "platform": "ios",
  "appVersion": "1.0.0",
  "scene": 1001,
  "deviceModel": "iPhone 13",
  "systemVersion": "iOS 15.0"
}
```

### 2. 查询个人访问统计

```http
GET /api/visit/stats?days=30
Authorization: Bearer {token}
```

返回：
- 总访问次数
- 最后访问时间
- 最近7天/30天访问次数
- 每日访问统计
- 访问日志列表

### 3. 查询活跃用户（管理员）

```http
GET /api/visit/active-users?days=7&limit=20
Authorization: Bearer {token}
```

返回：
- 活跃用户总数
- 今日活跃用户数
- 活跃用户列表（按访问次数排序）

## 小程序集成

在小程序 `app.js` 中添加以下代码：

```javascript
App({
  onLaunch: function(options) {
    // 登录后记录访问
    this.recordVisit(options);
  },

  recordVisit: function(options) {
    const token = wx.getStorageSync('token');
    if (!token) return;

    wx.getSystemInfo({
      success: (systemInfo) => {
        wx.request({
          url: 'https://your-api-domain.com/api/visit/record',
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            platform: systemInfo.platform,
            appVersion: '1.0.0',
            scene: options.scene,
            deviceModel: systemInfo.model,
            systemVersion: systemInfo.system
          }
        });
      }
    });
  }
});
```

## 数据维护

### 定期清理旧日志

为避免日志表过大，建议定期清理旧数据。可以通过 cron 任务执行：

```javascript
// 清理90天前的日志
const visitService = require('./src/services/visit.service');
await visitService.cleanOldVisitLogs(90);
```

或直接执行 SQL：

```sql
DELETE FROM user_visit_logs
WHERE visit_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY);
```

### 查询活跃度趋势

```sql
-- 最近30天每日访问趋势
SELECT
  visit_date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_visits
FROM user_visit_logs
WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY visit_date
ORDER BY visit_date DESC;

-- 平台分布
SELECT
  platform,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_visits
FROM user_visit_logs
WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY platform;

-- 场景值分布
SELECT
  scene,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_visits
FROM user_visit_logs
WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY scene
ORDER BY total_visits DESC;
```

## 性能优化建议

1. **索引优化**：已在 `user_id`、`visit_date`、`visit_time` 上创建索引
2. **分区表**：如果数据量很大，可以按月分区：
   ```sql
   ALTER TABLE user_visit_logs
   PARTITION BY RANGE (TO_DAYS(visit_date)) (
     PARTITION p202501 VALUES LESS THAN (TO_DAYS('2025-02-01')),
     PARTITION p202502 VALUES LESS THAN (TO_DAYS('2025-03-01')),
     ...
   );
   ```
3. **异步处理**：访问记录是非关键路径，可以考虑使用消息队列异步处理
4. **缓存优化**：将活跃用户统计结果缓存5-10分钟

## 常见问题

### Q: 为什么使用纯日志方案而不是在 users 表添加字段？

A: 纯日志方案的优势：
- ✅ 数据单一来源，不会出现不一致
- ✅ 永久保留所有记录，可以回溯任意时间段的数据
- ✅ 支持复杂分析：平台分布、场景分析、时间趋势等
- ✅ 表结构简洁，users 表不膨胀

性能方面：
- 通过 `user_id`、`visit_date`、`visit_time` 索引优化查询
- 聚合查询在合理数据量下性能良好
- 如需极致性能，可使用 Redis 缓存统计结果

### Q: 如何防止重复记录？

A: 当前实现每次 onLaunch 都会记录。如需防止短时间内重复记录，可以在小程序端添加节流：

```javascript
recordVisit: function(options) {
  const lastRecordTime = wx.getStorageSync('lastVisitRecordTime') || 0;
  const now = Date.now();

  // 5分钟内不重复记录
  if (now - lastRecordTime < 5 * 60 * 1000) {
    return;
  }

  // ... 执行记录 ...

  wx.setStorageSync('lastVisitRecordTime', now);
}
```

### Q: 如何统计日活跃用户（DAU）？

A: 使用以下查询：

```sql
SELECT COUNT(DISTINCT user_id) as dau
FROM user_visit_logs
WHERE visit_date = CURDATE();
```

或通过 API：

```javascript
const stats = await visitService.getActiveUsersStats({ days: 1 });
console.log('今日活跃用户数:', stats.todayActiveCount);
```

## 文件清单

- `scripts/add-visit-tracking.sql` - 数据库迁移脚本
- `src/models/UserVisitLog.js` - Sequelize模型
- `src/services/visit.service.js` - 业务逻辑
- `src/controllers/visit.controller.js` - 控制器
- `src/routes/visit.js` - 路由定义
- `API文档.md` - API接口文档（第11章）

## 数据保留策略

本系统采用**永久保留**策略，不自动清理访问日志。如需手动清理，可以：

```javascript
// 通过 API 清理（需要在代码中调用）
const visitService = require('./src/services/visit.service');
await visitService.cleanOldVisitLogs(90);  // 清理90天前的日志
```

或直接执行 SQL：

```sql
-- 清理指定日期前的记录
DELETE FROM user_visit_logs WHERE visit_date < '2024-01-01';
```

**注意**：清理日志后，历史总访问次数会减少。

## 更新日志

- **2025-01-20 v2**: 简化为纯日志方案，移除 users 表冗余字段，所有统计通过聚合查询
- **2025-01-20 v1**: 初始版本实现（混合方案，已废弃）
