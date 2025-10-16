// LandingPage.jsx

import React, { useContext, useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuSparkles,
  LuMessageSquare,
  LuFileText,
  LuCode,
  LuMail,
  LuTarget,
  LuBrain,
  LuUsers,
  LuTrendingUp,
  LuStar,
  LuArrowRight,
  LuGithub,
  LuTwitter,
  LuLinkedin,
  LuGlobe,
  LuLogOut,
  LuX,
} from "react-icons/lu";
import { motion } from "framer-motion";
import LoginModal from "../components/Auth/LoginModal";
import SignUpModal from "../components/Auth/SignUpModal";
import Modal from "../components/Modal";
import { UserContext } from "../context/userContext";

// Lazy loading hook for Intersection Observer
const useLazyLoad = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(entry.target);
    };
  }, []);

  return [ref, isVisible];
};

// Memoized Feature Card
const FeatureCard = React.memo(({ feature, index }) => {
  const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });

  const getFeatureColors = (color) => {
    const colors = {
      emerald: {
        iconBg: "bg-emerald-900/80",
        bulletBg: "bg-emerald-500",
        buttonBg: "bg-emerald-600 hover:bg-emerald-700",
      },
      blue: {
        iconBg: "bg-blue-900/80",
        bulletBg: "bg-blue-500",
        buttonBg: "bg-blue-600 hover:bg-blue-700",
      },
      purple: {
        iconBg: "bg-purple-900/80",
        bulletBg: "bg-purple-500",
        buttonBg: "bg-purple-600 hover:bg-purple-700",
      },
      orange: {
        iconBg: "bg-orange-900/80",
        bulletBg: "bg-orange-500",
        buttonBg: "bg-orange-600 hover:bg-orange-700",
      },
    };
    return colors[color] || colors.emerald;
  };
  const colors = getFeatureColors(feature.color);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <div className="relative bg-black border border-zinc-800 rounded-2xl p-8 h-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black/50"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 p-3 rounded-xl ${colors.iconBg} shadow-lg group-hover:scale-105 transition-all duration-300 border border-zinc-800`}
            >
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-400 mb-5 leading-relaxed text-base">
                {feature.description}
              </p>
              <ul className="space-y-2 mb-7">
                {feature.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-zinc-400 text-sm"
                  >
                    <div
                      className={`mt-2 w-1.5 h-1.5 rounded-full ${colors.bulletBg}`}
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`${colors.buttonBg} text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-250 shadow-lg focus:outline-none cursor-pointer border border-zinc-800`}
              >
                {feature.cta}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized Testimonial Card
const TestimonialCard = React.memo(({ testimonial, index }) => {
  const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      key={testimonial.id}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="group"
    >
      <div className="bg-black border border-zinc-800 rounded-2xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex space-x-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <LuStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-zinc-300 mb-6 leading-relaxed italic text-base">
          "{testimonial.text}"
        </p>
        <div className="border-t border-zinc-800 pt-4">
          <div className="font-bold text-white">{testimonial.author}</div>
          <div className="text-zinc-400 text-sm">{testimonial.role}</div>
          <div className="text-emerald-400 font-medium text-sm">
            {testimonial.company}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized FAQ Item
const FAQItem = React.memo(({ faq, index, expandedFAQ, setExpandedFAQ }) => {
  const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      key={faq.id}
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="bg-black border border-zinc-800 rounded-2xl overflow-hidden hover:bg-zinc-900/50 transition-all duration-300"
    >
      <button
        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-zinc-900/30 transition-colors cursor-pointer"
      >
        <span className="text-lg font-semibold text-white pr-4">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <LuArrowRight className="w-5 h-5 text-zinc-400 transform rotate-90" />
        </motion.div>
      </button>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: expandedFAQ === faq.id ? "auto" : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5">
          <p className="text-zinc-400 text-base leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Footer
const Footer = React.memo(() => (
  <footer className="relative z-30 bg-black pt-20 pb-12 border-t border-zinc-800">
    <div className="container mx-auto px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-12">
        <div className="mb-8 lg:mb-0 lg:w-1/3">
          <div className="flex items-center gap-3 mb-4">
            <LuSparkles className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">
              Career Companion AI
            </span>
          </div>
          <p className="text-zinc-500 text-base max-w-xs mb-6">
            Your all-in-one platform for interview prep, resume optimization,
            coding practice, and smart AI-powered career success. Clean, secure,
            and always free.
          </p>
          <div className="flex flex-row gap-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white text-zinc-600 cursor-pointer transition-colors"
            >
              <LuGithub className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 text-zinc-600 cursor-pointer transition-colors"
            >
              <LuLinkedin className="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 text-zinc-600 cursor-pointer transition-colors"
            >
              <LuTwitter className="w-6 h-6" />
            </a>
            <a
              href="/"
              className="hover:text-purple-400 text-zinc-600 cursor-pointer transition-colors"
            >
              <LuGlobe className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("features")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("how-it-works")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("testimonials")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#faqs"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("faqs")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Guides
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-zinc-500">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accessibility
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
        <span className="text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} Career Companion AI. All rights
          reserved. Made by Saidam Anil Kumar.
        </span>
        <span className="text-zinc-600 text-sm">
          Crafted with <span className="text-emerald-400">&hearts;</span> for
          career growth
        </span>
      </div>
    </div>
  </footer>
));

const LandingPage = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Logout modal state
  const [logoutModal, setLogoutModal] = useState({
    show: false,
  });

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const askLogout = () => {
    setLogoutModal({ show: true });
  };

  const closeLogoutModal = () => {
    setLogoutModal({ show: false });
  };

  const confirmLogout = () => {
    clearUser();
    closeLogoutModal();
  };

  const features = useMemo(
    () => [
      {
        id: 1,
        icon: <LuMessageSquare className="w-8 h-8 text-emerald-400" />,
        title: "AI Interview Preparation",
        description:
          "Master interviews with personalized AI coaching and realistic practice sessions.",
        bullets: [
          "Role-specific questions tailored to your experience",
          "Detailed explanations and improvement suggestions",
          "Pin important questions and track your progress",
          "Session management with completion tracking",
        ],
        cta: "Start Practicing",
        color: "emerald",
      },
      {
        id: 2,
        icon: <LuFileText className="w-8 h-8 text-blue-400" />,
        title: "ATS Score Analyzer",
        description:
          "Optimize your resume for applicant tracking systems with comprehensive analysis.",
        bullets: [
          "Comprehensive ATS compatibility analysis",
          "Keyword optimization and missing skills detection",
          "Section-wise scoring with actionable recommendations",
          "Save and compare multiple resume versions",
        ],
        cta: "Analyze Resume",
        color: "blue",
      },
      {
        id: 3,
        icon: <LuCode className="w-8 h-8 text-purple-400" />,
        title: "Coding Practice Hub",
        description:
          "Master algorithms with AI-powered explanations and multi-language solutions.",
        bullets: [
          "Difficulty-based problem sets (Easy to Hard)",
          "Multi-language solutions (C, C++, Java, Python)",
          "Detailed complexity analysis and AI Explanation",
          "Progress tracking and streak counters",
        ],
        cta: "Start Coding",
        color: "purple",
      },
      {
        id: 4,
        icon: <LuMail className="w-8 h-8 text-orange-400" />,
        title: "Email Template Generator",
        description:
          "Generate professional, human-like emails for all your career needs.",
        bullets: [
          "Cold mail, referral, and follow-up templates",
          "Personalized based on role, experience, job description and resume",
          "AI-powered content that feels natural and professional",
          "Save and organize templates in your personal library",
        ],
        cta: "Generate Templates",
        color: "orange",
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        id: 1,
        text: "Career Companion AI transformed my interview preparation completely. The AI-generated questions were incredibly realistic and helped me identify my weak areas. I landed my dream job at Microsoft within 3 weeks!",
        author: "Priya Sharma",
        role: "Senior Software Engineer",
        company: "Microsoft",
        rating: 5,
      },
      {
        id: 2,
        text: "The ATS analyzer was a game-changer. My resume was getting zero responses, but after optimizing it with Career Companion AI, I started getting interview calls immediately. The keyword analysis is spot-on.",
        author: "Rahul Gupta",
        role: "Data Scientist",
        company: "Google",
        rating: 5,
      },
      {
        id: 3,
        text: "As someone who struggled with coding interviews, the practice hub with AI explanations made all the difference. The multi-language solutions and complexity analysis helped me understand concepts deeply.",
        author: "Ananya Reddy",
        role: "Full Stack Developer",
        company: "Amazon",
        rating: 5,
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        id: 1,
        question: "How does the AI generate personalized content?",
        answer:
          "Our AI analyzes your target role, years of experience, and focus topics to generate relevant questions and templates. It uses advanced language models trained on thousands of real scenarios across different companies and roles, ensuring content matches current industry standards.",
      },
      {
        id: 2,
        question: "Is my data secure and private?",
        answer:
          "Absolutely. We use enterprise-grade security with end-to-end encryption. Your resume and personal data are never shared with third parties. All processing happens securely, and you can delete your data anytime from your account settings.",
      },
      {
        id: 3,
        question: "How accurate is the ATS score analysis?",
        answer:
          "Our ATS analyzer is trained on real ATS systems used by Fortune 500 companies. It achieves 95% accuracy in predicting how well your resume will perform. We continuously update our algorithms based on the latest ATS technology and hiring trends.",
      },
      {
        id: 4,
        question: "Can I practice coding in multiple programming languages?",
        answer:
          "Yes! Our coding practice hub supports C, C++, Java, and Python. Each problem comes with optimized solutions in all supported languages, along with detailed explanations of different approaches and complexity analysis.",
      },
      {
        id: 5,
        question: "What types of email templates can I generate?",
        answer:
          "Our AI generates four types of professional emails: cold mails to recruiters, referral requests, follow-up messages, and thank you notes. Each template is personalized based on your role, experience level, and job description for maximum effectiveness.",
      },
      {
        id: 6,
        question: "Is Career Companion AI completely free?",
        answer:
          "Yes! Career Companion AI is completely free to use. All features including interview preparation, ATS analysis, coding practice, and email template generation are available at no cost. We believe in making career advancement tools accessible to everyone.",
      },
    ],
    []
  );

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-inter min-h-screen text-zinc-100 bg-black relative">
      {/* Premium Animated BG */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-black/50 to-black/80"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              className="font-bold text-xl lg:text-2xl text-white cursor-pointer flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              onClick={() => window.scrollTo(0, 0)}
            >
              <LuSparkles className="text-emerald-400" />
              <span>Career Companion AI</span>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-10">
              {[
                { label: "Features", id: "features" },
                { label: "How it works", id: "how-it-works" },
                { label: "Testimonials", id: "testimonials" },
                { label: "FAQs", id: "faqs" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-zinc-400 hover:text-white font-medium relative group cursor-pointer transition-colors"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-emerald-400 w-0 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/dashboard")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 border border-emerald-600/30"
                  >
                    Dashboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={askLogout}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium cursor-pointer transition-colors"
                  >
                    <LuLogOut className="w-5 h-5" /> Logout
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCTA}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 border border-emerald-600/30"
                >
                  Get Started
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: mobileMenuOpen ? 1 : 0,
            height: mobileMenuOpen ? "auto" : 0,
          }}
          className="lg:hidden bg-black/95 backdrop-blur-md border-t border-zinc-800 overflow-hidden"
        >
          <div className="px-6 py-4 space-y-4">
            {[
              { label: "Features", id: "features" },
              { label: "How it works", id: "how-it-works" },
              { label: "Testimonials", id: "testimonials" },
              { label: "FAQs", id: "faqs" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block text-zinc-400 hover:text-white font-medium w-full text-left py-2 cursor-pointer transition-colors"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={askLogout}
                className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium w-full text-left py-2 cursor-pointer transition-colors"
              >
                <LuLogOut className="w-5 h-5" /> Logout
              </button>
            ) : null}
            <button
              onClick={handleCTA}
              className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg w-full mt-4 cursor-pointer border border-emerald-600/30"
            >
              {user ? "Dashboard" : "Get Started"}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero */}
      <section id="hero" className="relative pt-28 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="inline-flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-6 py-2.5 mb-10 backdrop-blur-sm cursor-pointer"
              onClick={handleCTA}
            >
              <LuSparkles className="text-emerald-400" />
              <span className="text-zinc-200 font-medium text-sm">
                AI-Powered Career Transformation
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-white"
            >
              Master Your Career with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                AI Intelligence
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.27 }}
              className="text-xl text-zinc-400 mb-14 max-w-2xl mx-auto leading-relaxed"
            >
              From interview preparation to resume optimization, coding practice
              to email templates — your complete AI-powered career success
              platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.36 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCTA}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-4 rounded-lg text-lg shadow-xl cursor-pointer border border-emerald-600/30 transition-all"
              >
                Start Free Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("how-it-works")}
                className="border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50 text-white font-semibold px-10 py-4 rounded-lg text-lg transition-all cursor-pointer"
              >
                See How It Works
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">
              Powerful{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                AI Features
              </span>{" "}
              for Career Success
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Four comprehensive modules designed to transform every aspect of
              your career journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.id} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
              How It{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                Works
              </span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Four simple steps to transform your career with AI-powered
              insights
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-1/2 left-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-blue-500/20"></div>
            {[
              {
                id: 1,
                title: "Setup Profile",
                description:
                  "Tell us your background, skills, and career goals to personalize your experience.",
                icon: <LuUsers className="text-emerald-400 text-2xl" />,
              },
              {
                id: 2,
                title: "AI Analysis",
                description:
                  "Our AI reviews your profile and creates a tailored roadmap for your job search.",
                icon: <LuBrain className="text-blue-400 text-2xl" />,
              },
              {
                id: 3,
                title: "Practice & Improve",
                description:
                  "Engage with interview drills, coding challenges, and resume reviews—all tailored to your needs.",
                icon: <LuTarget className="text-purple-400 text-2xl" />,
              },
              {
                id: 4,
                title: "Track Progress",
                description:
                  "Monitor your growth with detailed analytics and actionable feedback to stay on track.",
                icon: <LuTrendingUp className="text-orange-400 text-2xl" />,
              },
            ].map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.17 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="text-center group relative p-4"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-3xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border border-emerald-400/30">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-zinc-500 leading-relaxed text-base">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">
              Success{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                Stories
              </span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Real professionals who transformed their careers with Career
              Companion AI
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-zinc-900/50 to-black border-y border-zinc-800">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 leading-tight text-white">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                Transform
              </span>{" "}
              Your Career?
            </h2>
            <p className="text-xl text-zinc-500 mb-12 leading-relaxed">
              Join thousands of professionals who have successfully advanced
              their careers with AI-powered tools.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCTA}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-14 py-5 rounded-lg text-xl shadow-xl cursor-pointer border border-emerald-600/30 transition-all"
            >
              Start Your Journey Today
            </motion.button>
            <p className="text-zinc-600 mt-6 text-sm">
              100% Free • No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Questions
              </span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about Career Companion AI
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-5">
            {faqs.map((faq, idx) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                index={idx}
                expandedFAQ={expandedFAQ}
                setExpandedFAQ={setExpandedFAQ}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        {currentPage === "login" ? (
          <LoginModal
            setCurrentPage={setCurrentPage}
            onClose={() => setOpenAuthModal(false)}
          />
        ) : (
          <SignUpModal
            setCurrentPage={setCurrentPage}
            onClose={() => setOpenAuthModal(false)}
          />
        )}
      </Modal>

      {/* Logout Confirmation Modal */}
      {logoutModal.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Confirm Logout</h3>
              <button
                onClick={closeLogoutModal}
                className="p-2 cursor-pointer text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors duration-300"
              >
                <LuX className="w-6 h-6" />
              </button>
            </div>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Are you sure you want to logout? You will need to sign in again to
              access your dashboard.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={closeLogoutModal}
                className="cursor-pointer px-6 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-3 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
