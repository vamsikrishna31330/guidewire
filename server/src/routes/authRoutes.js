const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { register, login, me } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
    body("phone").trim().notEmpty().withMessage("phone is required"),
    body("city").trim().notEmpty().withMessage("city is required"),
    body("pincode")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("pincode must be 6 digits"),
    body("platform")
      .isIn(["Zomato", "Swiggy", "Zepto", "Blinkit", "Other"])
      .withMessage("platform must be a supported value"),
    validate,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("valid email is required"),
    body("password").notEmpty().withMessage("password is required"),
    validate,
  ],
  login
);

router.get("/me", auth, me);

module.exports = router;
