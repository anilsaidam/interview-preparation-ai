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
  { value: "thankyou", label: "Thank you" },
];

const initialStats = { totalGenerated: 0, savedTemplates: 0 };
const LS_KEY = "templateGenState:v2";
const SESSION_FLAG = "templateGen_fresh_visit";

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

  // Restore if refresh; reset if first SPA visit
  useEffect(() => {
    const freshVisit = sessionStorage.getItem(SESSION_FLAG);
    if (!freshVisit) {
      sessionStorage.setItem(SESSION_FLAG, "true");
      isMountedRef.current = true;
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (saved.type) setType(saved.type);
      if (saved.targetRole) setTargetRole(saved.targetRole);
      if (saved.yoe) setYoe(saved.yoe);
      if (saved.jd) setJd(saved.jd);
      if (saved.stats && typeof saved.stats === "object") setStats(saved.stats);
      if (saved.template) setTemplate(saved.template);
    } catch {}
    isMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ type, targetRole, yoe, jd, stats, template })
      );
    } catch {}
  }, [type, targetRole, yoe, jd, stats, template]);

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
        setStats((s) => ({ ...s, totalGenerated: (s.totalGenerated || 0) + 1 }));
        toast.success("Template generated");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 502) {
        toast.error("AI service temporarily unavailable. Try again later.");
      } else {
        toast.error(err.response?.data?.message || "Failed to generate template");
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
        setStats((s) => ({ ...s, savedTemplates: (s.savedTemplates || 0) + 1 }));
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
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ ...saved, type: "cold", targetRole: "", yoe: "", jd: "", template: "" })
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                  <LuSparkles className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    AI Email Template Generator
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Generate short, professional emails for cold mail, referral, follow-up, and thank you.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/templates/mylibrary")}
                  className="px-5 py-3 bg-zinc-800/50 text-gray-200 border border-gray-700 rounded-xl hover:bg-zinc-800 transition-colors duration-300 flex items-center gap-2"
                >
                  <LuFolderOpen className="w-5 h-5 text-blue-300" />
                  <span>My Library</span>
                </button>
              </div>
            </div>

            {/* Trackers */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="relative group rounded-xl border border-gray-800 bg-black/30 overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-300" />
                <div className="relative px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Total Generated
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalGenerated || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <LuSparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="relative group rounded-xl border border-gray-800 bg-black/30 overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300" />
                <div className="relative px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Saved Templates
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.savedTemplates || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <LuFileText className="w-5 h-5 text-blue-300" />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative group rounded-xl border border-gray-800 bg-black/30 overflow-hidden">
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-300" />
                <div className="relative px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Generator
                    </div>
                    <div className="text-lg font-semibold text-gray-300">Ready</div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <LuSparkles className="w-5 h-5 text-purple-300" />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative group rounded-xl border border-gray-800 bg-black/30 overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-300" />
                <div className="relative px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Status
                    </div>
                    <div className="text-lg font-semibold text-gray-300">
                      {loading ? "Generating..." : "Idle"}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <LuTarget className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main two-column content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form card */}
            <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800/70 rounded-xl border border-gray-700">
                    <LuTarget className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Template Details</h2>
                </div>

                {/* Clear button appears when any input/template present */}
                {hasAnyInput && (
                  <button
                    onClick={onClear}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-zinc-800 transition-colors"
                    title="Clear"
                  >
                    <LuRotateCcw className="w-4 h-4 text-red-300" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Template Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 text-white border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {TEMPLATE_TYPES.map((t) => (
                      <option key={t.value} className="bg-zinc-900" value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">{reqHelp}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Target Role</label>
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
                    <p className="mt-1 text-xs text-red-400">{errors.targetRole}</p>
                  )}
                </div>

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
                  {errors.yoe && <p className="mt-1 text-xs text-red-400">{errors.yoe}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Job Description (JD)</label>
                  <textarea
                    rows={5}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste key points from the JD"
                    className={`w-full px-4 py-3 bg-black/40 text-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.jd ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  {errors.jd && <p className="mt-1 text-xs text-red-400">{errors.jd}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Resume (File Upload)</label>
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
                  {errors.resume && <p className="mt-1 text-xs text-red-400">{errors.resume}</p>}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-bold disabled:opacity-50 transition-all duration-300 hover:scale-[1.02]"
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

                  <button
                    onClick={onCopy}
                    disabled={!template}
                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border ${
                      copied
                        ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                        : "border-gray-700 text-gray-200 hover:bg-zinc-800"
                    } transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]`}
                  >
                    <LuCopy className={`w-4 h-4 ${copied ? "text-emerald-400" : ""}`} />
                    {copied ? "Copied" : "Copy"}
                  </button>

                  <button
                    onClick={onSave}
                    disabled={!template || saving}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-300 disabled:opacity-50 hover:scale-[1.02]"
                  >
                    {saving ? (
                      <LuLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <LuSave className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800/70 rounded-xl border border-gray-700">
                    <LuFileText className="w-5 h-5 text-blue-300" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Generated Template</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onCopy}
                    disabled={!template}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                      copied
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-black/40 text-white border border-gray-700 hover:bg-zinc-800"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2">
                      <LuCopy className={`w-4 h-4 ${copied ? "text-white" : ""}`} />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </div>
                  </button>
                  <button
                    onClick={onSave}
                    disabled={!template || saving}
                    className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-300 disabled:opacity-50"
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
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-xl p-5 min-h-[260px] overflow-y-auto">
                {loading ? (
                  <div className="text-gray-400">Waiting for AI response...</div>
                ) : template ? (
                  <pre className="whitespace-pre-wrap text-gray-100 text-sm leading-relaxed font-mono">
                    {template}
                  </pre>
                ) : (
                  <div className="text-gray-500 text-sm">
                    The generated template will appear here with a Subject and Email body.
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Output is formatted for direct use in email clients. Review before sending.
              </div>
            </div>
          </div>
        </div>

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