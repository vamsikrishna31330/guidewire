const mongoose = require("mongoose");

const disruptionEventSchema = new mongoose.Schema(
  {
    trigger_type: {
      type: String,
      required: true,
      trim: true,
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
    severity: {
      type: String,
      required: true,
      trim: true,
    },
    affected_policies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Policy",
      }
    ],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DisruptionEvent", disruptionEventSchema);
