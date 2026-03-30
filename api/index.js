const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Vercel API bootstrap failed", error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Failed to connect to the database",
    });
  }
};
