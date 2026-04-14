const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true,
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    disruption_type: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payoutAmount: {
      type: Number,
      default: 0,
    },
    fcs_score: {
      type: Number,
      default: 0,
    },
    fcsScore: {
      type: Number,
      default: 0,
    },
    fcsBreakdown: {
      type: Object,
      default: {},
    },
    fcsDecision: {
      type: String,
      enum: ["Verified", "Pending", "Flagged"],
      default: "Pending",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "auto_approved",
        "pending_verification",
        "flagged_fraud",
        "approved",
        "rejected",
        "Verified",
        "Pending",
        "Flagged",
        "Paid"
      ],
      default: "pending_verification",
      index: true,
    },
    claimed_pincode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },
    auto_triggered: {
      type: Boolean,
      default: false,
    },
    location_proof: {
      type: String,
      default: "",
      trim: true,
    },
    fraud_signals: {
      mock_location_flag: {
        type: Boolean,
        default: false,
      },
      claim_velocity: {
        type: Number,
        default: 0,
      },
      historical_presence_mismatch: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
