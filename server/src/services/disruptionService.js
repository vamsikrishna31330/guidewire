const Policy = require("../models/Policy");
const Worker = require("../models/Worker");
const Claim = require("../models/Claim");
const Notification = require("../models/Notification");
const DisruptionEvent = require("../models/DisruptionEvent");
const { getZoneConditions } = require("./externalDataService");
const { detectTriggers } = require("./riskService");
const { createClaim } = require("./claimService");

const getActivePolicies = async () => {
  await Policy.updateMany(
    {
      status: "active",
      end_date: { $lt: new Date() },
    },
    {
      $set: { status: "expired" },
    }
  );

  return Policy.find({
    status: "active",
    end_date: { $gte: new Date() },
  }).populate("worker_id");
};

const eventAlreadyCreatedRecently = async ({ triggerType, city, pincode }) => {
  const lookback = new Date(Date.now() - (6 * 60 * 60 * 1000));
  const existing = await DisruptionEvent.findOne({
    trigger_type: triggerType,
    city,
    pincode,
    timestamp: { $gte: lookback },
  });

  return Boolean(existing);
};

const createDisruptionEvent = async ({ trigger, city, pincode, affectedPolicies }) => {
  const duplicate = await eventAlreadyCreatedRecently({
    triggerType: trigger.trigger_type,
    city,
    pincode,
  });

  if (duplicate) {
    return null;
  }

  return DisruptionEvent.create({
    trigger_type: trigger.trigger_type,
    city,
    pincode,
    severity: trigger.severity,
    affected_policies: affectedPolicies.map((policy) => policy._id),
    timestamp: new Date(),
  });
};

const ensureAutoClaimForPolicy = async (policy, trigger) => {
  const existingClaim = await Claim.findOne({
    policy_id: policy._id,
    disruption_type: trigger.trigger_type,
    createdAt: { $gte: new Date(Date.now() - (24 * 60 * 60 * 1000)) },
  });

  if (existingClaim) {
    return existingClaim;
  }

  const worker = policy.worker_id?._id ? policy.worker_id : await Worker.findById(policy.worker_id);
  const { claim } = await createClaim({
    worker,
    policy,
    disruptionType: trigger.trigger_type,
    description: `Auto-triggered by GigShield because ${trigger.metric} was detected in ${policy.city}.`,
    locationProof: "System-triggered disruption claim",
    autoTriggered: true,
    presetStatus: "pending_verification",
    presetFcs: 0,
  });

  await Notification.create({
    worker_id: worker._id,
    message: `${trigger.trigger_type.replaceAll("_", " ")} detected in ${policy.city}. Claim ${claim._id} is pending verification.`,
  });

  return claim;
};

const evaluateZone = async (city, pincode, policies) => {
  const conditions = await getZoneConditions(city, pincode);
  const triggers = detectTriggers(conditions);

  return {
    city,
    pincode,
    conditions,
    triggers,
    policies,
  };
};

const triggerCurfew = async (city, pincode) => {
  const policies = await Policy.find({
    city,
    pincode,
    status: "active",
    end_date: { $gte: new Date() },
  }).populate("worker_id");

  const curfewTrigger = {
    trigger_type: "SIMULATED_CURFEW",
    severity: "critical",
    metric: "Manual admin curfew simulation",
  };

  const event = await createDisruptionEvent({
    trigger: curfewTrigger,
    city,
    pincode,
    affectedPolicies: policies,
  });

  if (event) {
    for (const policy of policies) {
      await ensureAutoClaimForPolicy(policy, curfewTrigger);
    }
  }

  return { event, affectedCount: policies.length };
};

const runDisruptionMonitor = async () => {
  console.log(`[GigShield Cron] Running disruption monitor at ${new Date().toISOString()}`);
  const policies = await getActivePolicies();

  if (!policies.length) {
    console.log("[GigShield Cron] No active policies found.");
    return [];
  }

  const zones = new Map();
  policies.forEach((policy) => {
    const key = `${policy.city}::${policy.pincode}`;
    if (!zones.has(key)) {
      zones.set(key, []);
    }
    zones.get(key).push(policy);
  });

  const eventsCreated = [];

  for (const [key, zonePolicies] of zones.entries()) {
    const [city, pincode] = key.split("::");
    const zoneResult = await evaluateZone(city, pincode, zonePolicies);
    console.log(`[GigShield Cron] ${city} ${pincode} -> ${zoneResult.triggers.length} triggers`);

    for (const trigger of zoneResult.triggers) {
      const event = await createDisruptionEvent({
        trigger,
        city,
        pincode,
        affectedPolicies: zonePolicies,
      });

      if (!event) {
        console.log(`[GigShield Cron] Skipped duplicate event ${trigger.trigger_type} for ${city} ${pincode}`);
        continue;
      }

      for (const policy of zonePolicies) {
        await ensureAutoClaimForPolicy(policy, trigger);
      }

      eventsCreated.push(event);
      console.log(`[GigShield Cron] Event created: ${trigger.trigger_type} for ${city} ${pincode}`);
    }
  }

  return eventsCreated;
};

module.exports = {
  evaluateZone,
  triggerCurfew,
  runDisruptionMonitor,
};
