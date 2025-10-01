import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { LuMessageSquare, LuFileText, LuCode, LuMail} from "react-icons/lu";

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: "AI-Powered Interview Preparation",
      description: "Create sessions, generate tailored Q&A, and organize your prep.",
      icon: LuMessageSquare,
      path: "/interview-prep/new",
      color: "text-blue-400",
    },
    {
      id: 2,
      title: "AI-Powered ATS Score Checker",
      description: "Upload the resume to get ATS score, keywords, and improvements.",
      icon: LuFileText,
      path: "/ats-score",
      color: "text-green-400",
    },
    {
      id: 3,
      title: "AI-Powered Coding Questions",
      description:
        "Generate role-based coding problems, check solution in multiple languages with AI explanation.",
      icon: LuCode,
      path: "/coding",
      color: "text-purple-400",
    },
    {
      id: 4,
      title: "AI Email Template Generator",
      description:
        "Generate formal, human-like emails (cold mail, referral, follow-up, thank you) and save to your library.",
      icon: LuMail,
      path: "/templates",
      color: "text-orange-400",
    },
  ];

  const handleCardActivate = (e, path) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-black min-h-screen">
        <div className="container mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Welcome to Your AI Interview Prep Hub
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
              Master the next interview with comprehensive AI-powered tools: practice questions, optimize the
              resume, solve coding challenges, and access curated learning resources.
            </p>
          </div>

          {/* Features Grid - Fully Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  role="button"
                  tabIndex={0}
                  aria-label={feature.title}
                  onClick={() => navigate(feature.path)}
                  onKeyDown={(e) => handleCardActivate(e, feature.path)}
                  className="bg-zinc-900 border border-gray-700 rounded-2xl p-6 sm:p-7 lg:p-8 cursor-pointer transition-all duration-300 hover:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 motion-safe:hover:shadow-2xl motion-safe:hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:transform-none"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-zinc-800 ${feature.color} transition-colors`}
                      aria-hidden="true"
                    >
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2.5 sm:mb-3 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom spacing for small screens */}
          <div className="h-8 sm:h-10" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
