import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuCheck,
  LuPin,
  LuRefreshCw,
  LuCopy,
  LuEye,
  LuBookOpen,
  LuPlus,
  LuX,
  LuCalendar,
  LuUser,
  LuCodesandbox,
} from "react-icons/lu";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnimatePresence, motion } from 'framer-motion';

const LANGUAGES = [
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
  { key: "c", label: "C" },
];

// LocalStorage keys (per-session)
const lsKey = (sessionId, name) => `coding_${name}_${sessionId}`;
const LS = {
  SOL_CACHE: (id) => lsKey(id, "sol_cache"),
  ACTIVE_Q: (id) => lsKey(id, "active_q"),
  LANG: (id) => lsKey(id, "lang"),
  SHOW_SOL: (id) => lsKey(id, "show_sol"),
  COMPLETED: (id) => lsKey(id, "completed"),
};

// Helper function to sanitize code blocks
const sanitizeCode = (code) => {
  if (!code) return code;
  let sanitized = String(code);

  // Remove fenced code blocks backticks (keep inner content)
  sanitized = sanitized.replace(/```(python|java|cpp|c|javascript|typescript)\s*\n([\s\S]*?)```/gi, '$2');
  sanitized = sanitized.replace(/'''[\w+-]*\n?([\s\S]*?)'''/g, (_, inner) => inner);
  sanitized = sanitized.replace(/^(java|python|cpp|c):\s*\n/gi, "");
  return sanitized.trim();
};

