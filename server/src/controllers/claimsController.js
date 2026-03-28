const { body } = require("express-validator");
const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");
const { createClaim, verifyClaim } = require("../services/claimService");

const claimValidators = [
  body("policy_id").notEmpty().withMessage("policy_id is required"),
  body("disruption_type").notEmpty().withMessage("disruption_type is required"),
  body("description").notEmpty().withMessage("description is required"),
  body("location_proof").notEmpty().withMessage("location_proof is required"),
];

const submitClaim = asyncHandler(async (req, res) => {
  const { policy_id, disruption_type, description, location_proof } = req.body;
  const policy = await Policy.findById(policy_id);

  if (!policy) {
    return sendError(res, "Policy not found", 404);
  }

  if (policy.worker_id.toString() !== req.user._id.toString()) {
    return sendError(res, "Policy does not belong to this worker", 403);
  }

  const { claim, payout } = await createClaim({
    worker: req.user,
    policy,
    disruptionType: disruption_type,
    description,
    locationProof: location_proof,
  });

  return sendSuccess(res, {
    claim,
    payout,
  }, "Claim submitted successfully", 201);
});

const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ worker_id: req.user._id })
    .populate("policy_id")
    .sort({ createdAt: -1 });

  return sendSuccess(res, { claims }, "Claims fetched successfully");
});

const verifyClaimStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return sendError(res, "status must be approved or rejected", 400);
  }

  const result = await verifyClaim(req.params.id, status);

  return sendSuccess(res, result, `Claim ${status} successfully`);
});

module.exports = {
  claimValidators,
  submitClaim,
  getMyClaims,
  verifyClaimStatus,
};
