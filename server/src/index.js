const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const app = require("./app");
const connectDB = require("./config/db");
const startDisruptionMonitor = require("./jobs/disruptionMonitor");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`GigShield server listening on port ${PORT}`);
    });
    startDisruptionMonitor();
  } catch (error) {
    console.error("Failed to start GigShield server", error);
    process.exit(1);
  }
};

startServer();
