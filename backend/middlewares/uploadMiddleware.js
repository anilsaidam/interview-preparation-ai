const multer = require("multer");

// Use memory storage instead of diskStorage
const storage = multer.memoryStorage();

// File filter - allows only jpeg, jpg, png mimetypes
const fileFilter = (req, file, cb) => {
  if (req.body && req.body.remove === "true") {
    // Skip validation if remove operation
    return cb(null, true);
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg and .png formats are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
