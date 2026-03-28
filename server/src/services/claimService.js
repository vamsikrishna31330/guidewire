const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const Notification = require("../models/Notification");
const { processPayoutForClaim } = require("./payoutService");

const calculateFraudSignals = async ({ worker, policy, locationProof }) => {
  const normalizedProof = (locationProof || "").toLowerCase();
  const mock_location_flag = ["mock", "spoof", "fake", "simulated"].some((term) =>
    normalizedProof.includes(term)
  );

  const claimWindowStart = new Date(Date.now() - (24 * 60 * 60 * 1000));
  const recentClaimCount = await Claim.countDocuments({
    worker_id: worker._id,
    createdAt: { $gte: claimWindowStart },
  });

  const claim_velocity = recentClaimCount >= 2 ? 30 : 0;
  const historical_presence_mismatch = worker.city.toLowerCase() !== policy.city.toLowerCase();

  const fcs_score =
    (mock_location_flag ? 40 : 0) +
    claim_velocity +
    (historical_presence_mismatch ? 20 : 0);

  let status = "pending_verification";
  if (fcs_score < 30) {
    status = "auto_approved";
  } else if (fcs_score > 70) {
    status = "flagged_fraud";
  }

  return {
    fcs_score,
    status,
    fraud_signals: {
      mock_location_flag,
      claim_velocity,
      historical_presence_mismatch,
    },
  };
};

const createNotification = async (workerId, message) => {
  return Notification.create({
    worker_id: workerId,
    message,
  });
};

const createClaim = async ({
  worker,
  policy,
  disruptionType,
  description,
  locationProof,
  autoTriggered = false,
  presetStatus,
  presetFcs = 0,
}) => {
  const fraudEvaluation = autoTriggered
    ? {
        fcs_score: presetFcs,
        status: presetStatus || "pending_verification",
        fraud_signals: {
          mock_location_flag: false,
          claim_velocity: 0,
          historical_presence_mismatch: false,
        },
      }
    : await calculateFraudSignals({
        worker,
        policy,
        locationProof,
      });

  const claim = await Claim.create({
    policy_id: policy._id,
    worker_id: worker._id,
    disruption_type: disruptionType,
    description,
    amount: policy.coverage_amount,
    fcs_score: fraudEvaluation.fcs_score,
    status: fraudEvaluation.status,
    auto_triggered: autoTriggered,
    location_proof: locationProof || "",
    fraud_signals: fraudEvaluation.fraud_signals,
  });

  let payout = null;
  if (claim.status === "auto_approved" || claim.status === "approved") {
    payout = await processPayoutForClaim(claim);
  }

  await createNotification(
    worker._id,
    autoTriggered
      ? `GigShield auto-created a ${disruptionType} claim for your zone.`
      : `Your ${disruptionType} claim was submitted with status ${claim.status}.`
  );

  return { claim, payout };
};

const verifyClaim = async (claimId, status) => {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    const error = new Error("Claim not found");
    error.statusCode = 404;
    throw error;
  }

  claim.status = status;
  await claim.save();

  let payout = null;
  if (status === "approved") {
    payout = await processPayoutForClaim(claim);
  }

  await createNotification(
    claim.worker_id,
    status === "approved"
      ? `Your claim for ${claim.disruption_type} has been approved.`
      : `Your claim for ${claim.disruption_type} has been rejected after review.`
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
  calculateFraudSignals,
  createClaim,
  verifyClaim,
  getActivePolicyForWorker,
};
