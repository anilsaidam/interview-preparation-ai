// src/pages/Templates/MyLibrary.jsx
// Polished templates library with colored icons, card layout, modal preview with copy,
// back arrow to Template Generator, and consistent dark UI.

import React, { useState, useEffect } from "react";
import {
  LuBookmark,
  LuTrash2,
  LuFilter,
  LuSearch,
  LuLoader,
  LuLibrary,
  LuMail,
  LuCalendar,
  LuCopy,
  LuArrowLeft,
  LuTag,
  LuUser,
} from "react-icons/lu";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "cold", label: "Cold mail" },
  { value: "referral", label: "Referral" },
  { value: "followup", label: "Follow up" },
  { value: "thankyou", label: "Thank you" },
];

const typeBadge = (t) => {
  switch (t) {
    case "cold":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/25";
    case "referral":
      return "bg-purple-500/15 text-purple-300 border border-purple-500/25";
    case "followup":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/25";
    case "thankyou":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25";
    default:
      return "bg-gray-500/15 text-gray-300 border border-gray-500/25";
  }
};

const MyLibrary = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("");

  // UI state
  const [deletingId, setDeletingId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, roleFilter]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (roleFilter.trim()) params.append("role", roleFilter.trim());

      const res = await axiosInstance.get(
        `${API_PATHS.TEMPLATES.MY_LIBRARY}?${params.toString()}`
      );
      setTemplates(res.data?.templates || []);
    } catch (error) {
      console.error("Fetch templates error:", error);
      toast.error("Failed to load your templates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    setDeletingId(id);
    try {
      await axiosInstance.delete(API_PATHS.TEMPLATES.DELETE(id));
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      // Close preview if deleting the previewed item
      if (previewItem && previewItem._id === id) {
        setPreviewOpen(false);
        setPreviewItem(null);
      }
      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Delete template error:", error);
      toast.error("Failed to delete template. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const openPreview = (tpl) => {
    setPreviewItem(tpl);
    setCopied(false);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
    setCopied(false);
  };

  const copyTemplate = async (content) => {
    try {
      await navigator.clipboard.writeText(content || "");
      setCopied(true);
      toast.success("Template copied");
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const totalCount = templates.length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/templates")}
                    className="p-3 rounded-xl bg-zinc-800/70 border border-gray-700 hover:bg-zinc-800 transition-colors"
                    title="Back to Template Generator"
                  >
                    <LuArrowLeft className="w-6 h-6 text-emerald-400" />
                  </button>
                  <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                    <LuLibrary className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      My Templates
                    </h1>
                    <p className="text-gray-400 text-lg">
                      Saved email templates ({totalCount} total)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/templates")}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all duration-300"
                >
                  <LuMail className="w-4 h-4" />
                  Template Generator
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-zinc-800/70 rounded-xl border border-gray-700">
                <LuFilter className="w-5 h-5 text-emerald-300" />
              </div>
              <h2 className="text-xl font-bold text-white">Filter Templates</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Role Search */}
              <div className="flex-1">
                <div className="relative group">
                  <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-emerald-400 transition-colors duration-300" />
                  <input
                    type="text"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    placeholder="Filter by target role..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-black/40 text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-3 bg-black/40 border border-gray-700 rounded-xl px-4 py-3 hover:border-gray-600 transition-colors duration-300">
                <LuTag className="w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <LuLoader className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading your templates...</p>
              </div>
            </div>
          ) : totalCount > 0 ? (
            <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl">
              <div className="p-6 lg:p-8">
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="group relative bg-zinc-900/50 border border-gray-700 rounded-2xl p-6 hover:bg-zinc-900/70 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
                      onClick={() => openPreview(tpl)}
                    >
                      {/* Card Head */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="pr-3">
                          <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                            <LuUser className="w-4 h-4 text-emerald-300" />
                            <span className="truncate">{tpl.targetRole}</span>
                          </div>
                          <div className="text-xs text-gray-500">YOE: {tpl.yoe}</div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${typeBadge(
                            tpl.type
                          )}`}
                          onClick={(e) => e.stopPropagation()}
                          title={tpl.type}
                        >
                          {tpl.type === "cold"
                            ? "Cold mail"
                            : tpl.type === "referral"
                            ? "Referral"
                            : tpl.type === "followup"
                            ? "Follow up"
                            : "Thank you"}
                        </span>
                      </div>

                      {/* Snippet */}
                      <div className="bg-black/40 border border-gray-800 rounded-xl p-4 min-h-[120px]">
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed line-clamp-4">
                          {tpl.content}
                        </pre>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <LuCalendar className="w-3 h-3" />
                          <span>
                            {tpl.createdAt
                              ? new Date(tpl.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyTemplate(tpl.content);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-gray-300 border border-gray-600 hover:bg-zinc-700 transition-colors"
                            title="Copy"
                          >
                            <LuCopy className="w-4 h-4 text-emerald-300" />
                            Copy
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTemplate(tpl._id);
                            }}
                            disabled={deletingId === tpl._id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === tpl._id ? (
                              <LuLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <LuTrash2 className="w-4 h-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-zinc-900/50 border border-gray-800 rounded-2xl p-12 max-w-2xl mx-auto">
                <LuBookmark className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Saved Templates</h3>
                <p className="text-gray-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                  Generate and save templates from the Template Generator, and they will
                  appear here for quick reuse.
                </p>
                <button
                  onClick={() => navigate("/templates")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl transition-all duration-300 hover:bg-gray-100"
                >
                  <LuMail className="w-5 h-5" />
                  Open Template Generator
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewOpen && previewItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closePreview}
            />
            <div className="relative bg-zinc-900 border border-gray-800 rounded-2xl w-[95%] max-w-3xl p-6 shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <LuMail className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {previewItem.targetRole} • YOE: {previewItem.yoe}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <LuCalendar className="w-3 h-3" />
                      <span>
                        {previewItem.createdAt
                          ? new Date(previewItem.createdAt).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${typeBadge(previewItem.type)}`}>
                  {previewItem.type === "cold"
                    ? "Cold mail"
                    : previewItem.type === "referral"
                    ? "Referral"
                    : previewItem.type === "followup"
                    ? "Follow up"
                    : "Thank you"}
                </span>
              </div>

              {/* Modal body */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-5 max-h-[60vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-100 text-sm leading-relaxed font-mono">
                  {previewItem.content}
                </pre>
              </div>

              {/* Modal actions */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyTemplate(previewItem.content)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      copied
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-black/40 text-white border border-gray-700 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LuCopy className={`w-4 h-4 ${copied ? "text-white" : "text-emerald-300"}`} />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteTemplate(previewItem._id)}
                    disabled={deletingId === previewItem._id}
                    className="px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      {deletingId === previewItem._id ? (
                        <LuLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <LuTrash2 className="w-4 h-4" />
                      )}
                      <span>Delete</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Scrollbar + line clamp */}
        <style>
          {`
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: #374151; border-radius: 3px; }
            ::-webkit-scrollbar-thumb { background: #6b7280; border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

            .line-clamp-4 {
              display: -webkit-box;
              -webkit-line-clamp: 4;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
};

export default MyLibrary;
