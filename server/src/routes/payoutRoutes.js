const express = require("express");
const auth = require("../middleware/auth");
const { processPayout, getMyPayouts } = require("../controllers/payoutController");

const router = express.Router();

router.post("/process/:claimId", processPayout);
router.get("/my", auth, getMyPayouts);

module.exports = router;
