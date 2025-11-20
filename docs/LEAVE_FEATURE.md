# 请假功能文档

## 功能概述
添加了比赛报名的请假功能，允许已报名的用户申请请假，并支持取消请假恢复报名状态。

## 数据库变更

### registrations 表
修改 `status` 字段的枚举值：
```sql
ALTER TABLE registrations
MODIFY COLUMN status ENUM('registered', 'confirmed', 'cancelled', 'leave')
DEFAULT 'registered';
```

**status 字段说明：**
- `registered` - 已报名
- `confirmed` - 已确认（队长确认）
- `cancelled` - 已取消报名
- `leave` - 请假（新增）

## API 接口

### 1. 请假
**接口：** `POST /api/match/:matchId/leave`

**请求头：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "reason": "临时有事，无法参加"
}
```

**成功响应：**
```json
{
  "code": 0,
  "message": "请假成功",
  "data": {
    "id": "registration-id",
    "matchId": "match-id",
    "userId": "user-id",
    "teamId": "team-id",
    "status": "leave",
    "notes": "临时有事，无法参加",
    "registeredAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**业务规则（后端验证）：**
- 用户必须属于参赛队伍（`currentTeamId` 必须是 `team1Id` 或 `team2Id`）
- 不能重复请假（已经是 `leave` 状态时不能再请假）
- 如果没有报名记录，会自动创建一个状态为 `leave` 的报名记录
- 请假原因会保存在 `notes` 字段

**前端建议控制：**
- 推荐只对 `registered` 状态显示"请假"按钮
- `confirmed` 状态（队长已确认）建议提示用户联系队长
- `cancelled` 状态不应显示请假功能
- 已完成的比赛隐藏请假功能

### 2. 取消请假
**接口：** `DELETE /api/match/:matchId/leave`

**请求头：**
```
Authorization: Bearer <token>
```

**成功响应：**
```json
{
  "code": 0,
  "message": "已取消请假",
  "data": {
    "message": "已取消请假"
  }
}
```

**业务规则（后端验证）：**
- 只有 `leave` 状态才能取消请假
- 取消后会**删除请假记录**（请假和报名是独立状态，不会转换为已报名）

**前端建议控制：**
- 只对 `leave` 状态显示"取消请假"按钮
- 已完成的比赛隐藏取消请假功能

### 3. 获取报名列表（已更新）
**接口：** `GET /api/match/:matchId/registration`

**响应结构（新增请假数据）：**
```json
{
  "code": 0,
  "data": {
    "team1": [...],           // 队伍1正常报名列表
    "team2": [...],           // 队伍2正常报名列表
    "team1Count": 10,         // 队伍1报名人数
    "team2Count": 12,         // 队伍2报名人数
    "team1Leave": [...],      // 队伍1请假列表（新增）
    "team2Leave": [...],      // 队伍2请假列表（新增）
    "team1LeaveCount": 2,     // 队伍1请假人数（新增）
    "team2LeaveCount": 1      // 队伍2请假人数（新增）
  }
}
```

## 服务层方法

### matchService.requestLeave(matchId, userId, data)
申请请假

**参数：**
- `matchId` - 比赛ID
- `userId` - 用户ID
- `data.reason` - 请假原因（可选）

**返回：** 更新后的报名记录

### matchService.cancelLeave(matchId, userId)
取消请假

**参数：**
- `matchId` - 比赛ID
- `userId` - 用户ID

**返回：** 更新后的报名记录

## 控制器

### matchController.requestLeave(ctx)
处理请假请求

### matchController.cancelLeave(ctx)
处理取消请假请求

## 路由配置

```javascript
// src/routes/match.js
router.post('/:matchId/leave', authMiddleware, matchController.requestLeave);
router.delete('/:matchId/leave', authMiddleware, matchController.cancelLeave);
```

## 使用示例

### 场景1: 用户请假
```bash
curl -X POST http://localhost:3000/api/match/{matchId}/leave \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "临时有事，无法参加"}'
```

### 场景2: 取消请假
```bash
curl -X DELETE http://localhost:3000/api/match/{matchId}/leave \
  -H "Authorization: Bearer {token}"
```

### 场景3: 查看报名列表（包含请假信息）
```bash
curl -X GET http://localhost:3000/api/match/{matchId}/registration \
  -H "Authorization: Bearer {token}"
```

## 前端集成建议

### 1. 报名列表显示
- 将请假人员单独显示在"请假名单"区域
- 正常报名人员显示在"报名名单"区域
- 显示请假原因（notes 字段）

### 2. 操作按钮
根据用户当前状态显示不同按钮：
- `registered/confirmed` → 显示"请假"按钮
- `leave` → 显示"取消请假"按钮
- `cancelled` → 显示"重新报名"按钮

### 3. 状态显示
```javascript
const statusMap = {
  registered: '已报名',
  confirmed: '已确认',
  cancelled: '已取消',
  leave: '请假'
}
```

## 数据库同步

**本地数据库和服务器数据库均已更新。**

验证命令：
```sql
-- 查看status字段
DESCRIBE registrations;

-- 查看各状态报名数量
SELECT status, COUNT(*) as count
FROM registrations
WHERE match_id = '{matchId}'
GROUP BY status;
```

## 注意事项

1. **请假和报名是完全独立的状态**
   - 请假：表示用户提前告知无法参加比赛
   - 报名：表示用户确认参加比赛
   - 两者互不关联，用户只能处于其中一种状态或都不处于
   - 请假后不能报名，报名后不能请假（前端应控制）
   - 取消请假会直接删除记录，不会变成报名状态

2. **请假原因**
   - 保存在 `notes` 字段
   - 取消请假时记录会被删除

3. **比赛状态限制**
   - 已完成的比赛不能请假
   - 只有进行中的比赛才能取消请假

4. **统计说明**
   - 请假人员不计入实际到场人数
   - 报名列表接口返回请假人员单独分组
   - 可用于前端提醒队长关注请假情况

## 测试结果

✅ 数据库表结构修改成功（本地 + 服务器）
✅ 服务层方法实现完成
✅ 控制器方法实现完成
✅ 路由配置完成
✅ 请假状态更新测试通过
✅ 取消请假测试通过
✅ 报名列表接口返回请假数据

## 文件变更

- `src/services/match.service.js` - 添加 requestLeave、cancelLeave 方法，更新 getRegistrationList
- `src/controllers/match.controller.js` - 添加 requestLeave、cancelLeave 控制器
- `src/routes/match.js` - 添加请假相关路由
- 数据库表 `registrations` - 修改 status 枚举值
