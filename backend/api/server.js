const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const sessionRoutes = require("../routes/sessionRoutes");
const questionRoutes = require("../routes/questionRoutes");
const atsRoutes = require("../routes/atsRoutes");
const { protect } = require("../middlewares/authMiddleware");
const codingRoutes = require("../routes/codingRoutes");
const templatesRoutes = require("../routes/templateRoutes");
const {
  generateInterviewQuestions,
  generateConceptExplanation,
} = require("../controllers/aiController");

const app = express();

app.use(
  cors({
    origin: [
      "https://career-companion-ai-xi.vercel.app/",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
    credentials: true
  })
);

connectDB();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/templates", templatesRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {}));

app.get('/', (req, res) => {
  res.send('Career Companion AI backend is running!');
});

// Export as a serverless function
module.exports = app;
