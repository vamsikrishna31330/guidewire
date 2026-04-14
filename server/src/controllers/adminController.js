const Claim = require("../models/Claim");
const DisruptionEvent = require("../models/DisruptionEvent");
const Payout = require("../models/Payout");
const Policy = require("../models/Policy");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");
const { triggerCurfew, triggerManualEvent } = require("../services/disruptionService");
const { getZoneConditions } = require("../services/externalDataService");
const { calculateRiskQuote } = require("../services/riskService");
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

const getClaimsPerDay = (claims) => {
  const buckets = new Map();
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    buckets.set(day.toISOString().slice(0, 10), 0);
  }

  claims.forEach((claim) => {
    const key = new Date(claim.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key) + 1);
    }
  });

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, claims: count }));
};

const getZoneFinancials = (policies, payouts) => {
  const zones = new Map();

  policies.forEach((policy) => {
    const key = policy.pincode;
    const current = zones.get(key) || {
      zone: `${policy.city} ${policy.pincode}`,
      pincode: policy.pincode,
      premiums: 0,
      payouts: 0,
    };
    current.premiums += Number(policy.weekly_premium || 0);
    zones.set(key, current);
  });

  payouts.forEach((payout) => {
    const policy = payout.claim_id?.policy_id;
    if (!policy) {
      return;
    }

    const key = policy.pincode;
    const current = zones.get(key) || {
      zone: `${policy.city} ${policy.pincode}`,
      pincode: policy.pincode,
      premiums: 0,
      payouts: 0,
    };
    current.payouts += Number(payout.amount || 0);
    zones.set(key, current);
  });

  return Array.from(zones.values())
    .sort((a, b) => b.premiums + b.payouts - (a.premiums + a.payouts))
    .slice(0, 5);
};

const getStatusDistribution = (claims) => {
  const distribution = {
    Verified: 0,
    Pending: 0,
    Flagged: 0,
    Paid: 0,
  };

  claims.forEach((claim) => {
    if (claim.status === "Paid") {
      distribution.Paid += 1;
    } else if (claim.fcsDecision && distribution[claim.fcsDecision] !== undefined) {
      distribution[claim.fcsDecision] += 1;
    } else if (["approved", "auto_approved", "Verified"].includes(claim.status)) {
      distribution.Verified += 1;
    } else if (["flagged_fraud", "Flagged"].includes(claim.status)) {
      distribution.Flagged += 1;
    } else {
      distribution.Pending += 1;
    }
  });

  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
};

const buildForecast = async (activePolicies) => {
  const defaultZones = [
    { city: "Bengaluru", pincode: "560001" },
    { city: "Mumbai", pincode: "400001" },
    { city: "Delhi", pincode: "110001" },
    { city: "Chennai", pincode: "600001" },
    { city: "Hyderabad", pincode: "500001" },
    { city: "Kolkata", pincode: "700001" },
    { city: "Pune", pincode: "411001" },
    { city: "Ahmedabad", pincode: "380001" },
    { city: "Jaipur", pincode: "302001" },
    { city: "Lucknow", pincode: "226001" },
  ];
  const policyZones = activePolicies.map((policy) => ({
    city: policy.city,
    pincode: policy.pincode,
  }));
  const merged = [...policyZones, ...defaultZones];
  const unique = Array.from(new Map(merged.map((zone) => [zone.pincode, zone])).values()).slice(0, 10);

  return Promise.all(
    unique.map(async (zone) => {
      const conditions = await getZoneConditions(zone.city, zone.pincode);
      const quote = calculateRiskQuote(conditions);
      const riskLevel = quote.risk_score > 70 ? "High" : quote.risk_score >= 40 ? "Medium" : "Low";

      return {
        ...zone,
        riskScore: quote.risk_score,
        riskLevel,
        aqi: conditions.aqi,
        rain_mm: conditions.rain_mm,
      };
    })
  );
};

const getStats = asyncHandler(async (req, res) => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [activePolicies, allPolicies, claims, payouts] = await Promise.all([
    Policy.find({ status: "active", end_date: { $gte: new Date() } }),
    Policy.find({}),
    Claim.find({})
      .populate("worker_id", "name email city pincode platform createdAt")
      .populate("policy_id")
      .sort({ createdAt: -1 }),
    Payout.find({ status: "completed" }).populate({
      path: "claim_id",
      populate: "policy_id",
    }),
  ]);

  const totalExposure = activePolicies.reduce((sum, policy) => sum + Number(policy.coverage_amount || 0), 0);
  const totalPremiums = allPolicies.reduce((sum, policy) => sum + Number(policy.weekly_premium || 0), 0);
  const totalPayouts = payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
  const flaggedClaims = claims.filter((claim) => claim.fcsDecision === "Flagged" || claim.status === "Flagged" || claim.status === "flagged_fraud");
  const avgFcsScore = claims.length
    ? claims.reduce((sum, claim) => sum + Number(claim.fcsScore || claim.fcs_score || 0), 0) / claims.length
    : 0;
  const distinctPincodes = new Set(activePolicies.map((policy) => policy.pincode));
  const forecast = await buildForecast(activePolicies);

  return sendSuccess(res, {
    totals: {
      totalExposure,
      totalPremiums,
      totalPayouts,
      lossRatio: totalPremiums ? (totalPayouts / totalPremiums) * 100 : 0,
      fraudRate: claims.length ? (flaggedClaims.length / claims.length) * 100 : 0,
      avgFcsScore,
      activePoliciesCount: activePolicies.length,
      citiesCovered: distinctPincodes.size,
      totalClaims: claims.length,
    },
    charts: {
      claimsPerDay: getClaimsPerDay(claims.filter((claim) => new Date(claim.createdAt) >= fourteenDaysAgo)),
      zoneFinancials: getZoneFinancials(allPolicies, payouts),
      statusDistribution: getStatusDistribution(claims),
    },
    flaggedClaims,
    forecast,
  }, "Admin stats fetched successfully");
});

const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status, forcePay = false } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return sendError(res, "status must be approved or rejected", 400);
  }

  const result = await verifyClaim(req.params.id, status, { forcePay });
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

const triggerEventController = asyncHandler(async (req, res) => {
  const { city, pincode, trigger_type, severity } = req.body;

  if (!city || !pincode || !trigger_type) {
    return sendError(res, "city, pincode, and trigger_type are required", 400);
  }

  const result = await triggerManualEvent({
    city,
    pincode,
    triggerType: trigger_type,
    severity: severity || "high",
  });

  return sendSuccess(res, result, "Manual disruption trigger processed successfully", 201);
});

module.exports = {
  getDisruptions,
  getAllClaims,
  getStats,
  updateClaimStatus,
  triggerCurfewController,
  triggerEventController,
};
