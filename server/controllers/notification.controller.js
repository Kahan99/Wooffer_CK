const Notification = require('../models/Notification');
const asyncHandler = require('../utilities/asyncHandler.utility');
const { emitNotificationsCleared } = require('../utilities/notification.utility');

// @desc    Get notifications for logged in user
// @route   GET /api/v1/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Clear all notifications for logged in user
// @route   DELETE /api/v1/notifications/clear
// @access  Private
const clearMyNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user.id });
  emitNotificationsCleared(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications cleared',
  });
});

module.exports = {
  getMyNotifications,
  clearMyNotifications,
};
