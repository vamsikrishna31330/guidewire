const Claim = require("../models/Claim");
const Policy = require("../models/Policy");

const FCS_WEIGHTS = {
  claim_velocity: 25,
  zone_mismatch: 20,
  duplicate_event: 20,
  new_account: 15,
  high_payout: 10,
  claim_history_ratio: 10,
};

const getDecision = (fcsScore) => {
  if (fcsScore < 30) {
    return { fcsDecision: "Verified", status: "Verified" };
  }

  if (fcsScore < 70) {
    return { fcsDecision: "Pending", status: "Pending" };
  }

  return { fcsDecision: "Flagged", status: "Flagged" };
};

const countWorkerClaims = (workerId, extraFilter = {}) =>
  Claim.countDocuments({
    worker_id: workerId,
    ...extraFilter,
  });

const countWorkerPolicies = (workerId) =>
  Policy.countDocuments({
    worker_id: workerId,
  });

const calculateFcs = async ({ worker, policy, claimData = {}, excludeClaimId = null }) => {
  const workerId = worker._id || worker;
  const claimedPincode = String(claimData.claimed_pincode || policy?.pincode || worker.pincode || "");
  const payoutAmount = Number(claimData.payoutAmount || claimData.amount || policy?.coverage_amount || 0);
  const weeklyEarnings = Number(worker.weekly_earnings || worker.weeklyEarnings || 3500);
  const claimWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const accountAgeMs = Date.now() - new Date(worker.createdAt || Date.now()).getTime();
  const accountAgeDays = accountAgeMs / (24 * 60 * 60 * 1000);

  const baseDuplicateFilter = {
    worker_id: workerId,
    disruption_type: claimData.disruption_type,
    claimed_pincode: claimedPincode,
  };

  if (excludeClaimId) {
    baseDuplicateFilter._id = { $ne: excludeClaimId };
  }

  const [claimsIn24h, duplicateEventCount, claimsCount, policiesCount] = await Promise.all([
    countWorkerClaims(workerId, {
      createdAt: { $gte: claimWindowStart },
      ...(excludeClaimId ? { _id: { $ne: excludeClaimId } } : {}),
    }),
    claimData.disruption_type ? countWorkerClaims(workerId, baseDuplicateFilter) : Promise.resolve(0),
    countWorkerClaims(workerId, excludeClaimId ? { _id: { $ne: excludeClaimId } } : {}),
    countWorkerPolicies(workerId),
  ]);

  const claimHistoryRatio = policiesCount ? claimsCount / policiesCount : claimsCount > 0 ? 1 : 0;

  const breakdown = {
    claim_velocity: {
      risk: claimsIn24h > 3,
      points: claimsIn24h > 3 ? FCS_WEIGHTS.claim_velocity : 0,
      detail: `${claimsIn24h} claims in the last 24 hours`,
    },
    zone_mismatch: {
      risk: String(worker.pincode) !== claimedPincode,
      points: String(worker.pincode) !== claimedPincode ? FCS_WEIGHTS.zone_mismatch : 0,
      detail: `registered ${worker.pincode}, claimed ${claimedPincode}`,
    },
    duplicate_event: {
      risk: duplicateEventCount > 0,
      points: duplicateEventCount > 0 ? FCS_WEIGHTS.duplicate_event : 0,
      detail: `${duplicateEventCount} existing matching disruption claim(s)`,
    },
    new_account: {
      risk: accountAgeDays < 7,
      points: accountAgeDays < 7 ? FCS_WEIGHTS.new_account : 0,
      detail: `${Math.max(0, accountAgeDays).toFixed(1)} day old account`,
    },
    high_payout: {
      risk: payoutAmount > weeklyEarnings * 3,
      points: payoutAmount > weeklyEarnings * 3 ? FCS_WEIGHTS.high_payout : 0,
      detail: `${payoutAmount} payout vs ${weeklyEarnings} weekly earnings baseline`,
    },
    claim_history_ratio: {
      risk: claimHistoryRatio > 0.8,
      points: claimHistoryRatio > 0.8 ? FCS_WEIGHTS.claim_history_ratio : 0,
      detail: `${claimsCount} claims / ${policiesCount || 0} policies`,
    },
  };

  const fcsScore = Math.min(
    100,
    Object.values(breakdown).reduce((score, item) => score + item.points, 0)
  );

  return {
    fcsScore,
    fcsBreakdown: breakdown,
    ...getDecision(fcsScore),
  };
};

const applyFcsToClaimData = async ({ worker, policy, claimData }) => {
  const fcs = await calculateFcs({ worker, policy, claimData });

  return {
    ...claimData,
    fcsScore: fcs.fcsScore,
    fcs_score: fcs.fcsScore,
    fcsBreakdown: fcs.fcsBreakdown,
    fcsDecision: fcs.fcsDecision,
    status: fcs.status,
  };
};

const applyFcsToClaim = async (claim, { worker, policy }) => {
  const fcs = await calculateFcs({
    worker,
    policy,
    claimData: {
      disruption_type: claim.disruption_type,
      claimed_pincode: claim.claimed_pincode || policy?.pincode,
      payoutAmount: claim.payoutAmount || claim.amount,
      amount: claim.amount,
    },
    excludeClaimId: claim._id,
  });

  claim.fcsScore = fcs.fcsScore;
  claim.fcs_score = fcs.fcsScore;
  claim.fcsBreakdown = fcs.fcsBreakdown;
  claim.fcsDecision = fcs.fcsDecision;
  claim.status = fcs.status;
  return claim;
};

const fcsMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.policy) {
      return next();
    }

    req.fcs = await calculateFcs({
      worker: req.user,
      policy: req.policy,
      claimData: req.body,
    });

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  FCS_WEIGHTS,
  calculateFcs,
  applyFcsToClaimData,
  applyFcsToClaim,
  fcsMiddleware,
};
