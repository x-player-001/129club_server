# 统计数据修复说明

## 问题描述

发现统计数据存在以下问题：
1. **进球数重复统计**：李洪胜实际进3球，但统计为6球
2. **出勤率超过100%**：李洪胜等球员出勤率显示150%

## 根本原因

统计脚本使用了 `+=` 累加操作，导致重复运行时数据重复累加：

```javascript
// ❌ 原有代码（非幂等）
playerStat.matchesPlayed += 1;  // 每次运行都+1
playerStat.goals += playerStats[userId].goals || 0;  // 每次运行都累加
```

## 修复方案

### 1. 修复 `backfill-match-stats.js`

**改为幂等操作**：每次重新从数据库计算完整的统计数据

```javascript
// ✅ 修复后代码（幂等）
async function recalculatePlayerStats(userId) {
  // 查询该球员所有参与记录
  const allParticipations = await MatchParticipant.findAll({ where: { userId } });
  const allEvents = await MatchEvent.findAll({ where: { userId } });

  // 重新统计
  let totalGoals = 0;
  allEvents.forEach(event => {
    if (event.eventType === 'goal') totalGoals += 1;
  });

  // 直接赋值，不累加
  playerStat.matchesPlayed = allParticipations.length;
  playerStat.goals = totalGoals;
}
```

### 2. 修复 `backfill-attendance-rate-v2.js`

**改为从数据库重新计算**：

```javascript
// 重新从数据库统计该球员实际到场次数
const actualMatchesPlayed = await MatchParticipant.count({
  where: { userId: user.id }
});

// 计算出勤率
const attendanceRate = ((actualMatchesPlayed / teamMatchCount) * 100).toFixed(2);

// 同时更新matchesPlayed字段
await stat.update({
  attendanceRate,
  matchesPlayed: actualMatchesPlayed
});
```

## 修复步骤

### 在服务器上执行：

1. **清空错误的统计数据**：
```sql
TRUNCATE TABLE player_stats;
TRUNCATE TABLE team_stats;
```

2. **重新运行统计脚本**：
```bash
# 重新计算比赛统计（进球、助攻、比赛场次）
node scripts/backfill-match-stats.js

# 重新计算出勤率
node scripts/backfill-attendance-rate-v2.js
```

3. **验证结果**：
```sql
-- 查看李洪胜的统计
SELECT
    u.real_name,
    ps.matches_played,
    ps.goals,
    ps.assists,
    ps.attendance_rate
FROM player_stats ps
JOIN users u ON ps.user_id = u.id
WHERE u.real_name = '李洪胜';

-- 应该看到：
-- matches_played: 2
-- goals: 3
-- attendance_rate: 100.00
```

## 预期结果

修复后：
- ✅ 李洪胜进球数：3个（正确）
- ✅ 李洪胜出勤率：100%（2场参加/2场总比赛）
- ✅ 所有球员出勤率 ≤ 100%
- ✅ 脚本可以重复运行，结果不变（幂等性）

## 注意事项

1. 修复后的脚本具有**幂等性**，可以安全地重复运行
2. 每次运行都会从数据库完整重新计算，不会累加
3. 建议在修复前备份 `player_stats` 和 `team_stats` 表
4. 如果有新比赛数据，直接运行脚本即可，无需手动清空

## 相关文件

- `scripts/backfill-match-stats.js` - 比赛统计回填脚本
- `scripts/backfill-attendance-rate-v2.js` - 出勤率计算脚本
