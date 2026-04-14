const Claim = require("../models/Claim");
const Payout = require("../models/Payout");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");
const { processPayoutForClaim } = require("../services/payoutService");

const getRazorpayClient = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_demo_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "demo_secret",
  });

const processPayout = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.claimId);

  if (!claim) {
    return sendError(res, "Claim not found", 404);
  }

  if (!["approved", "auto_approved", "Verified", "Paid"].includes(claim.status)) {
    return sendError(res, "Payout can only be processed for approved claims", 400);
  }

  const payout = await processPayoutForClaim(claim);

  return sendSuccess(res, { payout }, "Payout processed successfully");
});

const initiatePayout = asyncHandler(async (req, res) => {
  const { claimId, workerId, override } = req.body;
  const claim = await Claim.findById(claimId).populate("worker_id");

  if (!claim) {
    return sendError(res, "Claim not found", 404);
  }

  if (workerId && claim.worker_id._id.toString() !== workerId) {
    return sendError(res, "workerId does not match the claim owner", 400);
  }

  if (claim.fcsDecision === "Flagged" && !override) {
    return sendError(res, "FCS flagged this claim. Use Override & Pay to proceed.", 409, {
      fcsDecision: claim.fcsDecision,
      fcsScore: claim.fcsScore,
      fcsBreakdown: claim.fcsBreakdown,
    });
  }

  const amount = Math.max(1, Math.round((claim.payoutAmount || claim.amount || 0) * 100));
  const hasLiveTestKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const order = hasLiveTestKeys
    ? await getRazorpayClient().orders.create({
        amount,
        currency: "INR",
        receipt: `gigshield_${claim._id.toString().slice(-12)}`,
        notes: {
          claimId: claim._id.toString(),
          workerId: claim.worker_id._id.toString(),
          demo: "Guidewire DEVTrails Phase 3",
        },
      })
    : {
        id: `order_demo_${claim._id.toString().slice(-12)}`,
        amount,
        currency: "INR",
        receipt: `gigshield_${claim._id.toString().slice(-12)}`,
        status: "created",
        mock: true,
      };

  claim.razorpayOrderId = order.id;
  claim.status = "approved";
  if (override) {
    claim.fcsDecision = "Verified";
  }
  await claim.save();

  return sendSuccess(res, {
    order,
    claim,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_demo_key",
    testCard: "4111 1111 1111 1111",
  }, "Razorpay test order created");
});

const confirmPayout = asyncHandler(async (req, res) => {
  const { claimId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  const claim = await Claim.findById(claimId);

  if (!claim) {
    return sendError(res, "Claim not found", 404);
  }

  claim.razorpayPaymentId = razorpayPaymentId || "demo_payment_success";
  claim.razorpayOrderId = razorpayOrderId || claim.razorpayOrderId;
  claim.razorpaySignature = razorpaySignature || "demo_signature";
  claim.status = "Paid";
  claim.fcsDecision = "Verified";
  await claim.save();

  const payout = await processPayoutForClaim(claim);

  return sendSuccess(res, {
    claim,
    payout,
  }, "Payout confirmed successfully");
});

const getMyPayouts = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({ worker_id: req.user._id })
    .populate("claim_id")
    .sort({ createdAt: -1 });

  return sendSuccess(res, { payouts }, "Payouts fetched successfully");
});

module.exports = {
  processPayout,
  initiatePayout,
  confirmPayout,
  getMyPayouts,
};
