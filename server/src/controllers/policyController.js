const Policy = require("../models/Policy");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");
const { getZoneConditions } = require("../services/externalDataService");
const { calculateRiskQuote } = require("../services/riskService");

const getQuote = asyncHandler(async (req, res) => {
  const city = (req.query.city || "").trim();
  const pincode = (req.query.pincode || "").trim();

  if (!city || !pincode) {
    return sendError(res, "City and pincode are required", 400);
  }

  const conditions = await getZoneConditions(city, pincode);
  const quote = calculateRiskQuote(conditions);

  return sendSuccess(
    res,
    {
      city,
      pincode,
      ...quote,
      live_conditions: conditions,
    },
    "Quote fetched successfully"
  );
});

const purchasePolicy = asyncHandler(async (req, res) => {
  const {
    workerId,
    pincode,
    city,
    platform,
    weekly_premium,
    coverage_amount,
    payment_method,
  } = req.body;

  const buyerId = req.user._id.toString();
  if (workerId && workerId !== buyerId) {
    return sendError(res, "workerId does not match the authenticated user", 403);
  }

  const conditions = await getZoneConditions(city, pincode);
  const quote = calculateRiskQuote(conditions);

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);

  const policy = await Policy.create({
    worker_id: req.user._id,
    city,
    pincode,
    platform: platform || req.user.platform,
    weekly_premium: weekly_premium || quote.weekly_premium,
    coverage_amount: coverage_amount || quote.coverage_amount,
    risk_score: quote.risk_score,
    status: "active",
    start_date: today,
    end_date: endDate,
    payment_method,
  });

  return sendSuccess(res, { policy }, "Policy purchased successfully", 201);
});

const getMyPolicy = asyncHandler(async (req, res) => {
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

  const policies = await Policy.find({ worker_id: req.user._id }).sort({ createdAt: -1 });
  const activePolicy = policies.find((policy) => policy.status === "active");

  return sendSuccess(res, {
    active_policy: activePolicy || null,
    policies,
  }, "Policies fetched successfully");
});

module.exports = {
  getQuote,
  purchasePolicy,
  getMyPolicy,
};
