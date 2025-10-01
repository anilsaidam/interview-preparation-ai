const mongoose = require("mongoose");

const CodingQuestionSchema = new mongoose.Schema(
  {
    statement: String,
    constraints: [String],
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false }, // Some test cases can be hidden from user
      },
    ],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    pinned: { type: Boolean, default: false },
    solved: { type: Boolean, default: false },
    solutionExplanation: String,
    // Official solutions for each supported language
    solutions: {
      type: Map,
      of: String,
      default: undefined
    },
    // Input/Output metadata for proper parsing
    inputFormat: {
      type: String,
      default: "single_line" // single_line, multi_line, array, matrix, etc.
    },
    outputFormat: {
      type: String,
      default: "single_value" // single_value, array, matrix, etc.
    },
    dataTypes: {
      input: [String], // ["integer", "array<integer>", "string"]
      output: String,  // "integer", "array<integer>", "string"
    }
  },
  { _id: true }
);

const CodingSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topics: String,
    experience: String,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    questions: [CodingQuestionSchema],
    solvedCount: { type: Number, default: 0 },
    pinnedCount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingSession", CodingSessionSchema);
