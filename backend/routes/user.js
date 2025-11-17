const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, checkRole } = require("../middleware/auth");
const Log = require("../models/Log");
const { logActivity } = require("../middleware/logger");
const { loginLimiter } = require("../middleware/rateLimiter");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// ========== AUTH ==========
router.post("/signup", userController.signup);
router.post("/login", loginLimiter, userController.login);
router.post("/logout", userController.logout);
router.post("/refresh-token", userController.refreshToken);

// ========== PROFILE ==========
router.get("/profile", authMiddleware, userController.getProfile);

router.put(
  "/profile",
  authMiddleware,
  logActivity("UPDATE_PROFILE"),
  userController.updateProfile
);

router.delete("/profile", authMiddleware, userController.deleteSelf);

router.post(
  "/upload-avatar",
  upload.single("avatar"),
  authMiddleware,
  userController.uploadAvatar
);

// ========== ADMIN / MOD ==========
router.get("/", authMiddleware, checkRole(["admin", "moderator"]), userController.getUsers);

router.delete(
  "/:id",
  authMiddleware,
  checkRole("admin"),
  logActivity("DELETE_USER"),
  userController.deleteUser
);

router.put(
  "/update-role/:id",
  authMiddleware,
  checkRole("admin"),
  userController.updateUserRole
);

// ========== FORGOT PASSWORD ==========
router.post("/forgot-password", userController.forgotPassword);
router.put("/reset/:token", userController.resetPassword);

// ========== LOGS ==========
router.get("/logs", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập logs" });
    }

    const logs = await Log.find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tải logs" });
  }
});

module.exports = router;
