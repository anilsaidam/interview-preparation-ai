const mongoose = require("mongoose");

const ATSResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: String,
    experience: String,
    jobDescription: String,
    filePath: String,
    score: Number,
    summary: String,
    keywordSuggestions: [String],
    improvements: [String],
    sections: [
      {
        name: String,
        score: Number,
        feedback: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ATSResult", ATSResultSchema);



