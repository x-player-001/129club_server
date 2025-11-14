# 访问记录功能说明

## 功能概述

访问记录功能用于跟踪用户进入小程序的行为，包括访问时间、访问次数、设备信息、场景值等。采用**混合方案**实现：

1. **轻量级统计** - 在 `users` 表中存储快速访问字段：
   - `last_visit_at`: 最后访问时间
   - `visit_count`: 累计访问次数

2. **详细日志** - 在 `user_visit_logs` 表中存储详细访问记录：
   - 访问时间戳
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

或者手动执行 SQL：

```sql
-- 添加用户表字段
ALTER TABLE `users`
ADD COLUMN `last_visit_at` TIMESTAMP NULL COMMENT '最后访问时间',
ADD COLUMN `visit_count` INT UNSIGNED DEFAULT 0 COMMENT '累计访问次数';

-- 创建访问日志表
CREATE TABLE `user_visit_logs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `visit_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `visit_date` DATE NOT NULL,
  `platform` VARCHAR(20) NULL COMMENT '平台（iOS/Android/devtools）',
  `app_version` VARCHAR(20) NULL,
  `scene` INT NULL COMMENT '场景值',
  `ip_address` VARCHAR(50) NULL,
  `device_model` VARCHAR(50) NULL,
  `system_version` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_visit_date` (`visit_date`),
  INDEX `idx_visit_time` (`visit_time`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户访问日志表';
```

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

### Q: 为什么需要同时记录 users 表和 user_visit_logs 表？

A: 混合方案兼顾性能和功能：
- `users` 表字段用于快速查询最后访问时间和总访问次数
- `user_visit_logs` 表用于详细分析（时间趋势、设备分布、场景分析）

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

## 更新日志

- **2025-01-20**: 初始版本实现，包含访问记录、统计查询、活跃用户分析功能
