// src/pages/Templates/TemplateGenerator.jsx
// Updated: Removed Status & Generator trackers, removed rejection type, wider button,
// Inter font for output, fixed totalGenerated counter, reset on navigation, preserve on refresh.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LuCopy,
  LuLoader,
  LuSave,
  LuMail,
  LuTarget,
  LuFileText,
  LuFileUp,
  LuRotateCcw,
  LuSparkles,
  LuFolderOpen,
  LuArrowLeft,
  LuBarcode,
} from "react-icons/lu";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";

const TEMPLATE_TYPES = [
  { value: "cold", label: "Cold mail to recruiter" },
  { value: "referral", label: "Ask for referral" },
  { value: "followup", label: "Follow up" },
];

const initialStats = { totalGenerated: 0, savedTemplates: 0 };
const LS_KEY = "templateGenState:v5";
const SESSION_FLAG = "templateGen_current_session";
const STATS_KEY = "templateGen_persistent_stats"; // Separate key for persistent stats

const TemplateGenerator = () => {
  const navigate = useNavigate();

  // Form state
  const [type, setType] = useState("cold");
  const [targetRole, setTargetRole] = useState("");
  const [yoe, setYoe] = useState("");
  const [jd, setJd] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const isMountedRef = useRef(false);

  const hasAnyInput = useMemo(() => {
    return (
      (type && type !== "cold") ||
      targetRole.trim().length > 0 ||
      yoe.toString().trim().length > 0 ||
      jd.trim().length > 0 ||
      !!resumeFile ||
      template.trim().length > 0
    );
  }, [type, targetRole, yoe, jd, resumeFile, template]);

  // Fetch saved templates count from library
  const fetchSavedTemplatesCount = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.TEMPLATES.MY_LIBRARY);
      const templates = res.data?.templates || [];
      return templates.length;
    } catch (error) {
      console.error("Failed to fetch saved templates count:", error);
      return 0;
    }
  };

  // Load persistent stats (separate from form data)
  const loadPersistentStats = async () => {
    try {
      const persistentStats = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
      const savedTemplatesCount = await fetchSavedTemplatesCount();
      return {
        totalGenerated: persistentStats.totalGenerated || 0,
        savedTemplates: savedTemplatesCount
      };
    } catch {
      const savedTemplatesCount = await fetchSavedTemplatesCount();
      return { ...initialStats, savedTemplates: savedTemplatesCount };
    }
  };

  // Save persistent stats (separate from form data)
  const savePersistentStats = (stats) => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify({
        totalGenerated: stats.totalGenerated
      }));
    } catch {}
  };

  // On mount: check if same session or new navigation
  useEffect(() => {
    const currentSession = sessionStorage.getItem(SESSION_FLAG);
    const isNewNavigation = !currentSession;

    const initializeComponent = async () => {
      // Always load persistent stats regardless of navigation type
      const persistentStats = await loadPersistentStats();
      setStats(persistentStats);

      if (isNewNavigation) {
        // Fresh navigation from another page: reset form but keep stats
        sessionStorage.setItem(SESSION_FLAG, Date.now().toString());
        setType("cold");
        setTargetRole("");
        setYoe("");
        setJd("");
        setResumeFile(null);
        setTemplate("");
        setErrors({});
        setCopied(false);
        
        // Clear only form data from localStorage, keep stats separate
        try {
          localStorage.setItem(LS_KEY, JSON.stringify({ 
            type: "cold", 
            targetRole: "", 
            yoe: "", 
            jd: "", 
            template: "" 
          }));
        } catch {}
      } else {
        // Same session (refresh): restore form data
        try {
          const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
          if (saved.type) setType(saved.type);
          if (saved.targetRole) setTargetRole(saved.targetRole);
          if (saved.yoe) setYoe(saved.yoe);
          if (saved.jd) setJd(saved.jd);
          if (saved.template) setTemplate(saved.template);
        } catch {}
      }
    };
    
    initializeComponent();
    isMountedRef.current = true;
  }, []);

  // Persist form data to localStorage on state change (separate from stats)
  useEffect(() => {
    if (!isMountedRef.current) return;
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ type, targetRole, yoe, jd, template })
      );
    } catch {}
  }, [type, targetRole, yoe, jd, template]);

  const validate = () => {
    const next = {};
    const isStrict = type === "cold" || type === "referral";
    if (!targetRole.trim()) next.targetRole = "Target Role is required";
    if (!yoe.toString().trim()) next.yoe = "YOE is required";
    if (isStrict) {
      if (!jd.trim()) next.jd = "Job Description is required";
      if (!resumeFile) next.resume = "Resume file is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error("Resume is too large (max 5MB)");
      return;
    }
    setResumeFile(f);
  };

  const buildFormData = async () => {
    const fd = new FormData();
    fd.append("type", type);
    fd.append("targetRole", targetRole.trim());
    fd.append("yoe", yoe.toString().trim());
    fd.append("jd", jd.trim());
    if (resumeFile) fd.append("resume", resumeFile);
    return fd;
  };

  const onGenerate = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted errors");
      return;
    }
    setLoading(true);
    setTemplate("");
    setCopied(false);

    try {
      const fd = await buildFormData();
      const res = await axiosInstance.post(API_PATHS.TEMPLATES.GENERATE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const out = res?.data?.template || "";
      if (!out) {
        toast.error("No template received. Please try again.");
      } else {
        setTemplate(out.trim());
        // Increment totalGenerated properly and persist separately
        setStats((prevStats) => {
          const newStats = {
            ...prevStats,
            totalGenerated: (prevStats.totalGenerated || 0) + 1,
          };
          // Persist stats separately
          savePersistentStats(newStats);
          return newStats;
        });
        toast.success("Template generated");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 502) {
        toast.error("AI service temporarily unavailable. Try again later.");
      } else {
        toast.error(
          err.response?.data?.message || "Failed to generate template"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      toast.success("Template copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const onSave = async () => {
    if (!template.trim()) {
      toast.error("Nothing to save");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type,
        targetRole: targetRole.trim(),
        yoe: yoe.toString().trim(),
        jd: jd.trim(),
        content: template.trim(),
      };
      const res = await axiosInstance.post(API_PATHS.TEMPLATES.SAVE, payload);
      if (res.data?.success) {
        // Refresh saved templates count from API
        const refreshSavedCount = async () => {
          const savedTemplatesCount = await fetchSavedTemplatesCount();
          setStats((prevStats) => {
            const newStats = {
              ...prevStats,
              savedTemplates: savedTemplatesCount,
            };
            // No need to persist saved count as it's fetched from API
            return newStats;
          });
        };
        refreshSavedCount();
        toast.success(res.data?.message || "Template saved to library");
      } else {
        toast.success("Template saved");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.alreadyExists) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || "Failed to save template");
      }
    } finally {
      setSaving(false);
    }
  };

  const onClear = () => {
    setType("cold");
    setTargetRole("");
    setYoe("");
    setJd("");
    setResumeFile(null);
    setTemplate("");
    setErrors({});
    setCopied(false);
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          type: "cold",
          targetRole: "",
          yoe: "",
          jd: "",
          template: "",
        })
      );
    } catch {}
    toast.success("Cleared");
  };

  const reqHelp =
    type === "cold" || type === "referral"
      ? "All fields are required for this template type."
      : "Only Target Role and YOE are required for this template type.";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 sm:p-3 rounded-xl bg-zinc-800/70 border border-gray-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Back to Dashboard"
                >
                  <LuArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </button>
                <div className="p-2 sm:p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                  <LuMail className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    AI Email Template Generator
                  </h1>
                  <p className="text-gray-400 mt-1 text-sm sm:text-base">
                    Generate professional emails for cold outreach, referrals,
                    and follow-ups.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/templates/mylibrary")}
                  className="px-4 sm:px-5 py-2 sm:py-3 bg-zinc-800/50 text-gray-200 border border-gray-700 rounded-xl hover:bg-zinc-800 transition-colors duration-300 flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <LuFolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                  <span>My Library</span>
                </button>
              </div>
            </div>

            {/* Trackers: Only 2 trackers now - 60% narrower and responsive */}
            <div className="flex mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4 sm:px-0">
                <div className="relative group rounded-2xl border border-gray-800 bg-black/30 overflow-hidden h-28">
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-300" />
                  <div className="relative h-full px-3 py-4 flex flex-col justify-between">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Total Generated
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-extrabold text-white">
                        {stats.totalGenerated || 0}
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <LuSparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group rounded-2xl border border-gray-800 bg-black/30 overflow-hidden h-28">
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300" />
                  <div className="relative h-full px-3 py-4 flex flex-col justify-between">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Saved Templates
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-extrabold text-white">
                        {stats.savedTemplates || 0}
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <LuFileText className="w-4 h-4 text-blue-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main two-column content - responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Form card */}
            <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 order-1 xl:order-1">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-zinc-800/70 rounded-xl border border-gray-700">
                    <LuTarget className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Template Details
                  </h2>
                </div>

                {hasAnyInput && (
                  <button
                    onClick={onClear}
                    className="inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-zinc-800 transition-colors cursor-pointer text-sm"
                    title="Clear"
                  >
                    <LuRotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-red-300" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Type */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Template Type
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full appearance-none px-4 py-3 bg-black/40 text-white border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                    >
                      {TEMPLATE_TYPES.map((t) => (
                        <option
                          key={t.value}
                          className="bg-zinc-900"
                          value={t.value}
                        >
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ▾
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{reqHelp}</p>
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    className={`w-full px-4 py-3 bg-black/40 text-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.targetRole ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  {errors.targetRole && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.targetRole}
                    </p>
                  )}
                </div>

                {/* YOE */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Years of Experience (YOE)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={yoe}
                    onChange={(e) => setYoe(e.target.value)}
                    placeholder="e.g., 1.5"
                    className={`w-full px-4 py-3 bg-black/40 text-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.yoe ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  {errors.yoe && (
                    <p className="mt-1 text-xs text-red-400">{errors.yoe}</p>
                  )}
                </div>

                {/* JD */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Job Description (JD)
                  </label>
                  <textarea
                    rows={5}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste key points from the JD"
                    className={`w-full px-4 py-3 bg-black/40 text-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.jd ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  {errors.jd && (
                    <p className="mt-1 text-xs text-red-400">{errors.jd}</p>
                  )}
                </div>

                {/* Resume */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Resume (File Upload)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 cursor-pointer">
                      <LuFileUp className="w-4 h-4" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={onFileChange}
                      />
                    </label>
                    <span className="text-gray-400 text-sm truncate max-w-[60%]">
                      {resumeFile ? resumeFile.name : "No file selected"}
                    </span>
                  </div>
                  {errors.resume && (
                    <p className="mt-1 text-xs text-red-400">{errors.resume}</p>
                  )}
                </div>

                {/* Generate - Wider button */}
                <div className="pt-2">
                  <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <LuLoader className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <LuMail className="w-5 h-5 text-emerald-600" />
                        Get Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Output */}
            <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 order-2 xl:order-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-zinc-800/70 rounded-xl border border-gray-700">
                    <LuFileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Generated Template
                  </h2>
                </div>

                {/* Show copy/save only after response */}
                {template && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onCopy}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                        copied
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-black/40 text-white border border-gray-700 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LuCopy
                          className={`w-4 h-4 ${copied ? "text-white" : ""}`}
                        />
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </div>
                    </button>
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {saving ? (
                          <LuLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <LuSave className="w-4 h-4" />
                        )}
                        <span>{saving ? "Saving..." : "Save"}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-xl p-5 min-h-[260px] overflow-y-auto">
                {loading ? (
                  <div className="text-gray-400">
                    Waiting for AI response...
                  </div>
                ) : template ? (
                  <pre className="whitespace-pre-wrap text-gray-100 text-[14px] leading-relaxed font-['Inter',ui-sans-serif,system-ui,-apple-system,sans-serif]">
                    {template}
                  </pre>
                ) : (
                  <div className="text-gray-500 text-sm">
                    The generated template will appear here with a Subject and
                    Email body.
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Output is formatted for direct use in email clients. Review
                before sending.
              </div>
            </div>
          </div>
        </div>

        {/* Custom Scrollbar */}
        <style>
          {`
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: #374151; border-radius: 3px; }
            ::-webkit-scrollbar-thumb { background: #6b7280; border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
};

export default TemplateGenerator;
