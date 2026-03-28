const Payout = require("../models/Payout");
const Worker = require("../models/Worker");

const processPayoutForClaim = async (claim) => {
  const existingPayout = await Payout.findOne({ claim_id: claim._id });

  if (existingPayout) {
    return existingPayout;
  }

  const payout = await Payout.create({
    worker_id: claim.worker_id,
    claim_id: claim._id,
    amount: claim.amount,
    status: "completed",
  });

  await Worker.findByIdAndUpdate(claim.worker_id, {
    $inc: { payout_balance: claim.amount },
  });

  return payout;
};

module.exports = {
  processPayoutForClaim,
};
