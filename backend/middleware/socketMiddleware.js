/**
 * Middleware to make Socket.io accessible in route handlers
 */
const socketMiddleware = (req, res, next) => {
  req.io = req.app.get("io");
  next();
};

module.exports = socketMiddleware;
