const express = require("express");
const {
    createSession,
    getSessionById,
    getMySessions,
    deleteSession,
    getSessionStats,
    toggleSessionComplete,
} = require("../controllers/sessionController");
const { protect } = require("../middlewares/authMiddleware");
const resumeUpload = require("../middlewares/resumeUploadMiddleware");

const router = express.Router();

router.post("/create", protect, createSession);
router.get("/my-sessions", protect, getMySessions);
router.get("/stats", protect, getSessionStats);
router.get("/:id", protect, getSessionById);
router.post("/:id/complete", protect, toggleSessionComplete);
router.delete("/:id", protect, deleteSession);

module.exports = router;
