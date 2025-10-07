import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import DashboardLayout from "../components/layouts/DashboardLayout";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { toast } from "react-hot-toast";
import { LuDownload, LuSave, LuCopy, LuFileText, LuInfo, LuRotateCcw, LuArrowLeft } from "react-icons/lu";

const LS_KEYS = {
  FORM: "ats_form_v2",
  RESULT: "ats_result_v2",
  SHOW_TWO_COL: "ats_show_two_col_v2",
  FILE_NAME: "ats_file_name_v2"
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const ATSScore = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [showTwoColumn, setShowTwoColumn] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);

  // Animated score state
  const targetScore = useMemo(
    () => clamp(result?.overallScore ?? result?.score ?? 0, 0, 100),
    [result]
  );
  const [animatedScore, setAnimatedScore] = useState(0);
  const rafRef = useRef(null);

  const navigate = useNavigate();

  // Restore persisted form and result on mount
  useEffect(() => {
    try {
      const savedForm = JSON.parse(localStorage.getItem(LS_KEYS.FORM) || "{}");
      if (savedForm) {
        setRole(savedForm.role || "");
        setExperience(savedForm.experience || "");
        setJobDescription(savedForm.jobDescription || "");
      }
      const savedResult = JSON.parse(localStorage.getItem(LS_KEYS.RESULT) || "null");
      const savedShow = localStorage.getItem(LS_KEYS.SHOW_TWO_COL);
      const savedFileName = localStorage.getItem(LS_KEYS.FILE_NAME) || "";
      if (savedResult) {
        setResult(savedResult);
      }
      if (savedShow === "true") {
        setShowTwoColumn(true);
      }
      // File cannot be restored across refresh (browser security), but show filename hint if needed
      if (savedFileName) {
        // no-op visual hint handled in UI
      }
    } catch {}
    fetchSavedReports();
    // Cleanup preview URL when unmount
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist form fields on change
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEYS.FORM,
        JSON.stringify({ role, experience, jobDescription })
      );
    } catch {}
  }, [role, experience, jobDescription]);

  // Persist result and layout mode
  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem(LS_KEYS.RESULT, JSON.stringify(result));
        localStorage.setItem(LS_KEYS.SHOW_TWO_COL, showTwoColumn ? "true" : "false");
      }
    } catch {}
  }, [result, showTwoColumn]);

  // Animate score whenever targetScore changes or result updates
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const duration = 900; // ms
    const start = performance.now();
    const from = 0;
    const to = Number(targetScore) || 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      setAnimatedScore(val);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetScore]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!file) {
      setError("Please upload your resume (PDF/DOCX)");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", file);
      if (role) formData.append("role", role);
      if (experience) formData.append("experience", experience);
      if (jobDescription) formData.append("jobDescription", jobDescription);

      const response = await axiosInstance.post(API_PATHS.ATS.SCORE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data.data || response.data;
      setResult(data);

      // Persist result and form context
      try {
        localStorage.setItem(LS_KEYS.RESULT, JSON.stringify(data));
        localStorage.setItem(LS_KEYS.SHOW_TWO_COL, "true");
        localStorage.setItem(
          LS_KEYS.FORM,
          JSON.stringify({ role, experience, jobDescription })
        );
        localStorage.setItem(LS_KEYS.FILE_NAME, file?.name || "");
      } catch {}

      // Create resume preview URL for PDF files
      if (file && file.type === "application/pdf") {
        const previewUrl = URL.createObjectURL(file);
        setResumePreviewUrl(previewUrl);
      }

      // Switch to two-column layout
      setShowTwoColumn(true);

      toast.success("Resume analyzed successfully!");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "Failed to score resume. Please try again.";
      setError(errorMsg);

      if (err?.response?.data?.raw) {
        console.error("AI Response Debug:", err.response.data.raw);
        toast.error("AI returned unexpected response. Please try again.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!result) return;

    try {
      setSaving(true);
      const response = await axiosInstance.post("/api/ats/reports", {
        reportData: {
          ...result,
          role,
          experience,
          jobDescription,
        },
        originalFileName: file?.name || localStorage.getItem(LS_KEYS.FILE_NAME) || "resume",
      });

      toast.success("Report saved successfully!");
      fetchSavedReports();
    } catch (err) {
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const fetchSavedReports = async () => {
    try {
      const response = await axiosInstance.get("/api/ats/reports");
      setSavedReports(response.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch saved reports:", err);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await axiosInstance.get(
        `/api/ats/reports/${reportId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ats-report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  const copyExample = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Example copied to clipboard!");
  };

  const onResetForm = () => {
    setFile(null);
    setRole("");
    setExperience("");
    setJobDescription("");
    setError("");
    // Clear persisted form and file name only (keep last result so the results page can still persist if already shown)
    try {
      localStorage.removeItem(LS_KEYS.FORM);
      localStorage.removeItem(LS_KEYS.FILE_NAME);
    } catch {}
    // Clear preview URL
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(null);
    }
    toast.success("Form reset");
  };

  // Derived values for circular meter
  const dash = animatedScore * 2.83;
  const strokeColor =
    animatedScore >= 80 ? "#10b981" : animatedScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-6">
          {!showTwoColumn ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Form */}
              <div className="lg:col-span-1 bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  {/* Back arrow to dashboard */}
                <div className="flex items-center justify-between mb-0.5">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="p-2 rounded-xl bg-zinc-800/70 border border-gray-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Back to Dashboard"
                    type="button"
                  >
                    <LuArrowLeft className="w-5 h-5 text-blue-400 " />
                  </button>
                  <div className="h-5" />
                </div>
                  <h2 className="text-xl font-bold text-white">ATS Resume Score</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/ats-score/saved-reports")}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <LuFileText className="w-4 h-4" />
                      Saved Reports ({savedReports.length})
                    </button>
                    <button
                      onClick={() => setShowReports(!showReports)}
                      className="text-sm text-gray-400 hover:text-gray-200 p-2 rounded-xl hover:bg-gray-700 transition-colors"
                      title="Toggle recent reports"
                    >
                      {showReports ? "▼" : "▶"}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-6">
                  Upload your resume (PDF or DOCX). Optionally add target role, years of experience, and JD for a market-aware, India-2025 evaluation.
                </p>

                {/* Saved Reports List */}
                {showReports && (
                  <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl">
                    <h3 className="text-sm font-semibold mb-3 text-white">Saved Reports</h3>
                    {savedReports.length === 0 ? (
                      <p className="text-xs text-gray-500">No saved reports yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {savedReports.slice(0, 3).map((report) => (
                          <div
                            key={report._id}
                            className="flex items-center justify-between text-xs bg-zinc-700/50 p-2 rounded-lg"
                          >
                            <span className="truncate text-gray-300">
                              Score: {report.overallScore}/100 •{" "}
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => downloadReport(report._id)}
                              className="text-blue-400 hover:text-blue-300 ml-2 p-1 rounded hover:bg-blue-500/20 transition-colors"
                            >
                              <LuDownload className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* File input with white button */}
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="file-input-custom block w-full text-sm text-gray-300 cursor-pointer"
                    />
                    {/* Filename hint if persisted but file not reloaded */}
                    {!file && localStorage.getItem(LS_KEYS.FILE_NAME) ? (
                      <div className="text-xs text-gray-500 mt-2">
                        Last uploaded: {localStorage.getItem(LS_KEYS.FILE_NAME)} (reselect to preview)
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <input
                      placeholder="Target Role (optional)"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <input
                      placeholder="Years of Experience (optional)"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <textarea
                      placeholder="Job Description (optional)"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 p-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Scoring..." : "Get ATS Score"}
                    </button>

                    {/* Reset button only when a file is selected */}
                    {file && (
                      <button
                        type="button"
                        onClick={onResetForm}
                        className="px-4 py-4 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                        title="Reset form"
                      >
                        <LuRotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right: Result preview area or placeholder */}
              <div className="lg:col-span-2">
                {result ? (
                  <div className="space-y-6">
                    {/* Header with Save Button */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">ATS Analysis Results</h2>
                      <button
                        onClick={saveReport}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                      >
                        <LuSave className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Report"}
                      </button>
                    </div>

                    {/* Animated Overall Score Card */}
                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center justify-center">
                          <div className="relative w-48 h-48">
                            <svg className="w-48 h-48" viewBox="0 0 100 100">
                              <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#ffffff" />
                                  <stop offset="100%" stopColor="#9ca3af" />
                                </linearGradient>
                              </defs>
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="#374151"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke={strokeColor}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${dash} 999`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className="text-5xl font-bold text-white">{animatedScore}</div>
                              <div className="text-sm text-gray-400">ATS Score</div>
                            </div>
                          </div>
                        </div>

                        {result.summary && (
                          <div className="flex-1">
                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-gray-600">
                              <h3 className="font-semibold mb-2 text-white">Summary</h3>
                              <p className="text-sm text-gray-300">{result.summary}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Breakdown */}
                    {result.sectionScores && (
                      <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-white">Section Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(result.sectionScores).map(
                            ([section, sectionScore]) => (
                              <div
                                key={section}
                                className="p-4 bg-zinc-800/50 rounded-xl border border-gray-600"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-white">{section}</h4>
                                  <span
                                    className={`text-lg font-bold ${
                                      sectionScore >= 80
                                        ? "text-green-400"
                                        : sectionScore >= 60
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {sectionScore}/100
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      sectionScore >= 80
                                        ? "bg-green-500"
                                        : sectionScore >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${sectionScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Keyword Analysis */}
                    {result.keywordAnalysis && (
                      <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-white">Keyword Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              Present Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(result.keywordAnalysis.present || []).map(
                                (keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-green-500/20 text-green-300 border border-green-500/20 px-3 py-1 rounded-full font-medium"
                                  >
                                    {keyword}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              Missing Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(result.keywordAnalysis.missing || []).map(
                                (keyword, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      copyExample(`Added experience with ${keyword}`)
                                    }
                                    className="text-xs bg-red-500/20 text-red-300 border border-red-500/20 px-3 py-1 rounded-full hover:bg-red-500/30 transition-colors cursor-pointer font-medium"
                                    title="Click for example sentence"
                                  >
                                    {keyword}
                                  </button>
                                )
                              )}
                            </div>
                            {result.keywordAnalysis.missing?.length > 0 && (
                              <p className="text-xs text-gray-500 mt-3">
                                💡 Click on missing keywords to get example sentences
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actionable Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-white">
                          Actionable Recommendations
                        </h3>
                        <div className="space-y-4">
                          {result.recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-yellow-500/20 border-l-4 border-yellow-400 rounded-r-xl"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <LuInfo className="w-4 h-4 text-yellow-400" />
                                    <h4 className="font-semibold text-yellow-300">
                                      Issue: {rec.issue}
                                    </h4>
                                  </div>
                                  <div className="mb-3">
                                    <p className="text-sm text-gray-300 mb-3">
                                      Why it matters: Improves ATS parsing and recruiter readability
                                    </p>
                                    <div className="bg-zinc-800/50 p-3 rounded-xl border border-gray-600">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                          EXAMPLE FIX:
                                        </span>
                                        <button
                                          onClick={() => copyExample(rec.exampleFix)}
                                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                                        >
                                          <LuCopy className="w-3 h-3" />
                                          Copy
                                        </button>
                                      </div>
                                      <p className="text-sm text-gray-200 font-mono bg-black/50 p-3 rounded-lg border border-gray-600">
                                        "{rec.exampleFix}"
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full min-h-96 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-600 rounded-2xl bg-zinc-900/20">
                    <LuFileText className="w-16 h-16 mb-4 text-gray-600" />
                    <p className="text-xl font-semibold mb-2 text-white">Upload Your Resume</p>
                    <p className="text-sm text-center max-w-md text-gray-400">
                      Submit your resume to get a comprehensive ATS score with actionable recommendations and keyword analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Two-Column Layout with Resume Preview and Results */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Resume Preview */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Resume Preview</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onResetForm}
                      className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
                      title="Reset form"
                    >
                      <LuRotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        setShowTwoColumn(false);
                        setResult(null);
                        try {
                          localStorage.setItem(LS_KEYS.SHOW_TWO_COL, "false");
                          localStorage.removeItem(LS_KEYS.RESULT);
                        } catch {}
                        if (resumePreviewUrl) {
                          URL.revokeObjectURL(resumePreviewUrl);
                          setResumePreviewUrl(null);
                        }
                      }}
                      className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      ← Back to Upload
                    </button>
                  </div>
                </div>

                {resumePreviewUrl ? (
                  <div className="h-[800px] border border-gray-600 rounded-xl overflow-hidden bg-white">
                    <iframe
                      src={resumePreviewUrl}
                      className="w-full h-full"
                      title="Resume Preview"
                    />
                  </div>
                ) : (
                  <div className="h-[800px] border border-gray-600 rounded-xl flex items-center justify-center bg-zinc-800/50">
                    <div className="text-center text-gray-400">
                      <LuFileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg font-semibold mb-2 text-white">Preview Not Available</p>
                      <p className="text-sm">
                        Resume preview is only available for PDF files.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: ATS Report */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">ATS Analysis Results</h2>
                  <button
                    onClick={saveReport}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-3 bg-white text-black font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                  >
                    <LuSave className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Report"}
                  </button>
                </div>

                <div className="space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                  {/* Animated Overall Score (compact) */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="#374151" strokeWidth="8" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke={strokeColor}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${animatedScore * 2.83} 999`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-white">{animatedScore}</div>
                        <div className="text-xs text-gray-400">ATS Score</div>
                      </div>
                    </div>
                    {result?.summary && (
                      <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl text-left border border-gray-600">
                        <h3 className="font-semibold mb-2 text-sm text-white">Summary</h3>
                        <p className="text-xs text-gray-300">{result.summary}</p>
                      </div>
                    )}
                  </div>

                  {/* Section Breakdown */}
                  {result?.sectionScores && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-white">Section Breakdown</h3>
                      <div className="space-y-3">
                        {Object.entries(result.sectionScores).map(
                          ([section, sectionScore]) => (
                            <div
                              key={section}
                              className="p-3 bg-zinc-800/50 rounded-xl border border-gray-600"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm text-white">{section}</h4>
                                <span
                                  className={`text-sm font-bold ${
                                    sectionScore >= 80
                                      ? "text-green-400"
                                      : sectionScore >= 60
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {sectionScore}/100
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    sectionScore >= 80
                                      ? "bg-green-500"
                                      : sectionScore >= 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${sectionScore}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Keyword Analysis */}
                  {result?.keywordAnalysis && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-white">Keyword Analysis</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Present Keywords
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {(result.keywordAnalysis.present || []).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-green-500/20 text-green-300 border border-green-500/20 px-2 py-1 rounded-full font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Missing Keywords
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {(result.keywordAnalysis.missing || []).map((keyword, idx) => (
                              <button
                                key={idx}
                                onClick={() => copyExample(`Added experience with ${keyword}`)}
                                className="text-xs bg-red-500/20 text-red-300 border border-red-500/20 px-2 py-1 rounded-full hover:bg-red-500/30 transition-colors cursor-pointer font-medium"
                                title="Click for example sentence"
                              >
                                {keyword}
                              </button>
                            ))}
                          </div>
                          {result.keywordAnalysis.missing?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              💡 Click on missing keywords to get example sentences
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Actionable Recommendations */}
                  {result?.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-white">Actionable Recommendations</h3>
                      <div className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-yellow-500/20 border-l-4 border-yellow-400 rounded-r-xl"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <LuInfo className="w-3 h-3 text-yellow-400" />
                                  <h4 className="font-semibold text-yellow-300 text-sm">
                                    Issue: {rec.issue}
                                  </h4>
                                </div>
                                <div className="mb-2">
                                  <p className="text-xs text-gray-300 mb-2">
                                    Why it matters: Improves ATS parsing and recruiter readability
                                  </p>
                                  <div className="bg-black/50 p-2 rounded-xl border border-gray-600">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                        EXAMPLE FIX:
                                      </span>
                                      <button
                                        onClick={() => copyExample(rec.exampleFix)}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-1 py-0.5 rounded hover:bg-blue-500/20 transition-colors"
                                      >
                                        <LuCopy className="w-3 h-3" />
                                        Copy
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-200 font-mono bg-zinc-800/50 p-2 rounded border border-gray-600">
                                      "{rec.exampleFix}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Styles */}
        <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #374151;
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #6b7280;
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }

            .file-input-custom::file-selector-button {
              margin-right: 1rem;
              padding: 0.75rem 1rem;
              border-radius: 0.75rem;
              border: 0;
              font-size: 0.875rem;
              font-weight: 600;
              background: #ffffff;
              color: #000000;
              transition: all 0.3s ease;
            }
            .file-input-custom::file-selector-button:hover {
              background: #f3f4f6;
            }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
};

export default ATSScore;
