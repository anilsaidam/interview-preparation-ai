const multer = require("multer");
const path = require("path");

// Use memory storage instead of diskStorage
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedExtensions = [".pdf", ".docx"];

const fileFilter = (req, file, cb) => {
  if (req.body && req.body.remove === "true") {
    return cb(null, true);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX formats are allowed"), false);
  }
};

const resumeUpload = multer({ storage, fileFilter });

module.exports = resumeUpload;
