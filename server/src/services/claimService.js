const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const Notification = require("../models/Notification");
const { applyFcsToClaim, calculateFcs } = require("../middleware/fcsMiddleware");
const { processPayoutForClaim } = require("./payoutService");

const createNotification = async (workerId, message) => {
  return Notification.create({
    worker_id: workerId,
    message,
  });
};

const legacyStatusFromDecision = (decision) => {
  if (decision === "Verified") {
    return "Verified";
  }

  if (decision === "Flagged") {
    return "Flagged";
  }

  return "Pending";
};

const createClaim = async ({
  worker,
  policy,
  disruptionType,
  description,
  locationProof,
  autoTriggered = false,
  claimedPincode,
}) => {
  const payoutAmount = policy.coverage_amount;
  const claimData = {
    worker_id: worker._id,
    policy_id: policy._id,
    disruption_type: disruptionType,
    claimed_pincode: claimedPincode || policy.pincode,
    amount: payoutAmount,
    payoutAmount,
  };
  const fcs = await calculateFcs({ worker, policy, claimData });

  const claim = await Claim.create({
    ...claimData,
    description,
    fcs_score: fcs.fcsScore,
    fcsScore: fcs.fcsScore,
    fcsBreakdown: fcs.fcsBreakdown,
    fcsDecision: fcs.fcsDecision,
    status: legacyStatusFromDecision(fcs.fcsDecision),
    auto_triggered: autoTriggered,
    location_proof: locationProof || "",
    fraud_signals: {
      mock_location_flag: false,
      claim_velocity: fcs.fcsBreakdown.claim_velocity.points,
      historical_presence_mismatch: fcs.fcsBreakdown.zone_mismatch.risk,
    },
  });

  let payout = null;
  if (claim.fcsDecision === "Verified") {
    payout = await processPayoutForClaim(claim);
  }

  await createNotification(
    worker._id,
    autoTriggered
      ? `GigShield auto-created a ${disruptionType} claim for your zone.`
      : `Your ${disruptionType} claim was submitted and marked ${claim.fcsDecision}.`
  );

  return { claim, payout };
};

const verifyClaim = async (claimId, status, { forcePay = false } = {}) => {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    const error = new Error("Claim not found");
    error.statusCode = 404;
    throw error;
  }

  const policy = await Policy.findById(claim.policy_id);
  await claim.populate("worker_id");
  await applyFcsToClaim(claim, { worker: claim.worker_id, policy });

  if (status === "rejected") {
    claim.status = "rejected";
    await claim.save();
    await createNotification(
      claim.worker_id._id || claim.worker_id,
      `Your claim for ${claim.disruption_type} has been rejected after review.`
    );
    return { claim, payout: null };
  }

  if (claim.fcsDecision === "Flagged" && !forcePay) {
    claim.status = "Flagged";
    await claim.save();
    await createNotification(
      claim.worker_id._id || claim.worker_id,
      `Your claim for ${claim.disruption_type} is under verification. You'll hear back within 2 hours.`
    );
    return {
      claim,
      payout: null,
      blocked: true,
      message: "Claim is flagged by FCS and requires Override & Pay.",
    };
  }

  claim.status = forcePay ? "approved" : "Verified";
  claim.fcsDecision = forcePay ? "Verified" : claim.fcsDecision;
  await claim.save();

  const payout = await processPayoutForClaim(claim);

  await createNotification(
    claim.worker_id._id || claim.worker_id,
    `Your claim for ${claim.disruption_type} has been approved.`
  );

  return { claim, payout };
};

const getActivePolicyForWorker = async (workerId) => {
  return Policy.findOne({
    worker_id: workerId,
    status: "active",
    end_date: { $gte: new Date() },
  });
};

module.exports = {
  calculateFcs,
  createClaim,
  verifyClaim,
  getActivePolicyForWorker,
};
