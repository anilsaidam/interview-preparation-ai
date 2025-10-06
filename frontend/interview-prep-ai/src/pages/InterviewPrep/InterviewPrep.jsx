import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuX,
  LuCopy,
  LuPin,
  LuTrophy,
  LuCalendar,
  LuUser,
  LuTarget,
  LuBookOpen,
  LuStar,
  LuChevronDown,
  LuChevronUp,
  LuPlus,
  LuArrowLeft,
} from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Drawer from "../../components/Drawer";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const InterviewPrep = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explanationCache, setExplanationCache] = useState({});
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [completingSession, setCompletingSession] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );

  // LocalStorage keys for persistence
  const LS_KEYS = useMemo(
    () => ({
      EXPANDED: `ip_expanded_${sessionId}`,
      EXPL_CACHE: `ip_expl_cache_${sessionId}`,
      LAST_Q: `ip_last_q_${sessionId}`,
      DRAWER: `ip_drawer_${sessionId}`,
    }),
    [sessionId]
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // Fetch session
  const fetchSessionDetailById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Restore UI state from localStorage
  useEffect(() => {
    if (!sessionId) return;
    fetchSessionDetailById();

    try {
      const savedExpanded = JSON.parse(
        localStorage.getItem(LS_KEYS.EXPANDED) || "[]"
      );
      if (Array.isArray(savedExpanded)) {
        setExpandedQuestions(new Set(savedExpanded));
      }
      const savedCache = JSON.parse(
        localStorage.getItem(LS_KEYS.EXPL_CACHE) || "{}"
      );
      if (savedCache && typeof savedCache === "object") {
        setExplanationCache(savedCache);
      }
      const savedLastQ = localStorage.getItem(LS_KEYS.LAST_Q);
      const savedDrawer = localStorage.getItem(LS_KEYS.DRAWER);

      // Fix: Only open drawer if a question and its explanation exist in cache
      if (savedDrawer === "true" && savedLastQ && savedCache[savedLastQ]) {
        setOpenLearnMoreDrawer(true);
        setCurrentQuestionId(savedLastQ);
        setExplanation(savedCache[savedLastQ]);
      } else {
        // Otherwise, reset the drawer state
        setOpenLearnMoreDrawer(false);
        setExplanation(null);
        setCurrentQuestionId(null);
      }
    } catch (e) {
      console.warn("Failed to restore state:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Persist expanded questions
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEYS.EXPANDED,
        JSON.stringify(Array.from(expandedQuestions))
      );
    } catch {}
  }, [expandedQuestions, LS_KEYS]);

  // Persist explanation cache and drawer state
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEYS.EXPL_CACHE,
        JSON.stringify(explanationCache)
      );
      localStorage.setItem(
        LS_KEYS.DRAWER,
        openLearnMoreDrawer ? "true" : "false"
      );
    } catch {}
  }, [explanationCache, openLearnMoreDrawer, LS_KEYS]);

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) newSet.delete(questionId);
      else newSet.add(questionId);
      return newSet;
    });
  };

  const generateConceptExplanation = async (question, questionId) => {
    try {
      setErrorMsg("");
      setCurrentQuestionId(questionId);
      localStorage.setItem(LS_KEYS.LAST_Q, questionId);
      setOpenLearnMoreDrawer(true);

      // Check local cache first
      if (explanationCache[questionId]) {
        setExplanation(explanationCache[questionId]);
        return;
      }

      setExplanation(null);
      setIsLoading(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATIONS,
        {
          question,
          questionId,
        }
      );

      if (response.data) {
        setExplanation(response.data);
        // Cache the explanation locally
        setExplanationCache((prev) => {
          const next = { ...prev, [questionId]: response.data };
          try {
            localStorage.setItem(LS_KEYS.EXPL_CACHE, JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, please try again later");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );
      if (response.data && response.data.question) {
        await fetchSessionDetailById();
        const isPinned = response.data.question.isPinned;
        toast.success(
          isPinned
            ? "Question pinned successfully"
            : "Question unpinned successfully"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update question pin status.");
    }
  };

  const toggleSessionComplete = async () => {
    try {
      setCompletingSession(true);
      const response = await axiosInstance.post(
        `/api/sessions/${sessionId}/complete`
      );

      // Update local state without page reload
      setSessionData((prev) => ({
        ...prev,
        completed: !prev.completed,
      }));

      toast.success(response.data.message || "Session status updated!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update session status.");
    } finally {
      setCompletingSession(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Answer copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy text: ", error);
      toast.error("Failed to copy text");
    }
  };

  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data;
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Added More Q&A!");
        fetchSessionDetailById();
      }
    } catch (error) {
      setErrorMsg("Something went wrong. Please try again.");
      toast.error("Failed to add more questions.");
    } finally {
      setIsUpdateLoader(false);
    }
  };

  // Helper function to parse text with code blocks
  const parseTextToParts = (text) => {
    if (!text) return [];
    const src = String(text);
    const parts = [];
    const codeBlockRegex = /```([\w+-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(src)) !== null) {
      const [fullMatch, lang, code] = match;
      const start = match.index;

      if (start > lastIndex) {
        parts.push({ type: "text", content: src.slice(lastIndex, start) });
      }

      parts.push({ type: "code", lang: lang || "javascript", content: code });
      lastIndex = start + fullMatch.length;
    }

    if (lastIndex < src.length) {
      parts.push({ type: "text", content: src.slice(lastIndex) });
    }

    return parts;
  };

  const renderContent = (content) => {
    const parts = parseTextToParts(content);
    return parts.map((p, idx) => {
      if (p.type === "code") {
        return (
          <SyntaxHighlighter
            key={idx}
            language={p.lang || "javascript"}
            style={vscDarkPlus}
            customStyle={{
              margin: "1rem 0",
              borderRadius: "0.75rem",
              border: "1px solid #2d2d2d",
              background: "#1e1e1e",
              padding: "1rem",
            }}
          >
            {p.content}
          </SyntaxHighlighter>
        );
      } else {
        const processedText = String(p.content)
          .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
          .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/^[ \t]*[-*]\s+(.*)$/gm, "<li>$1</li>")
          .replace(/\n{2,}/g, "<br><br>")
          .replace(/\n/g, "<br>");

        return (
          <div
            key={idx}
            className="prose prose-invert max-w-none text-gray-100"
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        );
      }
    });
  };

  const pinnedCount =
    sessionData?.questions?.filter((q) => q.isPinned)?.length || 0;
  const totalQuestions = sessionData?.questions?.length || 0;

  // Consolidate explanation content and styling into a single component
  const explanationContent = (
    <div className="bg-black border border-gray-700 rounded-2xl p-8 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <LuBookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">AI Explanation</h3>
        </div>
        <div className="flex items-center space-x-2">
          {!isLoading && explanation && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                copyToClipboard(
                  explanation?.explanation || explanation?.output || ""
                )
              }
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300"
              title="Copy Answer"
            >
              <LuCopy className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpenLearnMoreDrawer(false)}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300"
            title="Close"
          >
            <LuX className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-700 h-4 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="text-white leading-relaxed">
            {renderContent(
              explanation?.explanation || explanation?.output || ""
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black">
        {/* Responsive Header */}
        <div className="container mx-auto px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
            {/* Role Info: responsive and flexible */}
            <div className="lg:col-span-7">
              <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-4 sm:p-6 lg:p-6 hover:bg-zinc-900/70 transition-all">
                {/* Top row: back + role + meta */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="p-2 rounded-xl bg-zinc-800/70 border border-gray-700 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Back to Dashboard"
                      type="button"
                    >
                      <LuArrowLeft className="w-6 h-6 text-blue-400" />
                    </button>
                    <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
                      <LuTarget className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        {sessionData?.role || "Loading..."}
                      </h1>
                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <LuUser className="w-4 h-4" />
                          {sessionData?.experience || "-"} years experience
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <LuCalendar className="w-4 h-4" />
                          {sessionData?.updatedAt
                            ? moment(sessionData.updatedAt).format(
                                "Do MMM YYYY"
                              )
                            : "Today"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completed badge aligns right on larger screens, stacks on small */}
                  {sessionData?.completed && (
                    <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/25 rounded-xl px-3 py-2 self-start">
                      <LuTrophy className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-semibold text-sm">
                        Completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Focus areas */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LuBookOpen className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400 font-medium">
                      Focus Areas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sessionData?.topicsToFocus
                      ?.split(",")
                      .map((topic, idx) => (
                        <span
                          key={`${topic}-${idx}`}
                          className="bg-purple-500/20 border border-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-xs sm:text-sm font-medium"
                        >
                          {topic.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Mini legend */}
                <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/20">
                      <LuPin className="w-3.5 h-3.5 text-amber-300" />
                    </span>
                    <span>Pin questions to revisit quickly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/20">
                      <LuBookOpen className="w-3.5 h-3.5 text-purple-300" />
                    </span>
                    <span>Learn More opens AI explanations</span>
                  </div>
                </div>

                {/* Description */}
                {sessionData?.description && (
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <p className="text-gray-300 leading-relaxed">
                      {sessionData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: small stats grid */}
            <div className="lg:col-span-5 grid grid-rows-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-4 hover:bg-zinc-800/70 transition-all flex items-center justify-between">
                  <div>
                    <div className="text-lg text-gray-400 mb-1">
                      Pinned questions
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {pinnedCount}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/20 border border-amber-500/20 rounded-xl">
                    <LuPin className="w-5 h-5 text-amber-400" />
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-4 hover:bg-zinc-800/70 transition-all flex items-center justify-between">
                  <div>
                    <div className="text-lg text-gray-400 mb-1">
                      Total questions
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {totalQuestions}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/20 rounded-xl">
                    <LuBookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-4 hover:bg-zinc-800/70 transition-all flex flex-col justify-center">
                  <div className="text-lg text-gray-400 mb-4">
                    Load more questions
                  </div>
                  <button
                    onClick={uploadMoreQuestions}
                    disabled={isUpdateLoader}
                    className="px-4 py-2 w-full bg-white hover:bg-gray-200 cursor-pointer text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdateLoader ? (
                      <span className="inline-flex items-center gap-2">
                        <SpinnerLoader />
                        Loading...
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-full gap-2">
                        <LuPlus className="w-5 h-5" />
                        Load more
                      </span>
                    )}
                  </button>
                </div>

                <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-4 hover:bg-zinc-800/70 transition-all flex flex-col justify-center">
                  <div className="text-lg text-gray-400 mb-4">
                    {sessionData?.completed
                      ? "Update status"
                      : "Mark as completed"}
                  </div>
                  <button
                    onClick={toggleSessionComplete}
                    disabled={completingSession}
                    className={`w-full px-4 py-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      sessionData?.completed
                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                    }`}
                  >
                    {completingSession ? (
                      <span className="inline-flex items-center gap-2">
                        <SpinnerLoader />
                        Please wait...
                      </span>
                    ) : sessionData?.completed ? (
                      <>
                        <LuTrophy className="w-5 h-5" />
                        Not Completed
                      </>
                    ) : (
                      <>
                        <LuTrophy className="w-5 h-5" />
                        Mark completed
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A and AI explanation side-by-side */}
        <div
          className="container mx-auto px-6 lg:px-8 pb-12 flex flex-col lg:flex-row gap-8"
          id="qa-section"
        >
          {/* Left: Q&A */}
          <div className="flex-1" id="questions-container">
            <div className="flex items-center space-x-3 mb-6" id="qa-title">
              <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl">
                <LuStar className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Interview Q & A</h2>
            </div>

            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => (
                <motion.div
                  key={data._id || index}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{
                    duration: 0.28,
                    type: "spring",
                    stiffness: 120,
                    delay: index * 0.03,
                  }}
                  layout
                  className="max-w-4xl w-full mb-4"
                  id={index === 0 ? "first-question" : undefined}
                >
                  {/* Compact Question Card */}
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 hover:bg-zinc-900/70 transition-all duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-3">
                        <h3 className="text-base font-semibold text-white mb-2 leading-snug">
                          {data?.question}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => toggleQuestionPinStatus(data._id)}
                          className={`p-2 rounded-xl transition-all duration-300 ${
                            data?.isPinned
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                              : "bg-gray-700/50 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400 border border-gray-600"
                          }`}
                          title={
                            data?.isPinned ? "Unpin Question" : "Pin Question"
                          }
                        >
                          <LuPin className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            generateConceptExplanation(data.question, data._id)
                          }
                          className="p-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/20 transition-all duration-300"
                          title="Learn More"
                        >
                          <LuBookOpen className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleQuestionExpansion(data._id)}
                          className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all duration-300"
                          title={
                            expandedQuestions.has(data._id)
                              ? "Hide Answer"
                              : "Show Answer"
                          }
                        >
                          {expandedQuestions.has(data._id) ? (
                            <LuChevronUp className="w-4 h-4" />
                          ) : (
                            <LuChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Answer Section (clean format; no ``` in output) */}
                    <AnimatePresence>
                      {expandedQuestions.has(data._id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-gray-700 pt-3 mt-2"
                        >
                          <div className="text-gray-200 leading-relaxed formatted-answer">
                            {renderContent(data?.answer || "")}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!sessionData?.questions?.length && (
              <div className="text-center py-16">
                <div className="bg-zinc-900/50 border border-gray-700 rounded-2xl p-12">
                  <LuBookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <div className="text-xl font-semibold text-gray-400 mb-2">
                    No questions available yet
                  </div>
                  <div className="text-gray-500">
                    Questions will appear here once the session is loaded.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Explanation Panel - side by side for desktop */}
          {openLearnMoreDrawer && !isMobile && (
            <div className={`flex-1 h-full`}>{explanationContent}</div>
          )}
        </div>

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            isOpen={openLearnMoreDrawer}
            onClose={() => setOpenLearnMoreDrawer(false)}
            // Use the title prop in the Drawer now that the duplicate is gone
            title="AI Explanation"
            className="bg-black"
          >
            {/* The explanation content's box styling is already applied inside the component,
            so we pass the children directly to fill the drawer's body. */}
            <div className="w-full h-full overflow-y-auto">
              {explanationContent.props.children}
            </div>
          </Drawer>
        )}

        {/* Enhanced Custom CSS */}
        <style>
          {`
            .formatted-answer { line-height: 1.7; }
            .formatted-answer strong { color: #ffffff; font-weight: 700; }
            .formatted-answer .ans-h1,
            .formatted-answer .ans-h2,
            .formatted-answer .ans-h3 {
              color: #ffffff; font-weight: 800; margin: 0.75rem 0 0.5rem 0; line-height: 1.2;
            }
            .formatted-answer .ans-h1 { font-size: 1.375rem; }
            .formatted-answer .ans-h2 { font-size: 1.25rem; }
            .formatted-answer .ans-h3 { font-size: 1.125rem; }
            .formatted-answer li { list-style: disc; margin-left: 1.5rem; margin-bottom: 0.4rem; }
            
            .formatted-answer code {
              background-color: #1e1e1e !important; color: #d4d4d4 !important; padding: 0.1rem 0.35rem; border-radius: 0.25rem;
              font-family: Consolas, 'Courier New', monospace; border: 1px solid #2d2d2d;
            }

            /* Explanation pane code styling (match VS Code Dark) */
            .explanation-content { color: #ffffff; }
            .explanation-content pre {
                background-color: #1e1e1e !important;
                color: #d4d4d4; /* Retain default color for non-highlighted text */
                border: 1px solid #2d2d2d;
                border-radius: 0.75rem;
                padding: 1rem;
                margin: 1rem 0;
                overflow-x: auto;
                font-family: Consolas, 'Courier New', monospace;
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
            }
            .explanation-content code {
              background-color: #1e1e1e !important; color: #d4d4d4 !important;
              padding: 0.2rem 0.4rem; border-radius: 0.375rem; font-family: Consolas, 'Courier New', monospace;
              border: 1px solid #2d2d2d;
            }
            .explanation-content p,
            .explanation-content div,
            .explanation-content span,
            .explanation-content li { color: #ffffff; }
            .explanation-content h1,
            .explanation-content h2,
            .explanation-content h3,
            .explanation-content h4,
            .explanation-content h5,
            .explanation-content h6 {
              color: #ffffff !important; font-weight: 700;
            }
            .explanation-content ul,
            .explanation-content ol { color: #ffffff !important; }
            .explanation-content ul li::marker { color: #10b981; }
            .explanation-content strong,
            .explanation-content b { color: #ffffff !important; font-weight: 700; }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
