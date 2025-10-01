const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ATSResult = require("../models/ATSResult");
const ATSReport = require("../models/ATSReport");
const { atsScorePrompt } = require("../utils/prompts");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromResume(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await pdfParse(dataBuffer);
      return result.text || "";
    }
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "";
    }
    throw new Error(`Unsupported file format: ${ext}`);
  } catch (error) {
    console.error('[ERROR] Text extraction failed:', error.message);
    throw new Error('Failed to extract text from resume file');
  }
}

// Helper function to parse AI response with retry logic
const parseATSResponse = (rawText, retryAttempt = 0) => {
  console.log(`[DEBUG] ATS AI response (attempt ${retryAttempt + 1}):`, rawText.substring(0, 500));
  
  // Clean markdown fences and extra text
  let cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/^[^{]*/, "") // Remove any text before first {
    .replace(/[^}]*$/, ""); // Remove any text after last }
  
  // Try to find JSON object boundaries
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  try {
    const parsed = JSON.parse(cleaned);
    
    // Validate required fields
    if (!parsed.overallScore || !parsed.sectionScores || !parsed.summary) {
      throw new Error('Missing required fields in ATS response');
    }
    
    return parsed;
  } catch (parseError) {
    console.error(`[DEBUG] ATS JSON parse failed (attempt ${retryAttempt + 1}):`, parseError.message);
    throw parseError;
  }
};

// Generate PDF report
const generatePDFReport = async (reportData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('ATS Score Report', 50, 50);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
      
      // Overall Score
      doc.fontSize(16).text(`Overall Score: ${reportData.overallScore}/100`, 50, 120);
      
      // Section Scores
      doc.fontSize(14).text('Section Breakdown:', 50, 160);
      let yPos = 180;
      Object.entries(reportData.sectionScores).forEach(([section, score]) => {
        doc.fontSize(12).text(`${section}: ${score}/100`, 70, yPos);
        yPos += 20;
      });
      
      // Summary
      yPos += 20;
      doc.fontSize(14).text('Summary:', 50, yPos);
      doc.fontSize(10).text(reportData.summary, 50, yPos + 20, { width: 500 });
      
      // Keywords
      yPos += 100;
      doc.fontSize(14).text('Keyword Analysis:', 50, yPos);
      doc.fontSize(12).text('Present:', 70, yPos + 20);
      doc.fontSize(10).text(reportData.keywordAnalysis.present.join(', '), 70, yPos + 35, { width: 400 });
      doc.fontSize(12).text('Missing:', 70, yPos + 60);
      doc.fontSize(10).text(reportData.keywordAnalysis.missing.join(', '), 70, yPos + 75, { width: 400 });
      
      // Recommendations
      yPos += 120;
      doc.fontSize(14).text('Recommendations:', 50, yPos);
      reportData.recommendations.forEach((rec, index) => {
        yPos += 25;
        doc.fontSize(11).text(`${index + 1}. ${rec.issue}`, 70, yPos);
        doc.fontSize(9).text(`Example: ${rec.exampleFix}`, 90, yPos + 15, { width: 450 });
        yPos += 30;
      });
      
      doc.end();
      
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

exports.scoreResume = async (req, res) => {
  try {
    const file = req.file;
    const { role, experience, jobDescription } = req.body;

    if (!file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const resumeText = (await extractTextFromResume(file.path)).slice(0, 180000);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        message: "Unable to extract text from resume. Please upload a valid PDF/DOCX.",
      });
    }

    const prompt = atsScorePrompt({
      resumeText,
      role: role || "",
      experience: experience || "",
      jobDescription: jobDescription || "",
    });

    let data;
    let retryCount = 0;
    const maxRetries = 1;
    
    while (retryCount <= maxRetries) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(retryCount === 0 ? prompt : 
          "Return the same ATS analysis as a raw JSON object only, with no explanation or markdown fences.");
        
        let rawText;
        try {
          rawText = result.response.text();
        } catch (textError) {
          rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
        
        data = parseATSResponse(rawText, retryCount);
        break;
        
      } catch (error) {
        console.error(`[DEBUG] ATS generation attempt ${retryCount + 1} failed:`, error.message);
        
        if (retryCount >= maxRetries) {
          console.error('[DEBUG] All ATS retry attempts failed');
          return res.status(502).json({
            message: 'AI returned invalid JSON for ATS analysis',
            raw: rawText ? rawText.substring(0, 5000) : 'No response text'
          });
        }
        
        retryCount++;
      }
    }

    // Save to legacy ATSResult for backward compatibility
    try {
      await ATSResult.create({
        user: req.user?._id,
        role,
        experience,
        jobDescription,
        filePath: file.path,
        score: data.overallScore,
        summary: data.summary,
        keywordSuggestions: data.keywordAnalysis?.missing || [],
        improvements: data.recommendations?.map(r => r.issue) || [],
        sections: Object.entries(data.sectionScores || {}).map(([title, score]) => ({
          title,
          strengths: [],
          issues: []
        })),
      });
    } catch (dbErr) {
      console.warn("ATSResult save failed:", dbErr?.message);
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[ERROR] Score resume:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to score resume",
      error: error.message,
    });
  }
};

// Save ATS report
exports.saveATSReport = async (req, res) => {
  try {
    const { reportData, originalFileName } = req.body;
    
    if (!reportData || !reportData.overallScore) {
      return res.status(400).json({ message: "Report data is required" });
    }
    
    // Generate PDF
    const pdfFileName = `ats-report-${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '../uploads/reports', pdfFileName);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(pdfPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    await generatePDFReport(reportData, pdfPath);
    
    // Save to database
    const report = await ATSReport.create({
      user: req.user._id,
      overallScore: reportData.overallScore,
      sectionScores: reportData.sectionScores,
      summary: reportData.summary,
      keywordAnalysis: reportData.keywordAnalysis,
      recommendations: reportData.recommendations,
      originalFileName,
      pdfPath,
      role: reportData.role,
      experience: reportData.experience,
      jobDescription: reportData.jobDescription
    });
    
    return res.status(201).json({
      success: true,
      message: "Report saved successfully",
      reportId: report._id
    });
  } catch (error) {
    console.error('[ERROR] Save ATS report:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to save report",
      error: error.message,
    });
  }
};

// Get user's ATS reports
exports.getATSReports = async (req, res) => {
  try {
    const reports = await ATSReport.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('overallScore originalFileName createdAt _id'); // Only include necessary fields for list view
    
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('[ERROR] Get ATS reports:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to get reports",
      error: error.message,
    });
  }
};

// Get specific ATS report
exports.getATSReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await ATSReport.findOne({ 
      _id: id, 
      user: req.user._id 
    });
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('[ERROR] Get ATS report:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to get report",
      error: error.message,
    });
  }
};

// Download ATS report PDF
exports.downloadATSReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await ATSReport.findOne({ 
      _id: id, 
      user: req.user._id 
    });
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
      return res.status(404).json({ message: "PDF file not found" });
    }
    
    res.download(report.pdfPath, `ats-report-${report._id}.pdf`);
  } catch (error) {
    console.error('[ERROR] Download ATS report:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to download report",
      error: error.message,
    });
  }
};

// Delete ATS report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ATSReport.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // also clean up PDF file if it exists
    if (report.pdfPath && fs.existsSync(report.pdfPath)) {
      fs.unlinkSync(report.pdfPath);
    }

    return res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("[ERROR] Delete ATS report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};
