const { GoogleGenerativeAI } = require("@google/generative-ai");
const CodingSession = require("../models/CodingSession");
const {
  generateCodingQue,
  addMoreCoding,
  getSolution,
} = require("../utils/prompts");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to extract and parse JSON from AI response
const parseAIResponse = (rawText) => {
  // Use regex to find and extract the JSON array
  const jsonMatch = rawText.match(/```json\s*(\[[\s\S]*?\])\s*```/i);
  let cleaned = jsonMatch ? jsonMatch[1] : rawText.trim();

  // If no markdown fences are found, try to clean the raw text directly
  if (!jsonMatch) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");
  }

  // Fallback to finding array boundaries
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("Response is not a JSON array");
  }
  return parsed;
};

exports.generateCodingQuestions = async (req, res) => {
  try {
    const { topics, experience, difficulty = "Easy", count = 5 } = req.body;
    if (!topics || !experience) {
      return res
        .status(400)
        .json({ message: "topics and experience are required" });
    }

    const prompt = generateCodingQue({ topics, experience, difficulty, count });
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    let questions;
    let retryCount = 0;
    const maxRetries = 2; // Increased retries for better resilience

    while (retryCount <= maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        let rawText = result.response.text();
        questions = parseAIResponse(rawText);

        // Validate questions structure
        const validQuestions = questions.filter(
          (q) =>
            q.statement &&
            q.difficulty &&
            Array.isArray(q.constraints) &&
            Array.isArray(q.examples)
        );

        if (validQuestions.length === 0) {
          throw new Error("No valid questions found in AI response");
        }

        questions = validQuestions;
        break;
      } catch (error) {
        if (retryCount >= maxRetries) {
          return res.status(502).json({
            message: `Failed to generate questions after ${maxRetries + 1} attempts.`,
            error: error.message,
          });
        }
        retryCount++;
      }
    }

    const session = await CodingSession.create({
      user: req.user._id,
      topics,
      experience,
      difficulty,
      questions,
      completed: false,
    });

    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate coding questions",
      error: error.message,
    });
  }
};

exports.listCodingSessions = async (req, res) => {
  try {
    const sessions = await CodingSession.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.togglePinQuestion = async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const session = await CodingSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const question = session.questions.id(questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    question.pinned = !question.pinned;
    session.pinnedCount = session.questions.filter((x) => x.pinned).length;
    await session.save();

    return res.status(200).json({
      session,
      message: question.pinned
        ? "Question pinned successfully"
        : "Question unpinned successfully",
      isPinned: question.pinned,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.addMoreQuestions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { count = 5 } = req.body; // default to 5

    // Fetch session
    const session = await CodingSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Get existing question statements to prevent duplicates
    const existingStatements = session.questions.map(q => q.statement);

    // Build prompt with existing questions filter
    const prompt = addMoreCoding({
      topics: Array.isArray(session.topics) ? session.topics : [session.topics],
      experience: session.experience,
      difficulty: session.difficulty,
      count,
      existingStatements,
    });

    let newQuestions;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(prompt);

        // Extract raw text
        let rawText = result.response.text();

        // Parse response
        newQuestions = parseAIResponse(rawText);

        // Validate & filter
        let validQuestions = newQuestions.filter(
          (q) =>
            q.statement &&
            q.difficulty &&
            Array.isArray(q.constraints) &&
            Array.isArray(q.examples)
        );

        // ✅ Enforce exact count
        if (validQuestions.length > count) {
          validQuestions = validQuestions.slice(0, count);
        }

        if (validQuestions.length < count) {
          throw new Error(
            `AI returned ${validQuestions.length} questions, expected ${count}`
          );
        }

        newQuestions = validQuestions;
        break;
      } catch (error) {
        if (retryCount >= maxRetries) {
          return res.status(502).json({
            message: "AI returned invalid JSON for additional questions",
            error: error.message,
          });
        }
        retryCount++;
      }
    }

    // Save new questions
    session.questions.push(...newQuestions);
    await session.save();

    // 🔥 FIX: Return only the new questions, not the whole session
    return res.status(200).json({ questions: newQuestions });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add more questions",
      error: error.message,
    });
  }
};



exports.getSolution = async (req, res) => {
  try {
    const { sessionId, questionId, language } = req.params;

    const session = await CodingSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const question = session.questions.id(questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // Check if solution already exists for this language, including complexity fields
    if (
      question.solutions &&
      question.solutions.get(language) &&
      question.solutionExplanation &&
      question.timeComplexity &&
      question.spaceComplexity
    ) {
      return res.status(200).json({
        code: question.solutions.get(language),
        explanation: question.solutionExplanation,
        timeComplexity: question.timeComplexity,
        spaceComplexity: question.spaceComplexity,
        cached: true,
      });
    }

    const prompt = getSolution({ language, question });
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    let rawText = result.response.text();

    const cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    try {
      const solution = JSON.parse(cleaned);

      // Cache the complete solution in the database
      if (!question.solutions) {
        question.solutions = new Map();
      }
      question.solutions.set(language, solution.code);
      question.solutionExplanation = solution.explanation;
      question.timeComplexity = solution.timeComplexity;
      question.spaceComplexity = solution.spaceComplexity;

      await session.save();

      return res.status(200).json(solution);
    } catch (parseError) {
      return res.status(502).json({
        message: "AI returned invalid solution format",
        raw: rawText.substring(0, 1000),
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate solution",
      error: error.message,
    });
  }
};

// Add new endpoint for marking sessions as completed
exports.toggleSessionComplete = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await CodingSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.completed = !session.completed;
    await session.save();

    return res.status(200).json({
      message: session.completed
        ? "Session marked as completed"
        : "Session marked as incomplete",
      session,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update session status",
      error: error.message,
    });
  }
};

// Add new endpoint for deleting sessions
exports.deleteCodingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await CodingSession.findOneAndDelete({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.status(200).json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete session",
      error: error.message,
    });
  }
};

// Add new endpoint for getting session statistics
exports.getCodingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalSessions = await CodingSession.countDocuments({ user: userId });
    const activeSessions = await CodingSession.countDocuments({
      user: userId,
      questions: { $exists: true, $not: { $size: 0 } },
    });
    const completedSessions = await CodingSession.countDocuments({
      user: userId,
      completed: true,
    });

    // Calculate total pinned questions across all sessions
    const sessions = await CodingSession.find({ user: userId });
    const totalPinnedQuestions = sessions.reduce((total, session) => {
      return total + (session.questions?.filter((q) => q.pinned)?.length || 0);
    }, 0);

    return res.status(200).json({
      totalSessions,
      activeSessions,
      completedSessions,
      totalPinnedQuestions,
      successStreak: completedSessions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get statistics",
      error: error.message,
    });
  }
};