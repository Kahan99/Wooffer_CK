const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { getSocketIo } = require('./socket.utility');

function toObjectId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

function emitUserNotificationEvent(userId, payload) {
  const io = getSocketIo();
  if (!io || !userId) return;
  io.emit(`notifications_${String(userId)}`, payload);
}

async function createNotification({ userId, type = 'system', message, metadata = {} }) {
  const uid = toObjectId(userId);
  if (!uid || !message) return null;

  try {
    const notification = await Notification.create({
      userId: uid,
      type,
      message,
      metadata,
    });
    emitUserNotificationEvent(uid.toString(), {
      action: 'created',
      notification,
    });
    return notification;
  } catch (err) {
    console.warn(`Notification create failed: ${err.message}`);
    return null;
  }
}

async function createNotificationsForUsers(userIds = [], payload = {}) {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map(String))]
    .map((id) => toObjectId(id))
    .filter(Boolean);

  if (uniqueIds.length === 0 || !payload.message) return 0;

  const docs = uniqueIds.map((uid) => ({
    userId: uid,
    type: payload.type || 'system',
    message: payload.message,
    metadata: payload.metadata || {},
  }));

  try {
    const res = await Notification.insertMany(docs, { ordered: false });
    if (Array.isArray(res)) {
      for (const notification of res) {
        emitUserNotificationEvent(notification.userId?.toString(), {
          action: 'created',
          notification,
        });
      }
      return res.length;
    }
    return 0;
  } catch (err) {
    console.warn(`Notification bulk create failed: ${err.message}`);
    return 0;
  }
}

function emitNotificationsCleared(userId) {
  emitUserNotificationEvent(userId, { action: 'cleared' });
}

module.exports = {
  createNotification,
  createNotificationsForUsers,
  emitNotificationsCleared,
};
