const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const connectDB = require("../../server/src/config/db");
const { runDisruptionMonitor } = require("../../server/src/services/disruptionService");

module.exports = async (req, res) => {
  try {
    if (process.env.CRON_SECRET) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({
          success: false,
          data: {},
          message: "Unauthorized cron request",
        });
      }
    }

    await connectDB();
    const events = await runDisruptionMonitor();

    return res.status(200).json({
      success: true,
      data: {
        events_created: events.length,
      },
      message: "Disruption monitor executed",
    });
  } catch (error) {
    console.error("Vercel cron failed", error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Failed to run disruption monitor",
    });
  }
};
