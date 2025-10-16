// LandingPage.jsx

import React, { useContext, useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuSparkles, LuMessageSquare, LuFileText, LuCode, LuMail, LuStar,
  LuGithub, LuTwitter, LuLinkedin, LuGlobe, LuLogOut, LuX, LuGraduationCap, LuBriefcase, LuRefreshCcw,
  LuArrowRight,
} from "react-icons/lu";
import { motion } from "framer-motion";
import LoginModal from "../components/Auth/LoginModal";
import SignUpModal from "../components/Auth/SignUpModal";
import Modal from "../components/Modal";
import { UserContext } from "../context/userContext";

// Utility: Lazy load reveal
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
    return () => { if (ref.current) observer.unobserve(observer.current); }
  }, []);
  return [ref, isVisible];
};

// Feature Card (unchanged, gradient bg replaced)
const FeatureCard = React.memo(({ feature, index }) => {
  const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });
  const getFeatureColors = (color) => {
    const colors = {
      emerald: { iconBg: "bg-emerald-950", bulletBg: "bg-emerald-500", buttonBg: "bg-emerald-700 hover:bg-emerald-800" },
      blue: { iconBg: "bg-blue-950", bulletBg: "bg-blue-500", buttonBg: "bg-blue-700 hover:bg-blue-800" },
      purple: { iconBg: "bg-purple-950", bulletBg: "bg-purple-500", buttonBg: "bg-purple-700 hover:bg-purple-800" },
      orange: { iconBg: "bg-orange-950", bulletBg: "bg-orange-500", buttonBg: "bg-orange-700 hover:bg-orange-800" },
    }; return colors[color] || colors.emerald;
  }; const colors = getFeatureColors(feature.color);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.08 }} className="group">
      <div className="relative bg-black border border-zinc-800 rounded-2xl p-8 h-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-3 rounded-xl ${colors.iconBg} shadow-lg group-hover:scale-105 transition-all duration-300 border border-zinc-800`}>
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-zinc-400 mb-5 leading-relaxed text-base">{feature.description}</p>
              <ul className="space-y-2 mb-7">
                {feature.bullets.map((bullet, i) => (<li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <div className={`mt-2 w-1.5 h-1.5 rounded-full ${colors.bulletBg}`}></div>
                  <span>{bullet}</span>
                </li>))}
              </ul>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                className={`${colors.buttonBg} text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-250 shadow-lg focus:outline-none cursor-pointer border border-zinc-800`}>
                {feature.cta}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// TestimonialCard (unchanged)
const TestimonialCard = React.memo(({ testimonial, index }) => {
  const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });
  return (
    <motion.div ref={ref} key={testimonial.id} initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.12 }} className="group">
      <div className="bg-black border border-zinc-800 rounded-2xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex space-x-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (<LuStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />))}
        </div>
        <p className="text-zinc-300 mb-6 leading-relaxed italic text-base">"{testimonial.text}"</p>
        <div className="border-t border-zinc-800 pt-4">
          <div className="font-bold text-white">{testimonial.author}</div>
          <div className="text-zinc-400 text-sm">{testimonial.role}</div>
          <div className="text-emerald-400 font-medium text-sm">{testimonial.company}</div>
        </div>
      </div>
    </motion.div>
  );
});

// FAQItem (unchanged)
const FAQItem = React.memo(({ faq, index, expandedFAQ, setExpandedFAQ }) => {
  const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });
  return (
    <motion.div ref={ref} key={faq.id} initial={{ opacity: 0, y: 24 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06 }} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden hover:bg-zinc-900/50 transition-all duration-300">
      <button onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-zinc-900/30 transition-colors cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
        <motion.div animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex-shrink-0">
          <LuArrowRight className="w-5 h-5 text-zinc-400 transform rotate-90" />
        </motion.div>
      </button>
      <motion.div initial={{ height: 0 }} animate={{ height: expandedFAQ === faq.id ? "auto" : 0 }}
        transition={{ duration: 0.25 }} className="overflow-hidden">
        <div className="px-6 pb-5"><p className="text-zinc-400 text-base leading-relaxed">{faq.answer}</p></div>
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
          reserved. Built with <span className="text-emerald-400">&hearts;</span> by Saidam Anil Kumar.
        </span>
        <span className="text-zinc-600 text-sm">
          Crafted for career growth
        </span>
      </div>
    </div>
  </footer>
));

