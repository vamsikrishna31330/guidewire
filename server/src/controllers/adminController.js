const Claim = require("../models/Claim");
const DisruptionEvent = require("../models/DisruptionEvent");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");
const { triggerCurfew } = require("../services/disruptionService");
const { verifyClaim } = require("../services/claimService");

const getDisruptions = asyncHandler(async (req, res) => {
  const disruptions = await DisruptionEvent.find({})
    .populate({
      path: "affected_policies",
      populate: {
        path: "worker_id",
        select: "name city pincode platform",
      },
    })
    .sort({ timestamp: -1 });

  return sendSuccess(res, { disruptions }, "Disruption events fetched successfully");
});

const getAllClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({})
    .populate("policy_id")
    .populate("worker_id", "name email city pincode platform")
    .sort({ createdAt: -1 });

  return sendSuccess(res, { claims }, "All claims fetched successfully");
});

const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return sendError(res, "status must be approved or rejected", 400);
  }

  const result = await verifyClaim(req.params.id, status);
  return sendSuccess(res, result, `Claim ${status} successfully`);
});

const triggerCurfewController = asyncHandler(async (req, res) => {
  const { city, pincode } = req.body;

  if (!city || !pincode) {
    return sendError(res, "city and pincode are required", 400);
  }

  const result = await triggerCurfew(city, pincode);

  return sendSuccess(res, result, "Curfew trigger processed successfully", 201);
});

module.exports = {
  getDisruptions,
  getAllClaims,
  updateClaimStatus,
  triggerCurfewController,
};
