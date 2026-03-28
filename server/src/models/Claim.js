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
    fcs_score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "auto_approved",
        "pending_verification",
        "flagged_fraud",
        "approved",
        "rejected"
      ],
      default: "pending_verification",
      index: true,
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
