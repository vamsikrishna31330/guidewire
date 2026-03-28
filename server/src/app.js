const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const policyRoutes = require("./routes/policyRoutes");
const claimRoutes = require("./routes/claimRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { sendSuccess } = require("./utils/response");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  sendSuccess(res, { status: "ok" }, "GigShield API is healthy");
});

app.use("/api/auth", authRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
