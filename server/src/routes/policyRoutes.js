const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getQuote,
  purchasePolicy,
  getMyPolicy,
} = require("../controllers/policyController");

const router = express.Router();

router.get("/quote", getQuote);
router.post(
  "/purchase",
  auth,
  [
    body("city").trim().notEmpty().withMessage("city is required"),
    body("pincode")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("pincode must be 6 digits"),
    body("platform")
      .optional()
      .isIn(["Zomato", "Swiggy", "Zepto", "Blinkit", "Other"])
      .withMessage("platform must be a supported value"),
    body("weekly_premium").optional().isNumeric().withMessage("weekly_premium must be numeric"),
    body("coverage_amount").optional().isNumeric().withMessage("coverage_amount must be numeric"),
    body("payment_method").trim().notEmpty().withMessage("payment_method is required"),
    validate,
  ],
  purchasePolicy
);
router.get("/my", auth, getMyPolicy);

module.exports = router;
