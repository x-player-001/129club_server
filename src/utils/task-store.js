/**
 * 任务存储管理器
 * 用于存储异步任务的状态和结果
 *
 * 注意：当前使用内存存储，重启服务器后任务数据会丢失
 * 生产环境建议使用Redis实现持久化存储
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

class TaskStore {
  constructor() {
    // 任务存储 Map: taskId => task
    this.tasks = new Map();

    // 任务过期时间（1小时）
    this.TASK_EXPIRY = 60 * 60 * 1000;

    // 定期清理过期任务（每10分钟）
    setInterval(() => {
      this.cleanExpiredTasks();
    }, 10 * 60 * 1000);
  }

  /**
   * 创建新任务
   * @param {string} type 任务类型
   * @param {Object} data 任务数据
   * @param {string} userId 用户ID
   * @returns {Object} 任务信息
   */
  createTask(type, data, userId) {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      type,
      status: 'pending', // pending | processing | completed | failed
      data,
      userId,
      result: null,
      error: null,
      progress: 0, // 进度 0-100
      progressMessage: '等待处理...',
      createdAt: new Date(),
      startedAt: null,
      completedAt: null
    };

    this.tasks.set(taskId, task);
    logger.info('Task created', { taskId, type, userId });

    return {
      taskId: task.id,
      status: task.status,
      createdAt: task.createdAt
    };
  }

  /**
   * 获取任务信息
   * @param {string} taskId 任务ID
   * @returns {Object|null} 任务信息
   */
  getTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - task.createdAt.getTime() > this.TASK_EXPIRY) {
      this.tasks.delete(taskId);
      return null;
    }

    return task;
  }

  /**
   * 更新任务状态
   * @param {string} taskId 任务ID
   * @param {string} status 新状态
   * @param {Object} updates 其他更新字段
   */
  updateTask(taskId, status, updates = {}) {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn('Task not found for update', { taskId });
      return false;
    }

    task.status = status;

    if (status === 'processing' && !task.startedAt) {
      task.startedAt = new Date();
    }

    if (status === 'completed' || status === 'failed') {
      task.completedAt = new Date();
    }

    Object.assign(task, updates);

    logger.info('Task updated', {
      taskId,
      status,
      progress: task.progress,
      progressMessage: task.progressMessage
    });

    return true;
  }

  /**
   * 更新任务进度
   * @param {string} taskId 任务ID
   * @param {number} progress 进度 (0-100)
   * @param {string} message 进度消息
   */
  updateProgress(taskId, progress, message) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    task.progress = Math.min(100, Math.max(0, progress));
    if (message) {
      task.progressMessage = message;
    }

    logger.info('Task progress updated', { taskId, progress, message });
    return true;
  }

  /**
   * 设置任务结果（成功）
   * @param {string} taskId 任务ID
   * @param {Object} result 任务结果
   */
  setTaskResult(taskId, result) {
    this.updateTask(taskId, 'completed', {
      result,
      progress: 100,
      progressMessage: '解析完成'
    });
  }

  /**
   * 设置任务错误（失败）
   * @param {string} taskId 任务ID
   * @param {string|Error} error 错误信息
   */
  setTaskError(taskId, error) {
    const errorMessage = error instanceof Error ? error.message : error;
    this.updateTask(taskId, 'failed', {
      error: errorMessage,
      progressMessage: '解析失败'
    });
  }

  /**
   * 删除任务
   * @param {string} taskId 任务ID
   */
  deleteTask(taskId) {
    const deleted = this.tasks.delete(taskId);
    if (deleted) {
      logger.info('Task deleted', { taskId });
    }
    return deleted;
  }

  /**
   * 清理过期任务
   */
  cleanExpiredTasks() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      if (now - task.createdAt.getTime() > this.TASK_EXPIRY) {
        this.tasks.delete(taskId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info('Expired tasks cleaned', { deletedCount });
    }
  }

  /**
   * 获取任务统计信息
   */
  getStats() {
    const stats = {
      total: this.tasks.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    for (const task of this.tasks.values()) {
      if (stats[task.status] !== undefined) {
        stats[task.status]++;
      }
    }

    return stats;
  }
}

// 导出单例
module.exports = new TaskStore();
