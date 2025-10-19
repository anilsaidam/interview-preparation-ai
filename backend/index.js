const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express(); 

// Import routes and middleware
const authRoutes = require("../routes/authRoutes");
const sessionRoutes = require("../routes/sessionRoutes");
const questionRoutes = require("../routes/questionRoutes");
const atsRoutes = require("../routes/atsRoutes");
const codingRoutes = require("../routes/codingRoutes");
const templatesRoutes = require("../routes/templateRoutes");
const { protect } = require("../middlewares/authMiddleware");
const {
  generateInterviewQuestions,
  generateConceptExplanation,
} = require("../controllers/aiController");

// Database connection helper with error handling
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB already connected");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: [
      "https://career-companion-ai-xi.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.originalUrl);
  next();
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/templates", templatesRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root route
app.get("/", (req, res) => {
  res.send("Career Companion AI backend is running 🚀");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ status: "success" });
});

//  Render-ready: listen on environment PORT or 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
