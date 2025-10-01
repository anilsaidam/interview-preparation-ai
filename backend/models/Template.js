// server/models/Resource.js
// Repurposed as Template model for Template Generator feature
const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // "cold" | "referral" | "followup" | "thankyou"
    type: {
      type: String,
      enum: ["cold", "referral", "followup", "thankyou"],
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    // Store as string to allow "1.5" etc.
    yoe: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional for followup/thankyou
    jd: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional metadata if resume uploaded during generation
    resumeName: { type: String, default: null },
    resumeSize: { type: Number, default: null },

    // Parsed output (optional convenience fields)
    subject: { type: String, default: "" },
    body: { type: String, default: "" },

    // Full combined content kept as source of truth
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes
templateSchema.index({ user: 1, type: 1, createdAt: -1 });
templateSchema.index({ user: 1, targetRole: 1 });

module.exports = mongoose.model("Template", templateSchema);
