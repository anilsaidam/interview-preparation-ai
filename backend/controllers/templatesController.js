const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Template = require("../models/Template");
const { buildTemplatePrompt } = require("../utils/prompts");
const axios = require("axios"); // Added import for axios

// Initialize AI client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helpers
const sanitize = (s) => String(s || "").trim();

const pickResumeFromReq = (req) => {
  // multer memory storage places the single file at req.file
  if (req.file) return req.file;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (
    req.files &&
    req.files.resume &&
    Array.isArray(req.files.resume) &&
    req.files.resume.length > 0
  ) {
    return req.files.resume[0];
  }
  return null;
};

// FIX: Removed the explicit file type check to allow all files
const extractTxtHighlights = async (file) => {
  try {
    if (!file || !file.buffer) return "";
    
    // Check if the file is likely plain text
    const isText =
      (file.mimetype && file.mimetype.startsWith("text/")) ||
      (file.originalname || "").toLowerCase().endsWith(".txt");
      
    if (isText) {
        const text = file.buffer.toString("utf-8");
        return text.slice(0, 1500).replace(/\s+/g, " ").trim();
    } else {
        // For non-text files, we currently can't extract highlights.
        // We can either return an empty string or provide a placeholder.
        return ""; 
    }

  } catch (err) {
    return "";
  }
};

const normalizeGeminiOutput = (txt) => {
  if (!txt) return "";

  let out = String(txt)
  .replace(/```/g, "") // Removes all instances of ```
  .replace(/\r/g, "")
  .trim();

  const hasSubject = /(^|\n)\s*Subject\s*:/i.test(out);
  const hasEmail = /(^|\n)\s*Email\s*:/i.test(out);

  if (!hasSubject) {
    const lines = out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 0 && lines.length <= 120) {
      const first = lines.shift();
      out = `Subject: ${first}\n\nEmail:\n${lines.join("\n")}`.trim();
    } else {
      out = `Subject: Application update\n\nEmail:\n${out}`.trim();
    }
  } else if (!hasEmail) {
    const parts = out.split(/\n/);
    const subjIdx = parts.findIndex((l) => /(^|\s)Subject\s*:/i.test(l));
    if (subjIdx >= 0) {
      const subjectLine = parts[subjIdx];
      const rest = [...parts.slice(0, subjIdx), ...parts.slice(subjIdx + 1)]
        .join("\n")
        .trim();
      const cleanSubject = subjectLine.replace(/.*Subject\s*:\s*/i, "").trim();
      out = `Subject: ${cleanSubject}\n\nEmail:\n${rest}`;
    } else {
      out = `Subject: Application update\n\nEmail:\n${out}`;
    }
  }

  return out.trim();
};

const splitSubjectBody = (content) => {
  if (!content) return { subject: "", body: "" };
  const subjectMatch = content.match(/Subject\s*:\s*(.*?)(?:\n|$)/i);
  const subject = subjectMatch ? sanitize(subjectMatch) : "";
  const emailIndex = content.search(/(^|\n)\s*Email\s*:/i);
  let body = "";
  if (emailIndex >= 0) {
    body = content.slice(emailIndex).replace(/(^|\n)\s*Email\s*:\s*/i, "");
  } else if (subjectMatch) {
    body = content.slice(subjectMatch.index + subjectMatch.length);
  } else {
    body = content;
  }
  return { subject: sanitize(subject), body: body.trim() };
};

const validateFields = ({ type, targetRole, yoe, jd, resume }) => {
  const errs = {};
  const tr = sanitize(targetRole);
  const y = sanitize(yoe);
  const j = sanitize(jd);

  if (!tr) errs.targetRole = "Target Role is required";
  if (!y) errs.yoe = "YOE is required";

  const strict = type === "cold" || type === "referral";
  if (strict) {
    if (!j) errs.jd = "Job Description is required";
    if (!resume) errs.resume = "Resume file is required";
  }

  return errs;
};

