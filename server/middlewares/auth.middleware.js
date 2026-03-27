const asyncHandler = require("../utilities/asyncHandler.utility.js");
const ErrorHandler = require("../utilities/errorHandler.utility.js");
const jwt = require("jsonwebtoken");

const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ErrorHandler("Not authorized, token missing", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId || decoded.id, role: decoded.role };
    next();
  } catch (err) {
    throw new ErrorHandler("Not authorized, token invalid", 401);
  }
});

module.exports = { isAuthenticated };