// A simple, robust parser for the specific HTML format requested from the AI
const renderSolutionExplanation = (text) => {
  if (!text) return null;

  // Split the entire text by the bolded headings using a regex that captures the content
  // We're looking for `<strong>...</strong>`
  const sections = text.split(/(<strong>.*?<\/strong>)/).filter(Boolean);
  const elements = [];

  sections.forEach((section, index) => {
    // If the section is a heading, render it as an H4
    if (section.startsWith('<strong>') && section.endsWith('</strong>')) {
      // Use dangerouslySetInnerHTML to render the heading content
      const headingText = section.replace(/<\/?strong>/g, '');
      elements.push(<h4 key={`h-${index}`} className="font-semibold text-white mt-4 mb-2" dangerouslySetInnerHTML={{ __html: headingText }} />);
    } else {
      // Otherwise, it's a content paragraph. Split it by bullet points.
      // Normalize different bullet characters like '•', '-', '*'
      const bulletPoints = section.split(/\s*[\u2022\u002d\u002a]\s/).map(p => p.trim()).filter(p => p.length > 0);
      
      if (bulletPoints.length > 1) {
        // If there are multiple parts, treat the first as a lead-in sentence
        // and the rest as a list.
        const leadText = bulletPoints[0];
        const listItems = bulletPoints.slice(1);
        
        if (leadText) {
          elements.push(<p key={`p-${index}-lead`} className="text-gray-300 leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: leadText }} />);
        }
        
        elements.push(
          <ul key={`ul-${index}`} className="list-disc list-inside space-y-1 text-gray-300">
            {listItems.map((item, itemIndex) => (
              <li key={`li-${index}-${itemIndex}`} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
      } else if (section.trim()) {
        // If it's a single block, it's just a paragraph.
        elements.push(<p key={`p-${index}`} className="text-gray-300 leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: section }} />);
      }
    }
  });

  return elements;
};

const CodingSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // State management
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [language, setLanguage] = useState("python");

  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);

  const [solutionCache, setSolutionCache] = useState({});
  const [addingQuestions, setAddingQuestions] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const solutionRef = useRef(null); // for auto-scroll to solution

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      // Fixed: This was incorrectly calling LIST_SESSIONS, should be GET_ONE
      const res = await axiosInstance.get(API_PATHS.CODING.LIST_SESSIONS); 
      const foundSession = res.data.find((s) => s._id === sessionId);
      if (foundSession) {
        setSession(foundSession);

        // Restore persisted completion state
        const persistedCompleted = localStorage.getItem(LS.COMPLETED(sessionId));
        const initialCompleted =
          persistedCompleted === null
            ? Boolean(foundSession.completed)
            : persistedCompleted === "true";
        setIsCompleted(initialCompleted);

        // If we have questions, prefer persisted active question
        if (foundSession.questions?.length > 0) {
          const persistedQ = localStorage.getItem(LS.ACTIVE_Q(sessionId));
          const firstId = foundSession.questions[0]._id;
          setActiveQuestionId(persistedQ || firstId);
        }
      } else {
        setError("Session not found");
      }
    } catch (e) {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Initial restore of UI state and fetching session
  useEffect(() => {
    // Restore language
    const persistedLang = localStorage.getItem(LS.LANG(sessionId));
    if (persistedLang) setLanguage(persistedLang);

    // Always hide solution on initial load for a cleaner UX
    setShowSolution(false);

    // Restore solution cache
    try {
      const persistedCache = JSON.parse(localStorage.getItem(LS.SOL_CACHE(sessionId)) || "{}");
      if (persistedCache && typeof persistedCache === "object") {
        setSolutionCache(persistedCache);
      }
    } catch {}

    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Persist UI state
  useEffect(() => {
    if (activeQuestionId) localStorage.setItem(LS.ACTIVE_Q(sessionId), activeQuestionId);
  }, [activeQuestionId, sessionId]);

  useEffect(() => {
    if (language) localStorage.setItem(LS.LANG(sessionId), language);
  }, [language, sessionId]);

  useEffect(() => {
    localStorage.setItem(LS.SHOW_SOL(sessionId), showSolution ? "true" : "false");
  }, [showSolution, sessionId]);

  useEffect(() => {
    localStorage.setItem(LS.COMPLETED(sessionId), isCompleted ? "true" : "false");
  }, [isCompleted, sessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(LS.SOL_CACHE(sessionId), JSON.stringify(solutionCache));
    } catch {}
  }, [solutionCache, sessionId]);

  // Toggle pin status
  const togglePin = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.CODING.PIN(sessionId, questionId));
      const { isPinned, message } = response.data;

      // Update session state immutably
      setSession((prevSession) => {
        const updatedQuestions = (prevSession.questions || []).map((q) =>
          q._id === questionId ? { ...q, pinned: isPinned } : q
        );
        return { ...prevSession, questions: updatedQuestions };
      });

      toast.success(message || (isPinned ? "Question pinned!" : "Question unpinned!"));
    } catch (e) {
      console.error("Failed to toggle pin", e);
      toast.error("Failed to update pin status");
    }
  };

  // Toggle session completion status (match InterviewPrep style + behavior)
  const toggleCompletion = async () => {
    try {
      const response = await axiosInstance.post(API_PATHS.CODING.MARK_COMPLETED(sessionId));
      const newCompletedStatus = response.data.session.completed;
      setIsCompleted(newCompletedStatus);
      localStorage.setItem(LS.COMPLETED(sessionId), newCompletedStatus ? "true" : "false");

      if (newCompletedStatus) {
        toast.success("Session completed");
      } else {
        toast.success("Session marked as incomplete");
      }
    } catch (e) {
      console.error("Failed to toggle completion status", e);
      toast.error("Failed to update session status");
    }
  };

  // Load solution for current question and language with caching + persistence
  const loadSolution = useCallback(
    async (retryAttempt = 0) => {
      if (!activeQuestionId) return;

      const cacheKey = `${activeQuestionId}-${language}`;

      // Check in-memory cache first
      if (solutionCache[cacheKey]) {
        setSolution(solutionCache[cacheKey]);
        toast.success("Solution loaded from cache");
        return;
      }

      setSolutionLoading(true);
      try {
        const res = await axiosInstance.get(
          API_PATHS.CODING.GET_SOLUTION(sessionId, activeQuestionId, language)
        );

        const sanitizedSolution = {
          ...res.data,
          code: sanitizeCode(res.data.code),
        };

        setSolution(sanitizedSolution);

        // Cache in state and persist to localStorage
        setSolutionCache((prev) => {
          const next = { ...prev, [cacheKey]: sanitizedSolution };
          try {
            localStorage.setItem(LS.SOL_CACHE(sessionId), JSON.stringify(next));
          } catch {}
          return next;
        });

        // Notification rules (no emojis, distinct messages)
        toast.success("Solution generated");
      } catch (e) {
        console.error("Failed to load solution:", e);

        // Retry on 502 / timeout
        if ((e.response?.status === 502 || e.code === "ECONNABORTED") && retryAttempt < 2) {
          setTimeout(() => {
            loadSolution(retryAttempt + 1);
          }, 2000 * (retryAttempt + 1));
          return;
        }

        setSolution(null);
        if (e.response?.status === 502) {
          toast.error("AI service is temporarily unavailable. Please try again in a few minutes.");
        } else {
          toast.error("Failed to load solution. Please try again.");
        }
      } finally {
        setSolutionLoading(false);
      }
    },
    [activeQuestionId, sessionId, language, solutionCache]
  );

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const cacheKey = `${activeQuestionId}-${newLang}`;
    if (solutionCache[cacheKey] && showSolution) {
      setSolution(solutionCache[cacheKey]);
    } else {
      setSolution(null);
      // Don't change showSolution state, as it's a user action
    }
  };

  // Handle show/hide solution + auto-scroll
  const handleShowSolution = () => {
    const next = !showSolution;
    setShowSolution(next);
    if (next) {
      // Fetch if not cached
      const cacheKey = `${activeQuestionId}-${language}`;
      if (!solutionCache[cacheKey]) {
        loadSolution();
      } else {
        setSolution(solutionCache[cacheKey]);
        toast.success("Solution loaded from cache");
      }
      // Auto-scroll to solution section
      setTimeout(() => {
        if (solutionRef.current) {
          solutionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  // On solution available and showSolution true, ensure scroll into view
  useEffect(() => {
    if (showSolution && solution && solutionRef.current) {
      solutionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showSolution, solution]);

  // Add 5 more questions to session
  const addMoreQuestions = async () => {
    setAddingQuestions(true);
    try {
      const res = await axiosInstance.post(API_PATHS.CODING.ADD_MORE_QUESTIONS(sessionId), {
        count: 5,
      });

      setSession((prevSession) => {
        const newQuestions = [...(prevSession.questions || []), ...(res.data.questions || [])];
        return { ...prevSession, questions: newQuestions };
      });

      toast.success(`Added ${res.data.questions?.length || 0} new questions`);
    } catch (e) {
      console.error("Failed to add questions:", e);
      if (e.response?.status === 502) {
        toast.error("AI service is temporarily unavailable. Please try again in a few minutes.");
      } else {
        toast.error("Failed to add questions. Please try again.");
      }
    } finally {
      setAddingQuestions(false);
    }
  };

  // Copy to clipboard (no emojis)
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy code");
    }
  };

  // Sort questions: pinned first, then by original index
  const sortedQuestions = useMemo(() => {
    if (!session?.questions) return [];
    const questionsWithIndex = session.questions.map((q, index) => ({ ...q, originalIndex: index }));
    
    questionsWithIndex.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.originalIndex - b.originalIndex; // Maintain original order
    });
    
    return questionsWithIndex;
  }, [session?.questions]);

  const activeQuestion = session?.questions?.find((q) => q._id === activeQuestionId);
  const activeQuestionIndex = useMemo(() => sortedQuestions.findIndex(q => q._id === activeQuestionId), [sortedQuestions, activeQuestionId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-96 bg-gray-700 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-20">
              <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-12 max-w-md mx-auto">
                <LuBookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-red-400 text-lg mb-6">{error || "Session not found"}</p>
                <button
                  onClick={() => navigate("/coding")}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all duration-300"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8 hover:bg-zinc-900/70 transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => navigate("/coding")}
                  className="p-3 cursor-pointer hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                  <LuArrowLeft className="text-xl" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                    <LuCodesandbox className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl font-bold text-white">
                        {session.topics || session.role}
                      </h1>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-semibold">
                          <LuCheck className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-gray-400 mt-1">
                      <div className="flex items-center space-x-2">
                        <LuUser className="w-4 h-4" />
                        <span>{session.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <LuCalendar className="w-4 h-4" />
                        <span>{session.questions?.length || 0} questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={addMoreQuestions}
                  disabled={addingQuestions}
                  className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  {addingQuestions ? (
                    <>
                      <LuRefreshCw className="w-4 h-4 animate-spin" />
                      Adding Questions...
                    </>
                  ) : (
                    <>
                      <LuPlus className="w-4 h-4" />
                      Add More Questions
                    </>
                  )}
                </button>

                {/* Mark Completed — match InterviewPrep style */}
                <button
                  onClick={toggleCompletion}
                  className={`flex cursor-pointer items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                    isCompleted
                      ? "bg-red-500 text-white shadow-lg shadow-green-500/25"
                      : "border-2 border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  {isCompleted ? <LuCheck className="w-4 h-4" /> : <LuCheck className="w-4 h-4" />}
                  {isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Questions List (increase height, remove zoom-in) */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 sticky top-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl">
                    <LuBookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Questions ({sortedQuestions.length})
                  </h3>
                </div>

                <div className="space-y-3 max-h-[80vh] overflow-auto custom-scrollbar">
                  {sortedQuestions.map((question, index) => (
                    <div
                      key={question._id}
                      onClick={() => {
                        setActiveQuestionId(question._id);
                        const cacheKey = `${question._id}-${language}`;
                        if (solutionCache[cacheKey] && showSolution) {
                          setSolution(solutionCache[cacheKey]);
                        } else if (!solutionCache[cacheKey]) {
                          setShowSolution(false);
                          setSolution(null);
                        }
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors duration-200 ${
                        activeQuestionId === question._id
                          ? "border-purple-500/50 bg-purple-500/10"
                          : "border-gray-700 hover:border-gray-600 bg-zinc-800/50 hover:bg-zinc-800/70"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                question.difficulty === "Easy"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/20"
                                  : question.difficulty === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                                  : "bg-red-500/20 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {question.difficulty}
                            </span>
                            {question.pinned && (
                              <LuPin className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <p className="text-sm text-white font-medium line-clamp-2 leading-relaxed">
                            {question.statement}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(question._id);
                          }}
                          className={`p-2 rounded-xl transition-colors duration-200 ml-2 ${
                            question.pinned
                              ? "text-amber-400 bg-amber-500/20 border border-amber-500/20"
                              : "text-gray-500 hover:text-amber-400 hover:bg-amber-500/20"
                          }`}
                          title={question.pinned ? "Unpin Question" : "Pin Question"}
                        >
                          <LuPin className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Question Details + Solution */}
            <div className="lg:col-span-2 space-y-8">
              {activeQuestion ? (
                <>
                  {/* Problem Statement */}
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-2xl font-bold text-white">Problem Statement</h3>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className=" cursor-pointer px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-zinc-800/50 text-white transition-all duration-300 hover:border-gray-500"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.key} value={lang.key} className="bg-zinc-800">
                              {lang.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleShowSolution}
                          disabled={solutionLoading}
                          className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer ${
                            showSolution
                              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                              : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                          }`}
                        >
                          {solutionLoading ? (
                            <>
                              <LuRefreshCw className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <LuEye className="w-4 h-4" />
                              {showSolution ? "Hide Solution" : "Show Solution"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <span
                          className={`inline-block px-3 py-2 rounded-xl text-sm font-semibold ${
                            activeQuestion.difficulty === "Easy"
                              ? "bg-green-500/20 text-green-400 border border-green-500/20"
                              : activeQuestion.difficulty === "Medium"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/20 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {activeQuestion.difficulty}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-white leading-relaxed">
                        {activeQuestion.statement}
                      </h2>

                      {activeQuestion.constraints && activeQuestion.constraints.length > 0 && (
                        <div className="bg-zinc-800/50 p-6 rounded-xl border border-gray-600">
                          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            Constraints:
                          </h4>
                          <ul className="list-none text-gray-300 space-y-2">
                            {activeQuestion.constraints.map((constraint, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-blue-400 mt-2">•</span>
                                <span>{constraint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeQuestion.examples && activeQuestion.examples.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            Examples:
                          </h4>
                          <div className="space-y-4">
                            {activeQuestion.examples.map((example, index) => (
                              <div
                                key={index}
                                className="bg-zinc-800/50 border border-gray-600 p-6 rounded-xl"
                              >
                                <div className="space-y-3">
                                  <div>
                                    <span className="font-semibold text-emerald-400">Input:</span>
                                    <div className="mt-1 p-3 bg-black/50 rounded-lg border border-gray-600 font-mono text-gray-200">
                                      {example.input || "Empty"}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-purple-400">Output:</span>
                                    <div className="mt-1 p-3 bg-black/50 rounded-lg border border-gray-600 font-mono text-gray-200">
                                      {example.output}
                                    </div>
                                  </div>
                                  {example.explanation && (
                                    <div>
                                      <span className="font-semibold text-blue-400">
                                        Explanation:
                                      </span>
                                      <div className="mt-1 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-gray-200">
                                        {example.explanation}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Solution Display */}
                  <AnimatePresence>
                    {showSolution && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 overflow-hidden"
                        ref={solutionRef}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <h3 className="text-2xl font-bold text-white">
                            Official Solution ({LANGUAGES.find((l) => l.key === language)?.label})
                          </h3>
                          {solution?.code && (
                            <button
                              onClick={() => copyToClipboard(solution.code)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                            >
                              <LuCopy className="w-4 h-4" />
                              Copy Code
                            </button>
                          )}
                        </div>

                        {solutionLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <LuRefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                              <p className="text-gray-400">Loading solution...</p>
                            </div>
                          </div>
                        ) : solution ? (
                          <div className="space-y-6">
                            {solution.code && (
                              <div className="min-h-[300px]">
                                <SyntaxHighlighter
                                  language={language === "cpp" ? "cpp" : language}
                                  style={tomorrow}
                                  customStyle={{
                                    margin: 0,
                                    borderRadius: "0.75rem",
                                    minHeight: "300px",
                                    border: "1px solid #374151",
                                  }}
                                >
                                  {solution.code}
                                </SyntaxHighlighter>
                              </div>
                            )}

                            {solution.explanation && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                                <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                                  <LuBookOpen className="w-4 h-4" />
                                  Explanation:
                                </h4>
                                <div className="text-gray-200 leading-relaxed solution-content">
                                  {renderSolutionExplanation(solution.explanation)}
                                </div>
                              </div>
                            )}

                            {(solution.timeComplexity || solution.spaceComplexity) && (
                              <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl">
                                <h4 className="font-semibold text-blue-400 mb-4">
                                  Complexity Analysis:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  {solution.timeComplexity && (
                                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-gray-600">
                                      <div className="font-semibold text-white mb-2">
                                        Time Complexity:
                                      </div>
                                      <div
                                        className="text-gray-300 font-mono"
                                        dangerouslySetInnerHTML={{
                                          __html: solution.timeComplexity.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                                        }}
                                      />
                                    </div>
                                  )}
                                  {solution.spaceComplexity && (
                                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-gray-600">
                                      <div className="font-semibold text-white mb-2">
                                        Space Complexity:
                                      </div>
                                      <div
                                        className="text-gray-300 font-mono"
                                        dangerouslySetInnerHTML={{
                                          __html: solution.spaceComplexity.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
                              <LuX className="w-12 h-12 text-red-400 mx-auto mb-4" />
                              <h4 className="text-red-400 font-semibold mb-2">
                                Failed to load solution
                              </h4>
                              <p className="text-gray-400">
                                Please try again or select a different language.
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-20">
                    <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-12">
                      <LuBookOpen className="w-16 h-16 mx-auto mb-6 text-gray-600" />
                      <h3 className="text-xl font-semibold mb-4 text-white">
                        No Problem Selected
                      </h3>
                      <p className="text-gray-400 max-w-sm mx-auto">
                        Select a coding problem from the sidebar to view the problem statement and
                        get the solution
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom CSS to style the dangerouslySetInnerHTML content */}
        <style>
          {`
            .solution-explanation-content strong {
              display: block;
              font-weight: 600; /* semibold */
              color: #ffffff; /* text-white */
              font-size: 1.125rem; /* text-lg */
              margin-top: 1.5rem; /* space-y-4 for overall block */
              margin-bottom: 0.5rem; /* space-y-4 */
            }
            .solution-explanation-content p,
            .solution-explanation-content li {
              color: #d1d5db; /* text-gray-300 */
              line-height: 1.625;
            }
            .solution-explanation-content ul {
              list-style-type: disc;
              margin-left: 1.5rem;
              margin-bottom: 1rem;
              padding-left: 0;
            }
            .solution-explanation-content li {
              margin-bottom: 0.5rem;
            }
            .solution-explanation-content ins {
              text-decoration: none;
              color: #ffffff;
            }
          `}
        </style>
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

            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
};

export default CodingSession;