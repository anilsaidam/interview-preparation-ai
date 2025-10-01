const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate Interview Questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    


    let rawText = result.response.text();

    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// Generate Concept Explanation with caching
const generateConceptExplanation = async (req, res) => {
  try {
    const { question, questionId } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // If questionId is provided, check if explanation already exists
    if (questionId) {
      const Question = require("../models/Question");
      const existingQuestion = await Question.findById(questionId);
      
      if (existingQuestion && existingQuestion.explanation) {
        // Return cached explanation
        return res.status(200).json({
          explanation: existingQuestion.explanation,
          title: "Cached Explanation",
          cached: true
        });
      }
    }

    const prompt = conceptExplainPrompt(question);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);

    let rawText = result.response.text().trim();

    // Try to clean common wrappers
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (e) {
      console.warn("⚠️ JSON parse failed, returning raw text instead");
      data = { output: cleanedText };
    }

    // Cache the explanation in the database if questionId is provided
    if (questionId && (data.explanation || data.output)) {
      const Question = require("../models/Question");
      await Question.findByIdAndUpdate(questionId, {
        explanation: data.explanation || data.output
      });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      message: "Failed to generate concept explanation",
      error: error.message,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
