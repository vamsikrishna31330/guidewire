const Claim = require("../models/Claim");
const Payout = require("../models/Payout");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");
const { processPayoutForClaim } = require("../services/payoutService");

const processPayout = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.claimId);

  if (!claim) {
    return sendError(res, "Claim not found", 404);
  }

  if (!["approved", "auto_approved"].includes(claim.status)) {
    return sendError(res, "Payout can only be processed for approved claims", 400);
  }

  const payout = await processPayoutForClaim(claim);

  return sendSuccess(res, { payout }, "Payout processed successfully");
});

const getMyPayouts = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({ worker_id: req.user._id })
    .populate("claim_id")
    .sort({ createdAt: -1 });

  return sendSuccess(res, { payouts }, "Payouts fetched successfully");
});

module.exports = {
  processPayout,
  getMyPayouts,
};
