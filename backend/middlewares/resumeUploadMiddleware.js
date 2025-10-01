const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedExtensions = [".pdf", ".docx"];

const fileFilter = (req, file, cb) => {
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
