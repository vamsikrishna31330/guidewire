const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },
    claim_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending"],
      default: "completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", payoutSchema);
