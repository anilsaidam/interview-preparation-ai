const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  uploadProfileImage,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

//Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// Profile image upload/remove route (protected)
router.post(
  "/upload-image",
  protect,
  upload.single("image"),
  uploadProfileImage
);

module.exports = router;
