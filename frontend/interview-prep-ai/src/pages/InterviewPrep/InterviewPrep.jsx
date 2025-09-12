import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuListCollapse } from 'react-icons/lu';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia('(max-width: 767px)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  const fetchSessionDetailById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLANATIONS, { question });
      if (response.data) {
        setExplanation(response.data);
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
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      if (response.data && response.data.question) {
        await fetchSessionDetailById();
        toast.success('Question Pinned Successfully');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to pin question.");
    }
  };

  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);
      const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfQuestions: 10,
      });

      const generatedQuestions = aiResponse.data;
      const response = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
        sessionId,
        questions: generatedQuestions,
      });

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

  useEffect(() => {
    if (sessionId) fetchSessionDetailById();
  }, [sessionId]);

  return (
    <DashboardLayout>
      {/* Role Info Header */}
      <div className="container mx-auto px-6 md:px-10 pt-6 flex justify-start">
        <RoleInfoHeader
          role={sessionData?.role || ""}
          topicsToFocus={sessionData?.topicsToFocus || ""}
          experience={sessionData?.experience || "-"}
          questions={sessionData?.questions?.length || 0}
          description={sessionData?.description || ""}
          lastUpdated={sessionData?.updatedAt ? moment(sessionData.updatedAt).format("Do MMM YYYY") : ""}
        />
      </div>

      {/* Q&A Section */}
      <div className="container mx-auto px-6 md:px-10 pt-6 pb-10 flex gap-8">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-black mb-6">Interview Q & A</h2>

          <AnimatePresence>
            {sessionData?.questions?.map((data, index) => (
              <motion.div
                key={data._id || index}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, type: "spring", stiffness: 120, delay: index * 0.03 }}
                layout
                className="max-w-2xl w-full"
              >
                <QuestionCard
                  question={data?.question}
                  answer={data?.answer}
                  onLearnMore={() => generateConceptExplanation(data.question)}
                  isPinned={data?.isPinned}
                  onTogglePin={() => toggleQuestionPinStatus(data._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLoading && sessionData?.questions?.length > 0 && (
            <div className="flex items-center justify-center mt-6">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 rounded-full hover:bg-gray-800 disabled:opacity-60 transition-colors"
                disabled={isUpdateLoader}
                onClick={uploadMoreQuestions}
              >
                {isUpdateLoader ? <SpinnerLoader /> : <LuListCollapse className="text-lg" />}{" "}
                Load More
              </button>
            </div>
          )}
        </div>

        {/* Right Explanation (desktop only) */}
        {openLearnMoreDrawer && !isMobile && (
          <div className="hidden md:block max-w-2xl w-full">
            <div className="bg-white rounded-lg p-6 shadow-xl shadow-gray-100/70 border border-gray-100 sticky top-20">
              <h3 className="font-semibold text-black mb-4">
                {explanation?.title || "Explanation"}
              </h3>
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <AIResponsePreview content={explanation?.explanation || explanation?.output || ""} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          isOpen={openLearnMoreDrawer}
          onClose={() => setOpenLearnMoreDrawer(false)}
          title={!isLoading && (explanation?.title || "Explanation")}
        >
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && (
            <AIResponsePreview content={explanation?.explanation || explanation?.output || ""} />
          )}
        </Drawer>
      )}
    </DashboardLayout>
  );
};

export default InterviewPrep;
