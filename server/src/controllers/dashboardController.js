const Claim = require("../models/Claim");
const Notification = require("../models/Notification");
const Policy = require("../models/Policy");
const Payout = require("../models/Payout");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { getZoneConditions } = require("../services/externalDataService");
const { calculateRiskQuote } = require("../services/riskService");

const getDashboardSummary = asyncHandler(async (req, res) => {
  await Policy.updateMany(
    {
      worker_id: req.user._id,
      status: "active",
      end_date: { $lt: new Date() },
    },
    {
      $set: { status: "expired" },
    }
  );

  const [policies, claims, payouts, notifications, conditions] = await Promise.all([
    Policy.find({ worker_id: req.user._id }).sort({ createdAt: -1 }),
    Claim.find({ worker_id: req.user._id }).sort({ createdAt: -1 }),
    Payout.find({ worker_id: req.user._id }).sort({ createdAt: -1 }),
    Notification.find({ worker_id: req.user._id }).sort({ createdAt: -1 }).limit(8),
    getZoneConditions(req.user.city, req.user.pincode),
  ]);

  const liveRisk = calculateRiskQuote(conditions);
  const activePolicy = policies.find((policy) => policy.status === "active") || null;

  return sendSuccess(res, {
    worker: req.user,
    active_policy: activePolicy,
    claims,
    payouts,
    notifications,
    risk_snapshot: {
      ...liveRisk,
      live_conditions: conditions,
    },
  }, "Dashboard summary fetched successfully");
});

module.exports = {
  getDashboardSummary,
};
