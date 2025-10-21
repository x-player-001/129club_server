# 数据页面API需求文档

## 接口地址
`GET /api/stats/overview`

## 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| filterType | String | 否 | 筛选类型: `all`(全部) / `month`(本月) / `season`(本赛季)，默认`season` |

## 返回数据结构

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 1. 整体统计数据
    "summary": {
      "totalMatches": 18,        // 总比赛场次
      "totalGoals": 95,          // 总进球数
      "totalAssists": 95         // 总助攻数
    },

    // 2. 个人数据
    "myStats": {
      "matches": 15,             // 参赛场次
      "goals": 12,               // 进球数
      "assists": 8,              // 助攻数
      "mvp": 3,                  // MVP次数
      "winRate": 66.7,           // 胜率(百分比)
      "attendance": 93.3         // 出勤率(百分比)
    },

    // 3. 个人排名
    "myRanking": {
      "goalsRank": 2,            // 射手榜排名(第几名)
      "assistsRank": 3,          // 助攻榜排名
      "attendanceRank": 1        // 出勤榜排名
    },

    // 4. 队伍数据
    "teamStats": {
      "name": "嘉陵摩托",        // 队伍名称
      "logo": "/static/images/logoa.png",  // 队伍logo
      "matchesPlayed": 18,       // 总场次
      "wins": 12,                // 胜场
      "draws": 3,                // 平局
      "losses": 3,               // 负场
      "winRate": 66.7,           // 胜率
      "goalsFor": 48,            // 进球数
      "goalsAgainst": 32         // 失球数
    },

    // 5. 近期战绩(最近5场)
    "recentMatches": [
      {
        "id": "5",                      // 比赛ID
        "matchDate": "2025-10-20",      // 比赛日期
        "team1": {
          "id": "1",
          "name": "嘉陵摩托"
        },
        "team2": {
          "id": "2",
          "name": "长江黄河"
        },
        "result": {
          "team1Goals": 5,              // 队伍1进球
          "team2Goals": 3               // 队伍2进球
        },
        "myStats": {                    // ⭐ 重点：当前用户在这场比赛的表现
          "goals": 2,                   // 我的进球数
          "assists": 1                  // 我的助攻数
        },
        "mvpUserIds": ["当前用户ID"]    // MVP用户ID列表(用于判断是否获得MVP)
      }
      // ... 最多返回5场
    ]
  }
}
```

## 前端页面展示说明

### 1. 个人数据Hero卡片(红色大卡片)
- 显示: 参赛/进球/助攻/MVP
- 显示: 射手榜第X/助攻榜第X/出勤榜第X

### 2. 成就徽章(横向滚动)
前端自动计算,需要数据:
- `myStats` (用于判断进球≥10、MVP≥5等)
- `recentMatches` (用于判断帽子戏法、连胜等)

成就规则:
- 🎩 帽子戏法: 单场3球
- 🎯 助攻王: 单场3助攻
- 📅 全勤奖: 出勤率100%
- ⭐ MVP收割机: MVP≥5次
- ⚽ 进球机器: 进球≥10
- 🔥 连胜战神: 最近3场全胜

### 3. 队伍数据
- 显示队伍战绩条形图

### 4. 近期战绩
- 显示每场: 日期/胜负/比分/对手
- ⭐ 重点: 显示"我的表现": X球X助攻,MVP标记

### 5. 赛季总览
- 显示总场次/总进球/总助攻

## 关键字段说明

### `myStats` (个人表现)
这是前端最关心的数据,需要在**每场比赛**中返回当前用户的个人数据:
```json
"myStats": {
  "goals": 2,      // 这场比赛我进了几球
  "assists": 1     // 这场比赛我助攻了几次
}
```

### `mvpUserIds` (MVP判断)
返回该场比赛的MVP用户ID数组(可能有多个MVP):
```json
"mvpUserIds": ["user123", "user456"]
```
前端会判断: `mvpUserIds.includes(当前用户ID)` 来显示MVP徽章

## 示例返回数据(完整)

```json
{
  "code": 200,
  "data": {
    "summary": {
      "totalMatches": 18,
      "totalGoals": 95,
      "totalAssists": 95
    },
    "myStats": {
      "matches": 15,
      "goals": 12,
      "assists": 8,
      "mvp": 3,
      "winRate": 66.7,
      "attendance": 93.3
    },
    "myRanking": {
      "goalsRank": 2,
      "assistsRank": 3,
      "attendanceRank": 1
    },
    "teamStats": {
      "name": "嘉陵摩托",
      "logo": "/static/images/logoa.png",
      "matchesPlayed": 18,
      "wins": 12,
      "draws": 3,
      "losses": 3,
      "winRate": 66.7,
      "goalsFor": 48,
      "goalsAgainst": 32
    },
    "recentMatches": [
      {
        "id": "5",
        "matchDate": "2025-10-20",
        "team1": {"id": "1", "name": "嘉陵摩托"},
        "team2": {"id": "2", "name": "长江黄河"},
        "result": {"team1Goals": 5, "team2Goals": 3},
        "myStats": {"goals": 2, "assists": 1},
        "mvpUserIds": ["当前用户ID"]
      }
    ]
  }
}
```

## 注意事项

1. **必须包含个人表现**: `recentMatches`中每场比赛的`myStats`是必须的,前端要显示"我的表现: 2球1助攻"
2. **排名可为null**: 如果用户没有上榜,`myRanking`的各项可以返回`null`
3. **日期格式**: `matchDate`建议返回`YYYY-MM-DD`格式,前端会自动格式化为`M/D`
4. **筛选逻辑**:
   - `filterType=season`: 返回当前赛季数据
   - `filterType=month`: 返回本月数据
   - `filterType=all`: 返回全部数据

---

**文档版本**: v1.0
**创建日期**: 2025-10-20
**前端页面**: pages/stats/overview
