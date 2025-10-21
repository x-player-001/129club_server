const noticeService = require('../services/notice.service');
const { success, error } = require('../utils/response');

// 获取公告列表
exports.getNoticeList = async (ctx) => {
  try {
    const params = ctx.query;
    const result = await noticeService.getNoticeList(params);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 获取公告详情
exports.getNoticeDetail = async (ctx) => {
  try {
    const { noticeId } = ctx.params;
    const result = await noticeService.getNoticeDetail(noticeId);
    success(ctx, result);
  } catch (err) {
    error(ctx, err.message);
  }
};

// 发布公告
exports.publishNotice = async (ctx) => {
  try {
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await noticeService.publishNotice(data, userId);
    success(ctx, result, '发布成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 更新公告
exports.updateNotice = async (ctx) => {
  try {
    const { noticeId } = ctx.params;
    const data = ctx.request.body;
    const userId = ctx.state.user.id;
    const result = await noticeService.updateNotice(noticeId, data, userId);
    success(ctx, result, '更新成功');
  } catch (err) {
    error(ctx, err.message);
  }
};

// 删除公告
exports.deleteNotice = async (ctx) => {
  try {
    const { noticeId } = ctx.params;
    const userId = ctx.state.user.id;
    const result = await noticeService.deleteNotice(noticeId, userId);
    success(ctx, result, '删除成功');
  } catch (err) {
    error(ctx, err.message);
  }
};
