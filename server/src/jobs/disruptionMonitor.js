const cron = require("node-cron");
const { runDisruptionMonitor } = require("../services/disruptionService");

const startDisruptionMonitor = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const events = await runDisruptionMonitor();
      console.log(`[GigShield Cron] Completed. Events created: ${events.length}`);
    } catch (error) {
      console.error("[GigShield Cron] Failed to run disruption monitor", error);
    }
  });
};

module.exports = startDisruptionMonitor;
