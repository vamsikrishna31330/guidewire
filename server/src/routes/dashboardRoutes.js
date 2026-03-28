const express = require("express");
const auth = require("../middleware/auth");
const { getDashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", auth, getDashboardSummary);

module.exports = router;
