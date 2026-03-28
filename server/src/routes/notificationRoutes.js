const express = require("express");
const auth = require("../middleware/auth");
const { getMyNotifications, markNotificationRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/my", auth, getMyNotifications);
router.put("/:id/read", auth, markNotificationRead);

module.exports = router;