// Generate Template
exports.generateTemplate = async (req, res) => {
  try {
    // Auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Validate .env configuration early (like atsController)
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "AI configuration missing",
        error: "GEMINI_API_KEY is not set",
      });
    }

    // Parse form data (multer has populated req.body and req.file)
    const type = sanitize((req.body && req.body.type) || "cold").toLowerCase();
    const targetRole = sanitize((req.body && req.body.targetRole) || "");
    const yoe = sanitize((req.body && req.body.yoe) || "");
    const jd = sanitize((req.body && req.body.jd) || "");
    const resumeFile = pickResumeFromReq(req);

    // Validate inputs
    const errors = validateFields({ type, targetRole, yoe, jd, resume: resumeFile });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // Optional highlights
    const resumeHighlights = await extractTxtHighlights(resumeFile);

    // Build prompt
    const prompt = buildTemplatePrompt(type, {
      targetRole,
      yoe,
      jd,
      resumeHighlights,
    });

    // Call model (align with atsController style)
    let output = "";
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent(prompt);
      try {
        output = result.response.text();
      } catch {
        output = result?.response?.candidates?.content?.parts?.text || "";
      }
    } catch (modelErr) {
      console.error("[ERROR] Gemini generateContent failed:", modelErr?.message);
      return res.status(502).json({
        message: "AI service is temporarily unavailable",
        error: modelErr?.message || "Unknown AI error",
      });
    }

    // Normalize output
    output = normalizeGeminiOutput(output);

    // Guarantee subject and email fields
    if (!/Subject\s*:/i.test(output)) {
      output = `Subject: ${targetRole || "Application"} opportunity\n\nEmail:\n${output}`;
    }
    if (!/Email\s*:/i.test(output)) {
      output = `${output}\n\nEmail:\nThank you for your time.`;
    }

    return res.status(200).json({
      template: output.trim(),
      meta: {
        type,
        usedResume: Boolean(resumeFile),
        resumeName: resumeFile?.originalname || null,
        resumeSize: resumeFile?.size || null,
      },
    });
  } catch (error) {
    console.error("[ERROR] Generate template:", error);
    return res.status(500).json({
      message: "Failed to generate template",
      error: error.message,
    });
  }
};

// Save Template
exports.saveTemplate = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
        authError: true,
      });
    }

    const type = sanitize(req.body.type || "");
    const targetRole = sanitize(req.body.targetRole || "");
    const yoe = sanitize(req.body.yoe || "");
    const jd = sanitize(req.body.jd || "");
    const content = sanitize(req.body.content || "");

    if (!["cold", "referral", "followup", "thankyou"].includes(type)) {
      return res.status(400).json({ message: "Valid template type is required" });
    }
    if (!targetRole) {
      return res.status(400).json({ message: "Target Role is required" });
    }
    if (!yoe) {
      return res.status(400).json({ message: "YOE is required" });
    }
    if (!content) {
      return res.status(400).json({ message: "Template content is required" });
    }

    const { subject, body } = splitSubjectBody(content);

    // Avoid duplicates
    const existing = await Template.findOne({
      user: req.user._id,
      type,
      targetRole,
      yoe,
      content,
    });
    if (existing) {
      return res.status(200).json({
        message: "Template already saved",
        alreadyExists: true,
        template: existing,
      });
    }

    const doc = await Template.create({
      user: req.user._id,
      type,
      targetRole,
      yoe,
      jd,
      subject,
      body,
      content,
    });

    return res
      .status(201)
      .json({ message: "Template saved successfully", success: true, template: doc });
  } catch (error) {
    console.error("[ERROR] Save template:", error);
    return res.status(500).json({
      message: "Failed to save template",
      error: error.message,
    });
  }
};

// Get My Templates
exports.getMyTemplates = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
        authError: true,
      });
    }

    const { type, role } = req.query;
    const filter = { user: req.user._id };

    if (type && type !== "all") {
      filter.type = type;
    }
    if (role && String(role).trim()) {
      filter.targetRole = { $regex: String(role).trim(), $options: "i" };
    }

    const templates = await Template.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      templates,
      total: templates.length,
      filters: { type: type || "all", role: role || "" },
    });
  } catch (error) {
    console.error("[ERROR] Get templates:", error);
    return res.status(500).json({
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

// Delete Template
exports.deleteTemplate = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
        authError: true,
      });
    }

    const { templateId } = req.params;
    const template = await Template.findOneAndDelete({
      _id: templateId,
      user: req.user._id,
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("[ERROR] Delete template:", error);
    return res.status(500).json({
      message: "Failed to delete template",
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