// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// ⭐ KHÔNG ÁP DỤNG CHO OPTIONS (tránh phá CORS)
const skipOptions = (req) => req.method === "OPTIONS";

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5,
  message: {
    status: 429,
    message: "⚠️ Thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  // ⭐ Cho phép OPTIONS đi qua
  skip: skipOptions,

  // ⭐ Nếu muốn log thêm:
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json(options.message);
  },
});

module.exports = { loginLimiter };
