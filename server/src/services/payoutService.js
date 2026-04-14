const Payout = require("../models/Payout");
const Worker = require("../models/Worker");

const processPayoutForClaim = async (claim) => {
  const existingPayout = await Payout.findOne({ claim_id: claim._id });

  if (existingPayout) {
    return existingPayout;
  }

  const amount = claim.payoutAmount || claim.amount;
  const workerId = claim.worker_id?._id || claim.worker_id;
  const payout = await Payout.create({
    worker_id: workerId,
    claim_id: claim._id,
    amount,
    status: "completed",
  });

  await Worker.findByIdAndUpdate(workerId, {
    $inc: { payout_balance: amount },
  });

  return payout;
};

module.exports = {
  processPayoutForClaim,
};
