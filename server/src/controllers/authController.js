const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");

const signToken = (worker) =>
  jwt.sign({ id: worker._id }, process.env.JWT_SECRET || "gigshield_demo_secret", {
    expiresIn: "7d",
  });

const sanitizeWorker = (worker) => ({
  _id: worker._id,
  name: worker.name,
  email: worker.email,
  phone: worker.phone,
  city: worker.city,
  pincode: worker.pincode,
  platform: worker.platform,
  payout_balance: worker.payout_balance,
  createdAt: worker.createdAt,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, city, pincode, platform } = req.body;
  const existingWorker = await Worker.findOne({ email: email.toLowerCase() });

  if (existingWorker) {
    return sendError(res, "Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const worker = await Worker.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    city,
    pincode,
    platform,
  });

  return sendSuccess(
    res,
    {
      token: signToken(worker),
      worker: sanitizeWorker(worker),
    },
    "Registration successful",
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const worker = await Worker.findOne({ email: email.toLowerCase() });

  if (!worker) {
    return sendError(res, "Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, worker.password);

  if (!passwordMatches) {
    return sendError(res, "Invalid email or password", 401);
  }

  return sendSuccess(
    res,
    {
      token: signToken(worker),
      worker: sanitizeWorker(worker),
    },
    "Login successful"
  );
});

const me = asyncHandler(async (req, res) => {
  return sendSuccess(
    res,
    {
      worker: sanitizeWorker(req.user),
    },
    "Worker profile fetched"
  );
});

module.exports = {
  register,
  login,
  me,
};
