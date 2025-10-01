const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  generateCodingQuestions,
  listCodingSessions,
  togglePinQuestion,
  getSolution,
  addMoreQuestions,
  toggleSessionComplete,
  deleteCodingSession,
  getCodingStats,
} = require("../controllers/codingController");

router.post("/generate", protect, generateCodingQuestions);
router.get("/sessions", protect, listCodingSessions);
router.post(
  "/sessions/:sessionId/questions/:questionId/pin",
  protect,
  togglePinQuestion
);
router.post("/sessions/:sessionId/add-questions", protect, addMoreQuestions);
router.get(
  "/sessions/:sessionId/questions/:questionId/solution/:language",
  protect,
  getSolution
);

// New routes for enhanced functionality
router.get("/stats", protect, getCodingStats);
router.post("/sessions/:sessionId/complete", protect, toggleSessionComplete);
router.delete("/sessions/:sessionId", protect, deleteCodingSession);

module.exports = router;
