const express = require("express");
const {
  getDisruptions,
  getAllClaims,
  getStats,
  updateClaimStatus,
  triggerCurfewController,
  triggerEventController,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/disruptions", getDisruptions);
router.get("/claims", getAllClaims);
router.get("/stats", getStats);
router.put("/claims/:id", updateClaimStatus);
router.post("/trigger-curfew", triggerCurfewController);
router.post("/trigger-event", triggerEventController);

module.exports = router;
