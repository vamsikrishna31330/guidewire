const express = require("express");
const auth = require("../middleware/auth");
const {
  processPayout,
  initiatePayout,
  confirmPayout,
  getMyPayouts,
} = require("../controllers/payoutController");

const router = express.Router();

router.post("/initiate", initiatePayout);
router.post("/confirm", confirmPayout);
router.post("/process/:claimId", processPayout);
router.get("/my", auth, getMyPayouts);

module.exports = router;
