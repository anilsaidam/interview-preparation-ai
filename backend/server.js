require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const atsRoutes = require("./routes/atsRoutes");
const { protect } = require("./middlewares/authMiddleware");
const codingRoutes = require("./routes/codingRoutes");
const templatesRoutes = require("./routes/templateRoutes")
const {
    generateInterviewQuestions,
    generateConceptExplanation,
} = require("./controllers/aiController");

const app = express();

//Middleware to handle CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-type", "Authorization"],
    })
);

connectDB();

//Middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/templates", templatesRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

//serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
