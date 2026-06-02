const WebSocket = require('ws');
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { User } = require('../models');
const { redisClient } = require('../config/redis');

const DANMAKU_MAX = 50; // 每个房间最多保留50条
const DANMAKU_TTL = 60 * 60 * 24; // 24小时过期

function danmakuKey(reshuffleId) {
  return `danmaku:reshuffle:${reshuffleId}`;
}

// 房间表：reshuffleId -> Set<{ ws, userId, nickname }>
const rooms = new Map();

function getRoomClients(reshuffleId) {
  if (!rooms.has(reshuffleId)) {
    rooms.set(reshuffleId, new Set());
  }
  return rooms.get(reshuffleId);
}

function broadcast(reshuffleId, message) {
  const clients = rooms.get(reshuffleId);
  if (!clients) return;
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

function createReshuffleWsServer(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/reshuffle' });

  wss.on('connection', (ws, req) => {
    let currentUser = null;
    let currentReshuffleId = null;

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: '无效的消息格式' }));
        return;
      }

      const { type, token, reshuffleId, text } = msg;

      // join：加入重组房间
      if (type === 'join') {
        if (!reshuffleId) {
          ws.send(JSON.stringify({ type: 'error', message: '缺少 reshuffleId' }));
          return;
        }

        // 验证身份（可选，游客也可观看）
        let userId = null;
        let nickname = '游客';
        let avatar = null;
        if (token) {
          const payload = verifyToken(token);
          if (payload) {
            userId = payload.id;
            const user = await User.findByPk(userId, { attributes: ['nickname', 'avatar'] });
            if (user) {
              nickname = user.nickname || userId;
              avatar = user.avatar || null;
            }
          }
        }

        currentUser = { userId, nickname, avatar };
        currentReshuffleId = reshuffleId;

        const clients = getRoomClients(reshuffleId);
        clients.add({ ws, userId, nickname, avatar });

        ws.send(JSON.stringify({ type: 'joined', reshuffleId, nickname, avatar }));
        broadcast(reshuffleId, { type: 'viewer_joined', userId, nickname, avatar, time: Date.now() });
        logger.info(`WS join reshuffle ${reshuffleId}: ${nickname}`);

        // 推送历史弹幕
        try {
          const history = await redisClient.lRange(danmakuKey(reshuffleId), 0, -1);
          if (history.length > 0) {
            ws.send(JSON.stringify({
              type: 'danmaku_history',
              list: history.map(item => JSON.parse(item))
            }));
          }
        } catch (e) {
          logger.error(`WS danmaku history error: ${e.message}`);
        }
        return;
      }

      // 以下消息需要先 join
      if (!currentReshuffleId) {
        ws.send(JSON.stringify({ type: 'error', message: '请先发送 join 消息' }));
        return;
      }

      // danmaku：发弹幕
      if (type === 'danmaku') {
        if (!text || !text.trim()) return;
        const danmaku = {
          type: 'danmaku',
          userId: currentUser.userId,
          nickname: currentUser.nickname,
          avatar: currentUser.avatar,
          text: text.trim(),
          time: Date.now()
        };
        broadcast(currentReshuffleId, danmaku);

        // 存入 Redis，保留最新50条
        try {
          const key = danmakuKey(currentReshuffleId);
          await redisClient.rPush(key, JSON.stringify(danmaku));
          await redisClient.lTrim(key, -DANMAKU_MAX, -1);
          await redisClient.expire(key, DANMAKU_TTL);
        } catch (e) {
          logger.error(`WS danmaku save error: ${e.message}`);
        }
        return;
      }

      ws.send(JSON.stringify({ type: 'error', message: `未知消息类型: ${type}` }));
    });

    ws.on('close', () => {
      if (currentReshuffleId) {
        const clients = rooms.get(currentReshuffleId);
        if (clients) {
          for (const client of clients) {
            if (client.ws === ws) {
              clients.delete(client);
              break;
            }
          }
          if (clients.size === 0) {
            rooms.delete(currentReshuffleId);
          }
        }
      }
    });

    ws.on('error', (err) => {
      logger.error(`WS error: ${err.message}`);
    });
  });

  logger.info('WebSocket server ready at /ws/reshuffle');
  return wss;
}

// 供 pickPlayer / completeReshuffle 调用
function broadcastPick(reshuffleId, pickData, nextCaptain) {
  broadcast(reshuffleId, {
    type: 'pick',
    pick: pickData,
    nextCaptain,
    currentPickOrder: pickData.pickOrder + 1,
    time: Date.now()
  });
}

function broadcastComplete(reshuffleId) {
  broadcast(reshuffleId, {
    type: 'complete',
    message: '重组已完成',
    time: Date.now()
  });
}

module.exports = { createReshuffleWsServer, broadcastPick, broadcastComplete };
