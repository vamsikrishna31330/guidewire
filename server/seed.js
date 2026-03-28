const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const Worker = require("./src/models/Worker");
const Policy = require("./src/models/Policy");
const Claim = require("./src/models/Claim");
const Payout = require("./src/models/Payout");
const DisruptionEvent = require("./src/models/DisruptionEvent");
const Notification = require("./src/models/Notification");

const seed = async () => {
  await connectDB();

  await Promise.all([
    Worker.deleteMany({}),
    Policy.deleteMany({}),
    Claim.deleteMany({}),
    Payout.deleteMany({}),
    DisruptionEvent.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const password = await bcrypt.hash("Password@123", 10);

  const workers = await Worker.insertMany([
    {
      name: "Arjun Mehta",
      email: "arjun@gigshield.demo",
      password,
      phone: "9876543210",
      city: "Bengaluru",
      pincode: "560001",
      platform: "Swiggy",
      payout_balance: 1592,
    },
    {
      name: "Priya Nair",
      email: "priya@gigshield.demo",
      password,
      phone: "9988776655",
      city: "Mumbai",
      pincode: "400001",
      platform: "Zomato",
      payout_balance: 960,
    },
    {
      name: "Rahul Singh",
      email: "rahul@gigshield.demo",
      password,
      phone: "9123456780",
      city: "Delhi",
      pincode: "110001",
      platform: "Blinkit",
      payout_balance: 0,
    },
  ]);

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const policies = await Policy.insertMany([
    {
      worker_id: workers[0]._id,
      city: "Bengaluru",
      pincode: "560001",
      platform: "Swiggy",
      weekly_premium: 149,
      coverage_amount: 1192,
      risk_score: 59.6,
      status: "active",
      start_date: now,
      end_date: sevenDaysFromNow,
      payment_method: "UPI",
    },
    {
      worker_id: workers[1]._id,
      city: "Mumbai",
      pincode: "400001",
      platform: "Zomato",
      weekly_premium: 120,
      coverage_amount: 960,
      risk_score: 48.2,
      status: "active",
      start_date: yesterday,
      end_date: sevenDaysFromNow,
      payment_method: "Wallet",
    },
  ]);

  const claims = await Claim.insertMany([
    {
      policy_id: policies[0]._id,
      worker_id: workers[0]._id,
      disruption_type: "HEAVY_RAIN",
      description: "Road flooding caused delivery suspension in MG Road.",
      amount: 1192,
      fcs_score: 12,
      status: "auto_approved",
      auto_triggered: false,
      location_proof: "Swiggy heatmap screenshot",
      fraud_signals: {
        mock_location_flag: false,
        claim_velocity: 0,
        historical_presence_mismatch: false,
      },
      createdAt: new Date(now.getTime() - (18 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (18 * 60 * 60 * 1000)),
    },
    {
      policy_id: policies[0]._id,
      worker_id: workers[0]._id,
      disruption_type: "HIGH_WIND_SPEED",
      description: "High wind advisory paused bike delivery slots.",
      amount: 1192,
      fcs_score: 46,
      status: "pending_verification",
      auto_triggered: true,
      location_proof: "System-triggered disruption claim",
      fraud_signals: {
        mock_location_flag: false,
        claim_velocity: 30,
        historical_presence_mismatch: false,
      },
      createdAt: new Date(now.getTime() - (8 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (8 * 60 * 60 * 1000)),
    },
    {
      policy_id: policies[1]._id,
      worker_id: workers[1]._id,
      disruption_type: "POOR_AIR_QUALITY",
      description: "AQI crossed safe limits and delivery incentives were paused.",
      amount: 960,
      fcs_score: 32,
      status: "pending_verification",
      auto_triggered: false,
      location_proof: "Customer zone AQI notification",
      fraud_signals: {
        mock_location_flag: false,
        claim_velocity: 30,
        historical_presence_mismatch: false,
      },
      createdAt: new Date(now.getTime() - (5 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (5 * 60 * 60 * 1000)),
    },
    {
      policy_id: policies[1]._id,
      worker_id: workers[1]._id,
      disruption_type: "SIMULATED_CURFEW",
      description: "Admin-simulated civic curfew event for demo review.",
      amount: 960,
      fcs_score: 74,
      status: "flagged_fraud",
      auto_triggered: false,
      location_proof: "mock gps trail generated for demo",
      fraud_signals: {
        mock_location_flag: true,
        claim_velocity: 30,
        historical_presence_mismatch: false,
      },
      createdAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
    },
    {
      policy_id: policies[1]._id,
      worker_id: workers[1]._id,
      disruption_type: "EXTREME_HEAT",
      description: "Delivery slots paused during noon heatwave.",
      amount: 960,
      fcs_score: 20,
      status: "approved",
      auto_triggered: false,
      location_proof: "Platform outage message",
      fraud_signals: {
        mock_location_flag: false,
        claim_velocity: 0,
        historical_presence_mismatch: false,
      },
      createdAt: new Date(now.getTime() - (28 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (3 * 60 * 60 * 1000)),
    },
  ]);

  await Payout.insertMany([
    {
      worker_id: workers[0]._id,
      claim_id: claims[0]._id,
      amount: 1192,
      status: "completed",
      createdAt: new Date(now.getTime() - (16 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (16 * 60 * 60 * 1000)),
    },
    {
      worker_id: workers[1]._id,
      claim_id: claims[4]._id,
      amount: 960,
      status: "completed",
      createdAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
    },
  ]);

  await DisruptionEvent.insertMany([
    {
      trigger_type: "HEAVY_RAIN",
      city: "Bengaluru",
      pincode: "560001",
      severity: "high",
      affected_policies: [policies[0]._id],
      timestamp: new Date(now.getTime() - (10 * 60 * 60 * 1000)),
      createdAt: new Date(now.getTime() - (10 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (10 * 60 * 60 * 1000)),
    },
    {
      trigger_type: "POOR_AIR_QUALITY",
      city: "Mumbai",
      pincode: "400001",
      severity: "critical",
      affected_policies: [policies[1]._id],
      timestamp: new Date(now.getTime() - (4 * 60 * 60 * 1000)),
      createdAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)),
    },
  ]);

  await Notification.insertMany([
    {
      worker_id: workers[0]._id,
      message: "Heavy rain trigger detected. Claim auto-created for review.",
      read: false,
      createdAt: new Date(now.getTime() - (10 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (10 * 60 * 60 * 1000)),
    },
    {
      worker_id: workers[0]._id,
      message: "Payout of INR 1192 completed for your heavy rain claim.",
      read: true,
      createdAt: new Date(now.getTime() - (15 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (15 * 60 * 60 * 1000)),
    },
    {
      worker_id: workers[1]._id,
      message: "AQI trigger is active in your city. Claim is pending verification.",
      read: false,
      createdAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)),
      updatedAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)),
    },
  ]);

  console.log("GigShield demo data seeded successfully.");
  console.log("Demo login: arjun@gigshield.demo / Password@123");
  console.log("Demo login: priya@gigshield.demo / Password@123");

  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
