const sendSuccess = (res, data = {}, message = "Request completed", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, message = "Something went wrong", statusCode = 500, data = {}) => {
  res.status(statusCode).json({
    success: false,
    data,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
