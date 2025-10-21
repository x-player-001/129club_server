# 129俱乐部后端API

## 项目简介

129俱乐部足球队管理系统后端API服务，基于Node.js + Koa2框架开发。

## 技术栈

- **框架**: Koa2
- **数据库**: MySQL 8.0+ (Sequelize ORM)
- **缓存**: Redis 6.0+
- **认证**: JWT
- **日志**: Winston
- **实时通信**: WebSocket

## 目录结构

```
129club_server/
├── src/
│   ├── controllers/     # 控制器层
│   ├── services/        # 业务逻辑层
│   ├── models/          # 数据模型层
│   ├── middlewares/     # 中间件
│   ├── routes/          # 路由
│   ├── utils/           # 工具函数
│   ├── config/          # 配置文件
│   ├── websocket/       # WebSocket服务
│   └── app.js           # 应用入口
├── tests/               # 测试文件
├── docs/                # 文档
├── scripts/             # 脚本文件
├── logs/                # 日志文件
├── .env.example         # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制`.env.example`为`.env`，并配置相关参数：

```bash
cp .env.example .env
```

### 3. 创建数据库

```sql
CREATE DATABASE 129club CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 运行数据库迁移

```bash
npm run migrate
```

### 5. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API文档

服务启动后访问：`http://localhost:3000/health` 查看服务状态

### 主要接口

#### 用户模块
- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息
- `GET /api/user/members` - 获取成员列表

#### 队伍模块
- `GET /api/team/list` - 获取队伍列表
- `GET /api/team/:teamId` - 获取队伍详情
- `POST /api/team` - 创建队伍
- `POST /api/team/reshuffle/start` - 发起队伍重组
- `POST /api/team/reshuffle/pick` - Draft选人

#### 比赛模块
- `GET /api/match/list` - 获取比赛列表
- `GET /api/match/:matchId` - 获取比赛详情
- `POST /api/match` - 创建比赛
- `POST /api/match/:matchId/register` - 报名比赛
- `POST /api/match/:matchId/result` - 提交比赛结果

#### 统计模块
- `GET /api/stats/player/:userId` - 获取个人统计
- `GET /api/stats/team/:teamId` - 获取队伍统计
- `GET /api/stats/ranking/:type` - 获取排行榜

#### 通知模块
- `GET /api/notice/list` - 获取公告列表
- `GET /api/notice/:noticeId` - 获取公告详情
- `POST /api/notice` - 发布公告

## 开发规范

### 代码规范
- 使用ESLint进行代码检查
- 遵循Airbnb JavaScript风格指南
- 提交前运行`npm run lint`

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

### 分支管理
- `main`: 主分支，稳定版本
- `dev`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支

## 测试

```bash
npm test
```

## 部署

### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start src/app.js --name 129club-api

# 查看状态
pm2 status

# 查看日志
pm2 logs 129club-api
```

### 使用Docker部署

```bash
# 构建镜像
docker build -t 129club-api .

# 运行容器
docker run -d -p 3000:3000 --name 129club-api 129club-api
```

## 常见问题

### 1. 数据库连接失败
检查`.env`文件中的数据库配置是否正确

### 2. Redis连接失败
确保Redis服务已启动，检查配置

### 3. JWT验证失败
检查JWT_SECRET配置，确保前后端一致

## 许可证

MIT

## 联系方式

- 项目主页: [GitHub地址]
- 问题反馈: [Issues]
