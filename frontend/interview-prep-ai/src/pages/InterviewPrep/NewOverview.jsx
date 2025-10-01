import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import { LuTrash2, LuSearch, LuFilter, LuPin, LuLoader, LuX, LuTrendingUp, LuCheck, LuUsers, LuTarget, LuBookmark, LuTrophy, LuPlus, LuCalendar } from "react-icons/lu";
import { toast } from "react-hot-toast";

const NewOverview = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    createdCount: 0,
    activeCount: 0,
    pinnedCount: 0,
    completedCount: 0,
    successStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [deleteModal, setDeleteModal] = useState({ show: false, sessionId: null, sessionName: "" });

  // form state
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [topicsToFocus, setTopicsToFocus] = useState("");
  const [description, setDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session =>
      session.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.topicsToFocus.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortFilter) {
      case "az":
        return filtered.sort((a, b) => a.role.localeCompare(b.role));
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "newest":
      default:
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [sessions, searchQuery, sortFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const [sessionsRes, statsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.SESSION.GET_ALL),
        axiosInstance.get('/api/sessions/stats')
      ]);
      setSessions(sessionsRes.data || []);

      // Use server stats for accurate counts including deleted sessions
      const serverStats = statsRes.data || {};
      setStats({
        createdCount: serverStats.createdCount || 0, // Total created including deleted
        activeCount: serverStats.activeCount || 0,   // Active sessions with questions
        pinnedCount: serverStats.pinnedCount || 0,   // Total pinned questions
        completedCount: serverStats.completedCount || 0, // Completed sessions
        successStreak: serverStats.completedCount || 0   // Same as completed count
      });
    } catch (e) {
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (sessionId, sessionName, e) => {
    e.stopPropagation();
    setDeleteModal({ show: true, sessionId, sessionName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, sessionId: null, sessionName: "" });
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(deleteModal.sessionId));
      setSessions(prev => prev.filter(s => s._id !== deleteModal.sessionId));
      // Update stats after deletion
      setStats(prev => ({
        ...prev,
        activeCount: Math.max(0, prev.activeCount - 1)
      }));
      toast.success("Session deleted successfully");
      closeDeleteModal();
    } catch (e) {
      toast.error("Failed to delete session");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    setError("");
    if (!role || !experience || !topicsToFocus) {
      setError("Please fill Target Role, YOE and Topics");
      return;
    }
    try {
      setSubmitting(true);
      // 1) Generate questions
      const aiRes = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        role,
        experience,
        topicsToFocus,
        numberOfQuestions: 10,
      });
      const questions = aiRes.data;

      // 2) If resume uploaded, upload first to /api/ats/score? We only need path; reuse uploads via resumeUpload is not exposed. We'll skip server upload and rely on ATS feature separately; optional enhancement could be added later.

      // 3) Create session
      const res = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        role,
        experience,
        topicsToFocus,
        description,
        questions,
      });
      const id = res?.data?.session?._id;
      if (id) {
        navigate(`/interview-prep/${id}`);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  // Activity stats configuration with icons
  const activityStats = [
    {
      label: "Total Sessions Created",
      value: stats.createdCount,
      icon: LuUsers,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      label: "Active Sessions",
      value: stats.activeCount,
      icon: LuTarget,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      label: "Pinned Questions",
      value: stats.pinnedCount,
      icon: LuBookmark,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      label: "Success Streak",
      value: stats.completedCount,
      icon: LuTrophy,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      showProgress: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Create Session Form */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 sticky top-6 hover:bg-zinc-900/70 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl">
                  <LuPlus className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Create New Session
                  </h3>
                  <p className="text-sm text-gray-400">
                    Enter details. Questions will be generated automatically.
                  </p>
                </div>
              </div>
              
              <form onSubmit={createSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Target Role *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    placeholder="e.g., Frontend Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Years of Experience *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    placeholder="e.g., 3"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Topics to Focus On *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    placeholder="e.g., React, JavaScript, CSS"
                    value={topicsToFocus}
                    onChange={(e) => setTopicsToFocus(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Description (optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500 resize-none"
                    placeholder="Additional context about the role or interview"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Upload Resume (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black  file:transition-all file:duration-300"
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 p-4 rounded-xl">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-xl bg-white text-black font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LuLoader className="w-5 h-5 animate-spin" />
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <LuPlus className="w-5 h-5" />
                      Create Session
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Activity + Sessions list */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activityStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className={`bg-zinc-900/50 backdrop-blur-sm border ${stat.borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer ${stat.bgColor}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      {stat.showProgress && (
                        <LuTrendingUp className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                        {stat.value}
                      </div>
                      
                      {stat.showProgress && (
                        <div className="flex-1 ml-4">
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${stats.activeCount > 0 ? (stats.completedCount / stats.activeCount) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.completedCount}/{stats.activeCount} completed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sessions Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <LuTarget className="w-6 h-6 text-purple-400" />
                </div>
                Your Sessions
              </h3>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <LuSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-emerald-400 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-gray-600 rounded-xl px-4 py-3 hover:border-gray-500 transition-colors duration-300">
                <LuFilter className="text-gray-500 w-5 h-5" />
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none"
                >
                  <option value="newest" className="bg-zinc-800">Newest First</option>
                  <option value="oldest" className="bg-zinc-800">Oldest First</option>
                  <option value="az" className="bg-zinc-800">A-Z</option>
                </select>
              </div>
            </div>

            {/* Sessions Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSessions.map((s) => (
                  <div
                    key={s._id}
                    className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:bg-zinc-900/70 hover:border-emerald-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => navigate(`/interview-prep/${s._id}`)}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="absolute top-0 right-0 flex items-center gap-2">
                        <button
                          onClick={(e) => openDeleteModal(s._id, s.role, e)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pr-16">
                        <div className="font-bold text-xl text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                          {s.role}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <LuUsers className="w-4 h-4" />
                            YOE: {s.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <LuCalendar className="w-4 h-4" />
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-gray-300 mb-4">
                          <span className="font-medium">Focus:</span> {s.topicsToFocus}
                        </div>

                        {s.completed && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/20 rounded-xl px-3 py-2">
                              <LuCheck className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-green-400 font-semibold">Completed</span>
                            </div>
                          </div>
                        )}

                        {/* Show pinned count */}
                        {s.questions && s.questions.filter(q => q.isPinned).length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/20 rounded-xl px-3 py-2">
                              <LuPin className="w-4 h-4 text-amber-400" />
                              <span className="text-sm text-amber-400 font-semibold">
                                {s.questions.filter(q => q.isPinned).length} Pinned Questions
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <span className="text-sm text-gray-400 font-medium">
                            {s.questions?.length || 0} questions
                          </span>
                          <div className="flex items-center gap-2 text-emerald-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
                            <span className="text-sm">View Session</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredSessions.length === 0 && (
                  <div className="col-span-2 text-center py-16">
                    <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-8">
                      <LuTarget className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-xl font-semibold text-gray-400 mb-2">
                        {searchQuery ? "No sessions match your search" : "No sessions yet"}
                      </div>
                      <div className="text-gray-500">
                        {searchQuery ? "Try adjusting your search terms." : "Create your first session to get started."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <LuTrash2 className="w-5 h-5 text-red-400" />
                  </div>
                  Delete Session
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition-colors duration-300"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-8 leading-relaxed">
                Are you sure you want to delete the session <span className="font-semibold text-white">"{deleteModal.sessionName}"</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25"
                >
                  Delete Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewOverview;
