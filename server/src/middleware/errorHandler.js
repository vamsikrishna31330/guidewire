const { sendError } = require("../utils/response");

const notFound = (req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  sendError(res, err.message || "Internal server error", statusCode);
};

module.exports = {
  notFound,
  errorHandler,
};
