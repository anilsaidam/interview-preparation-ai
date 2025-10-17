const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const atsRoutes = require("./routes/atsRoutes");
const { protect } = require("./middlewares/authMiddleware");
const codingRoutes = require("./routes/codingRoutes");
const templatesRoutes = require("./routes/templateRoutes");
const {
  generateInterviewQuestions,
  generateConceptExplanation,
} = require("./controllers/aiController");

const app = express();

// Enhanced DB Connect with error handling
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

connectDB();

// CORS Middleware
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/templates", templatesRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root API route - health check
app.get("/", (req, res) => {
  res.send("Career Companion AI backend is running!");
});

// Export the app for Vercel serverless function
module.exports = app;
