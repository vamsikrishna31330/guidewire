const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return sendError(res, "Validation failed", 422, {
    errors: errors.array(),
  });
};

module.exports = validate;
