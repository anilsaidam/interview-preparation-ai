const mongoose = require("mongoose");

const ATSReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    sectionScores: {
      Experience: { type: Number, min: 0, max: 100 },
      Skills: { type: Number, min: 0, max: 100 },
      Education: { type: Number, min: 0, max: 100 },
      Projects: { type: Number, min: 0, max: 100 },
      Formatting: { type: Number, min: 0, max: 100 }
    },
    summary: { type: String, required: true },
    keywordAnalysis: {
      present: [String],
      missing: [String]
    },
    recommendations: [{
      issue: String,
      exampleFix: String
    }],
    originalFileName: String,
    pdfPath: String, // Path to generated PDF report
    role: String,
    experience: String,
    jobDescription: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("ATSReport", ATSReportSchema);
