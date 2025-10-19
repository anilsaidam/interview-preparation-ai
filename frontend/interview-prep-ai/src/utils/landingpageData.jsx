import {
    LuMessageSquare,
    LuFileText,
    LuCode,
    LuMail,
    LuStar,
    LuGraduationCap,
    LuBriefcase,
    LuRefreshCcw,
    LuSparkles,
    LuGithub,
    LuLinkedin,
    LuTwitter,
    LuGlobe,
  } from "react-icons/lu";
  import React from "react";
import { Route } from "react-router-dom";
  
  // Features array
  export const features = [
    {
      id: 1,
      icon: <LuMessageSquare className="w-8 h-8 text-emerald-400" />,
      title: "AI Interview Preparation",
      description: "Master interviews with personalized AI coaching and realistic practice sessions.",
      bullets: [
        "Role-specific questions tailored to your experience",
        "Detailed explanations and improvement suggestions",
        "Pin important questions and track your progress",
        "Session management with completion tracking",
      ],
      cta: "Start Practicing",
      color: "emerald",
      route : '/interview-prep/new'
    },
    {
      id: 2,
      icon: <LuFileText className="w-8 h-8 text-blue-400" />,
      title: "ATS Score Analyzer",
      description: "Optimize your resume for applicant tracking systems with comprehensive analysis.",
      bullets: [
        "ATS compatibility analysis",
        "Keyword optimization & skill detection",
        "Section-wise scoring",
        "Save & compare resume versions",
      ],
      cta: "Analyze Resume",
      color: "blue",
      route : '/ats-score'
    },
    {
      id: 3,
      icon: <LuCode className="w-8 h-8 text-purple-400" />,
      title: "Coding Practice Hub",
      description: "Master algorithms with AI-powered explanations & multi-language solutions.",
      bullets: [
        "Difficulty-based sets: Easy–Hard",
        "Multi-language: C, C++, Java, Python",
        "Complexity analysis & AI Explanation",
        "Streak trackers and progress",
      ],
      cta: "Start Coding",
      color: "purple",
      route : '/coding'
    },
    {
      id: 4,
      icon: <LuMail className="w-8 h-8 text-orange-400" />,
      title: "Email Template Generator",
      description: "Generate professional, human-like emails for all your career needs.",
      bullets: [
        "Cold mail, referral & follow-up templates",
        "Personalization: role, experience, job description & resume",
        "AI-powered, professional content",
        "Persistent library for organization",
      ],
      cta: "Generate Templates",
      color: "orange",
      route : '/templates'
    },
  ];
  
  // Testimonials array
  export const testimonials = [
    {
      id: 1,
      text: "Career Companion AI transformed my interview preparation. The AI-generated questions were incredibly realistic and helped me identify my weak areas. I landed my dream job at Microsoft within 3 weeks!",
      author: "Priya Sharma",
      role: "Senior Software Engineer",
      company: "Microsoft",
      rating: 5,
    },
    {
      id: 2,
      text: "The ATS analyzer was a game-changer. After optimizing with Career Companion AI, I started getting interview calls immediately.",
      author: "Rahul Gupta",
      role: "Data Scientist",
      company: "Google",
      rating: 5,
    },
    {
      id: 3,
      text: "As someone who struggled with coding interviews, the practice hub with AI explanations made all the difference.",
      author: "Ananya Reddy",
      role: "Full Stack Developer",
      company: "Amazon",
      rating: 5,
    },
  ];
  
  // FAQs array
  export const faqs = [
    {
      id: 1,
      question: "How does the AI generate personalized content?",
      answer:
        "Our AI analyzes your target role, experience, and topics to generate relevant questions and templates. It uses advanced models trained on thousands of real scenarios.",
    },
    {
      id: 2,
      question: "Is my data secure and private?",
      answer:
        "Yes, we use enterprise-grade security with end-to-end encryption. Your data is never shared and can be deleted anytime.",
    },
    {
      id: 3,
      question: "How accurate is the ATS score analysis?",
      answer:
        "Our ATS analyzer is updated frequently with latest hiring trends and benchmarks, delivering 95%+ accuracy.",
    },
    {
      id: 4,
      question: "Can I practice coding in multiple languages?",
      answer:
        "Yes! Coding practice hub supports C, C++, Java, and Python with detailed multi-language solutions and explanations.",
    },
    {
      id: 5,
      question: "What types of email templates can I generate?",
      answer:
        "Cold mails, referral requests, follow-up, and thank you notes—always personalized for your job search.",
    },
    {
      id: 6,
      question: "Is Career Companion AI completely free?",
      answer: "Yes! All features are accessible without payment—fully free for all users.",
    },
  ];
  
  // User groups for Who is this for?
  export const userGroups = [
    {
      icon: <LuGraduationCap className="text-emerald-400 text-3xl" />,
      title: "Students & Recent Graduates",
      desc: "Get a head start on your career. Practice for your first interviews, optimize your resume for internships, and master core concepts.",
    },
    {
      icon: <LuBriefcase className="text-blue-400 text-3xl" />,
      title: "Mid-Career Professionals",
      desc: "Advance your career or switch roles smoothly. Prepare for senior-level interviews and refine your resume for new opportunities.",
    },
    {
      icon: <LuRefreshCcw className="text-purple-400 text-3xl" />,
      title: "Career Changers",
      desc: "Make a successful career transition. The platform guides you through interview preparation and resume building for a new industry.",
    },
  ];
  
  export const Footer = React.memo(() => (
    <footer className="relative z-30 bg-black pt-20 pb-12 border-t border-zinc-800">
      {/* First level div */}
      <div className="container mx-auto px-6 lg:px-8">
        {/* Second level div */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-12">
          {/* Third level div - Brand/Social */}
          <div className="mb-8 lg:mb-0 lg:w-1/3">
            <div className="flex items-center gap-3 mb-4">
              <LuSparkles className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">Career Companion AI</span>
            </div>
            <p className="text-zinc-500 text-base max-w-xs mb-6">
              Your all-in-one platform for interview prep, resume optimization, coding practice, and smart AI-powered career success. Clean, secure, and always free.
            </p>
            <div className="flex flex-row gap-4">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white text-zinc-600 cursor-pointer transition-colors">
                <LuGithub className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 text-zinc-600 cursor-pointer transition-colors">
                <LuLinkedin className="w-6 h-6" />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 text-zinc-600 cursor-pointer transition-colors">
                <LuTwitter className="w-6 h-6" />
              </a>
              <a href="/" className="hover:text-purple-400 text-zinc-600 cursor-pointer transition-colors">
                <LuGlobe className="w-6 h-6" />
              </a>
            </div>
          </div> {/* END Third level div - Brand/Social */}
  
          {/* Third level div - Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
            <div> {/* Link Group 1 */}
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors cursor-pointer">Testimonials</a></li>
                <li><a href="#faqs" className="hover:text-white transition-colors cursor-pointer">FAQs</a></li>
              </ul>
            </div>
            <div> {/* Link Group 2 */}
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">API Docs</a></li>
              </ul>
            </div>
            <div> {/* Link Group 3 */}
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Terms</a></li>
              </ul>
            </div>
            <div> {/* Link Group 4 */}
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Sitemap</a></li>
              </ul>
            </div>
          </div> {/* END Third level div - Links Grid */}
        </div> {/* END Second level div */}
        {/* This is the div causing the issue, you have two closing divs after the links grid, but only one opening 'Second level div' */}
        {/* After the `Second level div` closes, the next element in the `container` div should be the copyright section */}
  
        {/* COPYRIGHT SECTION - This should be a direct child of the `container` div, not within the `flex` div */}
        <div className="border-t border-zinc-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} Career Companion AI. All rights reserved. Built with <span className="text-emerald-400">&hearts;</span> by Saidam Anil Kumar.
          </span>
          <span className="text-zinc-600 text-sm">Crafted for career growth</span>
        </div>
      </div> {/* END First level div - container */}
    </footer>
  ));
  