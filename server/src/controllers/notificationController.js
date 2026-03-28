const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ worker_id: req.user._id }).sort({ createdAt: -1 });

  return sendSuccess(res, { notifications }, "Notifications fetched successfully");
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, worker_id: req.user._id },
    { $set: { read: true } },
    { new: true }
  );

  return sendSuccess(res, { notification }, "Notification updated successfully");
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
};
