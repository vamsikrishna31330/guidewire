const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["Zomato", "Swiggy", "Zepto", "Blinkit", "Other"],
      default: "Other",
    },
    coverage_type: {
      type: String,
      default: "Parametric Gig Worker Weekly Cover",
    },
    weekly_premium: {
      type: Number,
      required: true,
    },
    coverage_amount: {
      type: Number,
      required: true,
    },
    risk_score: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
      index: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    payment_method: {
      type: String,
      default: "mock",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