// Main Component
const LandingPage = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const [logoutModal, setLogoutModal] = useState({ show: false });

  const handleCTA = () => { if (!user) setOpenAuthModal(true); else navigate("/dashboard"); };
  const askLogout = () => { setLogoutModal({ show: true }); };
  const closeLogoutModal = () => { setLogoutModal({ show: false }); };
  const confirmLogout = () => { clearUser(); closeLogoutModal(); };

  // Feature Cards
  const features = useMemo(() => [
    {
      id: 1,
      icon: <LuMessageSquare className="w-8 h-8 text-emerald-400" />,
      title: "AI Interview Preparation",
      description: "Master interviews with personalized AI coaching and realistic practice sessions.",
      bullets: [
        "Role-specific questions tailored to your experience",
        "Detailed explanations and improvement suggestions",
        "Pin important questions and track your progress",
        "Session management with completion tracking"
      ],
      cta: "Start Practicing",
      color: "emerald"
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
        "Save & compare resume versions"
      ],
      cta: "Analyze Resume",
      color: "blue"
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
        "Streak trackers and progress"
      ],
      cta: "Start Coding",
      color: "purple"
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
        "Persistent library for organization"
      ],
      cta: "Generate Templates",
      color: "orange"
    }
  ], []);

  // Testimonials
  const testimonials = useMemo(() => [
    {
      id: 1,
      text: "Career Companion AI transformed my interview preparation. The AI-generated questions were incredibly realistic and helped me identify my weak areas. I landed my dream job at Microsoft within 3 weeks!",
      author: "Priya Sharma",
      role: "Senior Software Engineer",
      company: "Microsoft",
      rating: 5
    },
    {
      id: 2,
      text: "The ATS analyzer was a game-changer. After optimizing with Career Companion AI, I started getting interview calls immediately.",
      author: "Rahul Gupta",
      role: "Data Scientist",
      company: "Google",
      rating: 5
    },
    {
      id: 3,
      text: "As someone who struggled with coding interviews, the practice hub with AI explanations made all the difference.",
      author: "Ananya Reddy",
      role: "Full Stack Developer",
      company: "Amazon",
      rating: 5
    }
  ], []);

  // FAQs
  const faqs = useMemo(() => [
    {
      id: 1, question: "How does the AI generate personalized content?",
      answer: "Our AI analyzes your target role, experience, and topics to generate relevant questions and templates. It uses advanced models trained on thousands of real scenarios."
    },
    {
      id: 2, question: "Is my data secure and private?",
      answer: "Yes, we use enterprise-grade security with end-to-end encryption. Your data is never shared and can be deleted anytime."
    },
    {
      id: 3, question: "How accurate is the ATS score analysis?",
      answer: "Our ATS analyzer is updated frequently with latest hiring trends and benchmarks, delivering 95%+ accuracy."
    },
    {
      id: 4, question: "Can I practice coding in multiple languages?",
      answer: "Yes! Coding practice hub supports C, C++, Java, and Python with detailed multi-language solutions and explanations."
    },
    {
      id: 5, question: "What types of email templates can I generate?",
      answer: "Cold mails, referral requests, follow-up, and thank you notes—always personalized for your job search."
    },
    {
      id: 6, question: "Is Career Companion AI completely free?",
      answer: "Yes! All features are accessible without payment—fully free for all users."
    }
  ], []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // NEW: Who is this for? section data
  const userGroups = [
    {
      icon: <LuGraduationCap className="text-emerald-400 text-3xl" />,
      title: "Students & Recent Graduates",
      desc: "Get a head start on your career. Practice for your first interviews, optimize your resume for internships, and master core concepts."
    },
    {
      icon: <LuBriefcase className="text-blue-400 text-3xl" />,
      title: "Mid-Career Professionals",
      desc: "Advance your career or switch roles smoothly. Prepare for senior-level interviews and refine your resume for new opportunities."
    },
    {
      icon: <LuRefreshCcw className="text-purple-400 text-3xl" />,
      title: "Career Changers",
      desc: "Make a successful career transition. The platform guides you through interview preparation and resume building for a new industry."
    }
  ];

  return (
    <div className="font-inter min-h-screen text-zinc-100 bg-black relative">
      {/* Navigation */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-black backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div className="font-bold text-xl lg:text-2xl text-white cursor-pointer flex items-center gap-2"
              whileHover={{ scale: 1.05 }} onClick={() => window.scrollTo(0, 0)}>
              <LuSparkles className="text-emerald-400" />
              <span>Career Companion AI</span>
            </motion.div>
            <div className="hidden lg:flex items-center space-x-10">
              {[
                { label: "Features", id: "features", icon: <LuMessageSquare className="inline-block mr-1 text-zinc-400" /> },
                { label: "For Whom", id: "who-is-it-for", icon: <LuGraduationCap className="inline-block mr-1 text-zinc-400" /> },
                { label: "Testimonials", id: "testimonials", icon: <LuStar className="inline-block mr-1 text-zinc-400" /> },
                { label: "FAQs", id: "faqs", icon: <LuX className="inline-block mr-1 text-zinc-400" /> }
              ].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)}
                  className="text-zinc-400 hover:text-white font-medium relative group cursor-pointer transition-colors">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-emerald-400 w-0 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
              {user ? (
                <>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/dashboard")}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 border border-emerald-700 cursor-pointer">
                    Dashboard
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={askLogout} className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium cursor-pointer transition-colors">
                    <LuLogOut className="w-5 h-5" /> Logout
                  </motion.button>
                </>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCTA}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 border border-emerald-700 cursor-pointer">
                  Get Started
                </motion.button>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-zinc-900 transition-colors cursor-pointer" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? "auto" : 0 }}
          className="lg:hidden bg-black backdrop-blur-md border-t border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 space-y-4">
            {[
              { label: "Features", id: "features" },
              { label: "For Whom?", id: "who-is-it-for" },
              { label: "Testimonials", id: "testimonials" },
              { label: "FAQs", id: "faqs" }
            ].map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)}
                className="block text-zinc-400 hover:text-white font-medium w-full text-left py-2 cursor-pointer transition-colors">
                {item.label}
              </button>
            ))}
            {user ? (
              <button onClick={askLogout}
                className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium w-full text-left py-2 cursor-pointer transition-colors">
                <LuLogOut className="w-5 h-5" /> Logout
              </button>
            ) : null}
            <button onClick={handleCTA} className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg w-full mt-4 cursor-pointer border border-emerald-700">
              {user ? "Dashboard" : "Start Free Now"}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-28 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-6 py-2.5 mb-10 cursor-pointer"
              onClick={handleCTA}>
              <LuSparkles className="text-emerald-400" />
              <span className="text-zinc-200 font-medium text-sm">AI-Powered Career Transformation</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-white">
              Master Your Career with <span className="text-emerald-400">AI Intelligence</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.27 }}
              className="text-xl text-zinc-400 mb-14 max-w-2xl mx-auto leading-relaxed">
              From interview preparation to resume optimization, coding practice to email templates — your complete AI-powered career success platform.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.36 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={handleCTA}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-10 py-4 rounded-lg text-lg shadow-xl cursor-pointer border border-emerald-700 transition-all">
                Start Free Now
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("features")}
                className="border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900 text-white font-semibold px-10 py-4 rounded-lg text-lg transition-all cursor-pointer">
                See Features
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">Powerful <span className="text-emerald-400">AI Features</span></h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Four comprehensive modules designed to transform every aspect of your career journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, idx) => (<FeatureCard key={feature.id} feature={feature} index={idx} />))}
          </div>
        </div>
      </section>

      {/* NEW: Who Is This For? Section */}
      <section id="who-is-it-for" className="py-32 bg-black border-y border-zinc-800">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">Who Is This For?</h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Tailored tools and guidance for every stage of your professional journey.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {userGroups.map((group, idx) => (
              <motion.div key={group.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }} viewport={{ once: true }}
                className="flex flex-col items-center justify-center bg-black border border-zinc-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="mb-4">{group.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{group.title}</h3>
                <p className="text-zinc-400 text-base text-center">{group.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">Success <span className="text-emerald-400">Stories</span></h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Real professionals who transformed their careers with Career Companion AI
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-32 bg-black">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about Career Companion AI
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-5">
            {faqs.map((faq, idx) => (
              <FAQItem key={faq.id} faq={faq} index={idx} expandedFAQ={expandedFAQ} setExpandedFAQ={setExpandedFAQ} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <Modal isOpen={openAuthModal} onClose={() => { setOpenAuthModal(false); setCurrentPage("login"); }} hideHeader>
        {currentPage === "login"
          ? <LoginModal setCurrentPage={setCurrentPage} onClose={() => setOpenAuthModal(false)} />
          : <SignUpModal setCurrentPage={setCurrentPage} onClose={() => setOpenAuthModal(false)} />
        }
      </Modal>

      {logoutModal.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Confirm Logout</h3>
              <button onClick={closeLogoutModal}
                className="p-2 cursor-pointer text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors duration-300">
                <LuX className="w-6 h-6" />
              </button>
            </div>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </p>
            <div className="flex gap-4 justify-end">
              <button onClick={closeLogoutModal}
                className="cursor-pointer px-6 py-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-300 font-medium">
                Cancel
              </button>
              <button onClick={confirmLogout}
                className="px-6 py-3 cursor-pointer bg-red-700 hover:bg-red-800 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg">
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