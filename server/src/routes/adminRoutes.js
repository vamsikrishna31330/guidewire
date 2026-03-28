const express = require("express");
const {
  getDisruptions,
  getAllClaims,
  updateClaimStatus,
  triggerCurfewController,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/disruptions", getDisruptions);
router.get("/claims", getAllClaims);
router.put("/claims/:id", updateClaimStatus);
router.post("/trigger-curfew", triggerCurfewController);

module.exports = router;
