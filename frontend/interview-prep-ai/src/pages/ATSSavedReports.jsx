import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuDownload, LuFileText, LuCalendar, LuTrash2, LuTarget, LuTrendingUp } from "react-icons/lu";
import { toast } from "react-hot-toast";
import DashboardLayout from "../components/layouts/DashboardLayout";
import axiosInstance from "../utils/axiosInstance";

const ATSSavedReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/ats/reports');
      setReports(Array.isArray(response.data.reports) ? response.data.reports : []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load saved reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId, fileName) => {
    try {
      const response = await axiosInstance.get(`/api/ats/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}_ATS_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await axiosInstance.delete(`/api/ats/reports/${reportId}`);
      setReports(prev => prev.filter(report => report._id !== reportId));
      toast.success("Report deleted successfully");
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 lg:p-8 mb-8 hover:bg-zinc-900/70 transition-all duration-300">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/ats-score')}
                className="p-3 hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-white"
              >
                <LuArrowLeft className="text-xl" />
              </button>
              
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
                  <LuFileText className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Saved ATS Reports
                  </h1>
                  <p className="text-gray-400 text-lg">
                    View and manage your saved resume analysis reports ({reports.length} total)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-6"></div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-700 rounded-xl"></div>
                    <div className="w-10 h-10 bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-12 max-w-2xl mx-auto">
                <LuFileText className="w-20 h-20 mx-auto mb-6 text-gray-600" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Saved Reports
                </h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  You haven't saved any ATS reports yet. Analyze your resume to get detailed insights and recommendations.
                </p>
                <button
                  onClick={() => navigate('/ats-score')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                >
                  <LuTarget className="w-5 h-5" />
                  Analyze Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reports.map((report) => {
                const score = Math.round(report.overallScore ?? 0);
                return (
                  <div
                    key={report._id}
                    className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:bg-zinc-900/70 hover:border-blue-500/50 hover:scale-105 transition-all duration-300 group"
                  >
                    {/* Report Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg mb-2 truncate group-hover:text-blue-400 transition-colors duration-300">
                          {report.originalFileName || 'Resume Analysis'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <LuCalendar className="w-4 h-4" />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className={`${getScoreBgColor(score)} border rounded-xl p-4 mb-6`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                            {score}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                            ATS Score
                          </div>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl">
                          <LuTrendingUp className={`w-6 h-6 ${getScoreColor(score)}`} />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadReport(report._id, report.originalFileName)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <LuDownload className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      
                      <button
                        onClick={() => deleteReport(report._id)}
                        className="flex items-center justify-center px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-500 text-center">
                        Report #{report._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer CTA for non-empty state */}
          {!loading && reports.length > 0 && (
            <div className="mt-12 text-center">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  Need Another Analysis?
                </h3>
                <p className="text-gray-400 mb-6">
                  Analyze a new resume or update your existing one to get the latest insights.
                </p>
                <button
                  onClick={() => navigate('/ats-score')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                >
                  <LuTarget className="w-5 h-5" />
                  Analyze New Resume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Scrollbar Styles */}
        <style>
          {`
            ::-webkit-scrollbar {
              width: 6px;
            }
            
            ::-webkit-scrollbar-track {
              background: #374151;
              border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #6b7280;
              border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
};

export default ATSSavedReports;
