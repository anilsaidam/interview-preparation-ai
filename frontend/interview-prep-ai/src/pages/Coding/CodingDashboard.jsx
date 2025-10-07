import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import { LuCode, LuPin, LuCheck, LuTrash2, LuLoader, LuTrendingUp, LuPlus, LuSearch, LuFilter, LuX, LuCalendar, LuUser, LuTarget, LuBookmark, LuArrowLeft } from "react-icons/lu";
import { toast } from "react-hot-toast";

const CodingDashboard = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState("");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [stats, setStats] = useState({
    createdCount: 0,
    activeCount: 0,
    pinnedCount: 0,
    completedCount: 0,
    successStreak: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, sessionId: null, sessionName: "" });

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session =>
      (session.topics || session.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.experience.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortFilter) {
      case "az":
        return filtered.sort((a, b) => (a.topics || a.role || '').localeCompare(b.topics || b.role || ''));
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "newest":
      default:
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [sessions, searchQuery, sortFilter]);

  const fetchSessions = async () => {
    try {
      const sessionsRes = await axiosInstance.get(API_PATHS.CODING.LIST_SESSIONS);
      const sessionsData = sessionsRes.data || [];
      setSessions(sessionsData);
  
      // Calculate stats
      setStats(prev => ({
        ...prev,
        createdCount: prev.createdCount || sessionsData.length,
        activeCount: sessionsData.length,
        pinnedCount: sessionsData.reduce((acc, s) => acc + (s.pinnedCount || 0), 0),
        completedCount: sessionsData.filter(s => s.completed).length,
        successStreak: sessionsData.filter(s => s.completed).length,
      }));
  
    } catch (e) {
      setError("Failed to load sessions");
    }
  };

  const showDeleteModal = (sessionId, sessionName, e) => {
    e.stopPropagation();
    setDeleteModal({ show: true, sessionId, sessionName });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, sessionId: null, sessionName: "" });
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(API_PATHS.CODING.SESSION.DELETE(deleteModal.sessionId));
      toast.success("🗑️ Session deleted successfully");
      hideDeleteModal();
      await fetchSessions();
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to delete session");
    }
  };
  
  useEffect(() => {
    fetchSessions();
  }, []);

  const generateSession = async (e) => {
    e.preventDefault();
    setError("");
    if (!topics || !experience) {
      setError("Please fill Topics to Focus and Years of Experience");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post(API_PATHS.CODING.GENERATE, {
        topics,
        experience,
        difficulty,
        count: 5,
      });
      navigate(`/coding/${res.data._id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to generate session");
    } finally {
      setLoading(false);
    }
  };

  // Activity stats configuration with icons
  const activityStats = [
    {
      label: "Total Sessions Created",
      value: stats.createdCount,
      icon: LuTarget,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      label: "Active Sessions",
      value: stats.activeCount,
      icon: LuCode,
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
      icon: LuTrendingUp,
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
          {/* Left: Generator Form */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 sticky top-6 hover:bg-zinc-900/70 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                {/* Back arrow to dashboard */}
                <div className="flex items-center justify-between mb-0.5">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="p-2 rounded-xl cursor-pointer bg-zinc-800/70 border border-gray-700 hover:bg-zinc-800 transition-colors"
                    title="Back to Dashboard"
                    type="button"
                  >
                    <LuArrowLeft className="w-6 h-6 text-purple-400" />
                  </button>
                  <div className="h-5" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Generate Coding Questions
                  </h3>
                  <p className="text-sm text-gray-400">
                    Create practice sessions with AI-generated problems
                  </p>
                </div>
              </div>
              
              <form onSubmit={generateSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Topics to Focus *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    placeholder="e.g., strings, arrays, linked lists, trees"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Years of Experience *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                    placeholder="e.g., 3 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Difficulty Level
                  </label>
                  <div className="flex gap-3">
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 px-4 py-3 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-300 ${
                          difficulty === d
                            ? "bg-white text-black shadow-lg scale-105"
                            : "bg-zinc-800/50 text-gray-300 hover:bg-zinc-700 border border-gray-600"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 p-4 rounded-xl">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full  cursor-pointer px-6 py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <LuLoader className="w-5 h-5 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <LuCode className="w-5 h-5" />
                      Generate Questions
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Activity + Sessions */}
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
                      <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
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
                <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl">
                  <LuCode className="w-6 h-6 text-emerald-400" />
                </div>
                Your Coding Sessions
              </h3>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <LuSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl bg-zinc-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-gray-600 rounded-xl px-4 py-3 hover:border-gray-500 transition-colors duration-300">
                <LuFilter className="text-gray-500 w-5 h-5" />
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="newest" className="bg-zinc-800">Newest First</option>
                  <option value="oldest" className="bg-zinc-800">Oldest First</option>
                  <option value="az" className="bg-zinc-800">A-Z</option>
                </select>
              </div>
            </div>

            {/* Sessions Grid */}
            {sessions.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-12">
                  <LuCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <div className="text-xl font-semibold text-gray-400 mb-2">
                    No coding sessions yet
                  </div>
                  <div className="text-gray-500">
                    Generate your first set of questions to get started!
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => navigate(`/coding/${session._id}`)}
                    className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:bg-zinc-900/70 hover:border-purple-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="absolute top-0 right-0 flex items-center gap-2">
                        <button
                          onClick={(e) => showDeleteModal(session._id, session.topics || session.role, e)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pr-16">
                        <div className="font-bold text-xl text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">
                          {session.topics || session.role}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <LuUser className="w-4 h-4" />
                            {session.experience} years
                          </span>
                          <span className="flex items-center gap-1">
                            <LuCalendar className="w-4 h-4" />
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Tags for completion and pinned questions, now side-by-side */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {session.completed && (
                            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/20 rounded-xl px-3 py-2">
                              <LuCheck className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-green-400 font-semibold">Completed</span>
                            </div>
                          )}
                          
                          {session.pinnedCount > 0 && (
                            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/20 rounded-xl px-3 py-2">
                              <LuPin className="w-4 h-4 text-amber-400" />
                              <span className="text-sm text-amber-400 font-semibold">
                                {session.pinnedCount} Pinned Questions
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <span className="text-sm text-gray-400 font-medium">
                            {session.questions?.length || 0} questions
                          </span>
                          <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
                            <span className="text-sm">Practice Now</span>
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
                      <LuSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-xl font-semibold text-gray-400 mb-2">
                        No sessions match your search
                      </div>
                      <div className="text-gray-500">
                        Try adjusting your search terms or filters.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <LuTrash2 className="w-5 h-5 text-red-400" />
                  </div>
                  Delete Coding Session
                </h3>
                <button
                  onClick={hideDeleteModal}
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition-colors duration-300"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-8 leading-relaxed">
                Are you sure you want to delete the session <span className="font-semibold text-white">"{deleteModal.sessionName}"</span>? 
                All questions and progress will be permanently removed.
              </p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={hideDeleteModal}
                  className="px-6 py-3 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                >
                  <LuTrash2 className="w-4 h-4" />
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

export default CodingDashboard;