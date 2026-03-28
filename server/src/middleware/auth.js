const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");
const { sendError } = require("../utils/response");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, "Authorization token is required", 401);
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "gigshield_demo_secret");
    const worker = await Worker.findById(decoded.id).select("-password");

    if (!worker) {
      return sendError(res, "Worker account not found", 401);
    }

    req.user = worker;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

module.exports = auth;
