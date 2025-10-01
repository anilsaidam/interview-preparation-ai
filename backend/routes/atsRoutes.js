const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const resumeUpload = require("../middlewares/resumeUploadMiddleware");
const { 
  scoreResume, 
  saveATSReport, 
  getATSReports, 
  getATSReport, 
  downloadATSReport,
  deleteReport 
} = require("../controllers/atsController");

// Accept PDF/DOCX resume upload and optional fields
router.post(
  "/score",
  protect,
  // override file filter at middleware level is not trivial; allow any and validate later
  resumeUpload.single("resume"),
  scoreResume
);

// New ATS report endpoints
router.post("/reports", protect, saveATSReport);
router.get("/reports", protect, getATSReports);
router.get("/reports/:id", protect, getATSReport);
router.get("/reports/:id/download", protect, downloadATSReport);
router.delete("/reports/:id", protect, deleteReport);


module.exports = router;
