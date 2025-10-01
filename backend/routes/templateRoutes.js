// server/routes/templateRoutes.js
// Template Generator endpoints with multer support for multipart/form-data

const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect } = require("../middlewares/authMiddleware");
const {
  generateTemplate,
  saveTemplate,
  getMyTemplates,
  deleteTemplate,
} = require("../controllers/templatesController");

const router = express.Router();

// Multer config: keep in memory for controller to read buffer if needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, and TXT formats are allowed"), false);
    }
  },
});

// Generate a template via Gemini (expects multipart form with optional resume)
router.post("/generate", protect, upload.single("resume"), generateTemplate);

// Save a generated template to user's library (JSON body)
router.post("/save", protect, saveTemplate);

// Get user's saved templates (supports optional query: ?type=&role=)
router.get("/mylibrary", protect, getMyTemplates);

// Delete a saved template by id
router.delete("/:templateId", protect, deleteTemplate);

module.exports = router;
