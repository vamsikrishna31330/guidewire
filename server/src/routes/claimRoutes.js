const express = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  claimValidators,
  submitClaim,
  getMyClaims,
  verifyClaimStatus,
} = require("../controllers/claimsController");

const router = express.Router();

router.get("/my", auth, getMyClaims);
router.post("/submit", auth, claimValidators, validate, submitClaim);
router.put("/:id/verify", verifyClaimStatus);

module.exports = router;
