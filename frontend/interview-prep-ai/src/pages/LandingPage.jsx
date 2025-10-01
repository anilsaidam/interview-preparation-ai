// src/pages/LandingPage.jsx
import React, { useContext, useState, memo, useMemo } from "react";
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
  LuGlobe
} from "react-icons/lu";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Modal from "../components/Modal";
import { UserContext } from "../context/userContext";
import Navbar from "../components/layouts/Navbar";
import { motion } from "framer-motion";

const FeatureCard = memo(({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="relative bg-white/5 border border-white/20 rounded-2xl p-8 h-full shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 overflow-hidden backdrop-blur-md">
      <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/10 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-700`} />
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-${feature.color}-400 via-${feature.color}-600 to-${feature.color}-400 shadow-lg`}>
            {feature.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 text-white tracking-tight drop-shadow-sm">{feature.title}</h3>
            <p className="text-gray-300 mb-5 leading-relaxed text-base font-medium">{feature.description}</p>
            <ul className="space-y-2 mb-7">
              {feature.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <div className={`mt-2 w-1.5 h-1.5 rounded-full bg-${feature.color}-400`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-400 hover:from-${feature.color}-400 hover:to-${feature.color}-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-250 shadow-lg focus:outline-none`}
            >
              {feature.cta}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));

const TestimonialCard = memo(({ testimonial, index }) => (
  <motion.div
    key={testimonial.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.12 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="bg-white/5 border border-white/15 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex space-x-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <LuStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-200 mb-6 leading-relaxed italic text-base">"{testimonial.text}"</p>
      <div className="border-t border-white/10 pt-4">
        <div className="font-bold text-white">{testimonial.author}</div>
        <div className="text-gray-400 text-sm">{testimonial.role}</div>
        <div className="text-emerald-400 font-medium text-sm">{testimonial.company}</div>
      </div>
    </div>
  </motion.div>
));

const FAQItem = memo(({ faq, index, expandedFAQ, setExpandedFAQ }) => (
  <motion.div
    key={faq.id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.06 }}
    viewport={{ once: true }}
    className="bg-white/5 border border-white/15 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
  >
    <button
      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors"
    >
      <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
      <motion.div
        animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0"
      >
        <LuArrowRight className="w-5 h-5 text-gray-400 transform rotate-90" />
      </motion.div>
    </button>
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: expandedFAQ === faq.id ? "auto" : 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="px-6 pb-4"><p className="text-gray-300 text-base leading-relaxed">{faq.answer}</p></div>
    </motion.div>
  </motion.div>
));

const Footer = () => (
  <footer className="relative z-30 bg-gradient-to-t from-black via-zinc-900/90 to-zinc-900/80 pt-16 pb-10 mt-6 border-t border-white/10">
    <div className="container mx-auto px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-12">
        <div className="mb-8 lg:mb-0 lg:w-1/3">
          <div className="flex items-center gap-3 mb-4">
            <LuSparkles className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text drop-shadow">Career Companion AI</span>
          </div>
          <p className="text-gray-400 text-base max-w-xs mb-6">Your all-in-one platform for interview prep, resume optimization, coding practice, and smart AI-powered career success. Clean, secure, and always free.</p>
          <div className="flex flex-row gap-4">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 text-gray-400">
              <LuGithub className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 text-gray-400">
              <LuLinkedin className="w-6 h-6" />
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 text-gray-400">
              <LuTwitter className="w-6 h-6" />
            </a>
            <a href="/" className="hover:text-purple-400 text-gray-400">
              <LuGlobe className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
              <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
              <li><a href="#faqs" className="hover:text-white">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Guides</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
              <li><a href="#" className="hover:text-white">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
              <li><a href="#" className="hover:text-white">Accessibility</a></li>
              <li><a href="#" className="hover:text-white">Sitemap</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
        <span className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Career Companion AI. All rights reserved.</span>
        <span className="text-gray-500 text-sm">Crafted with <span className="text-emerald-400">&hearts;</span> for career growth</span>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleCTA = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  };

  const features = useMemo(() => [
    {
      id: 1,
      icon: <LuMessageSquare className="w-12 h-12 text-emerald-200" />,
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
      icon: <LuFileText className="w-12 h-12 text-blue-300" />,
      title: "ATS Score Analyzer",
      description: "Optimize your resume for applicant tracking systems with comprehensive analysis.",
      bullets: [
        "Comprehensive ATS compatibility analysis",
        "Keyword optimization and missing skills detection",
        "Section-wise scoring with actionable recommendations",
        "Save and compare multiple resume versions"
      ],
      cta: "Analyze Resume",
      color: "blue"
    },
    {
      id: 3,
      icon: <LuCode className="w-12 h-12 text-purple-300" />,
      title: "Coding Practice Hub",
      description: "Master algorithms with AI-powered explanations and multi-language solutions.",
      bullets: [
        "Difficulty-based problem sets (Easy to Hard)",
        "Multi-language solutions (C, C++, Java, Python)",
        "Detailed complexity analysis and optimizations",
        "Progress tracking and streak counters"
      ],
      cta: "Start Coding",
      color: "purple"
    },
    {
      id: 4,
      icon: <LuMail className="w-12 h-12 text-orange-300" />,
      title: "Email Template Generator",
      description: "Generate professional, human-like emails for all your career needs.",
      bullets: [
        "Cold mail, referral, follow-up, and thank you templates",
        "Personalized based on role, experience, and job description",
        "AI-powered content that feels natural and professional",
        "Save and organize templates in your personal library"
      ],
      cta: "Generate Templates",
      color: "orange"
    }
  ], []);

  const testimonials = useMemo(() => [
    {
      id: 1,
      text: "Career Companion AI transformed my interview preparation completely. The AI-generated questions were incredibly realistic and helped me identify my weak areas. I landed my dream job at Microsoft within 3 weeks!",
      author: "Priya Sharma",
      role: "Senior Software Engineer",
      company: "Microsoft",
      rating: 5
    },
    {
      id: 2,
      text: "The ATS analyzer was a game-changer. My resume was getting zero responses, but after optimizing it with Career Companion AI, I started getting interview calls immediately. The keyword analysis is spot-on.",
      author: "Rahul Gupta",
      role: "Data Scientist",
      company: "Google",
      rating: 5
    },
    {
      id: 3,
      text: "As someone who struggled with coding interviews, the practice hub with AI explanations made all the difference. The multi-language solutions and complexity analysis helped me understand concepts deeply.",
      author: "Ananya Reddy",
      role: "Full Stack Developer",
      company: "Amazon",
      rating: 5
    }
  ], []);

  const faqs = useMemo(() => [
    {
      id: 1,
      question: "How does the AI generate personalized content?",
      answer: "Our AI analyzes your target role, years of experience, and focus topics to generate relevant questions and templates. It uses advanced language models trained on thousands of real scenarios across different companies and roles, ensuring content matches current industry standards."
    },
    {
      id: 2,
      question: "Is my data secure and private?",
      answer: "Absolutely. We use enterprise-grade security with end-to-end encryption. Your resume and personal data are never shared with third parties. All processing happens securely, and you can delete your data anytime from your account settings."
    },
    {
      id: 3,
      question: "How accurate is the ATS score analysis?",
      answer: "Our ATS analyzer is trained on real ATS systems used by Fortune 500 companies. It achieves 95% accuracy in predicting how well your resume will perform. We continuously update our algorithms based on the latest ATS technology and hiring trends."
    },
    {
      id: 4,
      question: "Can I practice coding in multiple programming languages?",
      answer: "Yes! Our coding practice hub supports C, C++, Java, and Python. Each problem comes with optimized solutions in all supported languages, along with detailed explanations of different approaches and complexity analysis."
    },
    {
      id: 5,
      question: "What types of email templates can I generate?",
      answer: "Our AI generates four types of professional emails: cold mails to recruiters, referral requests, follow-up messages, and thank you notes. Each template is personalized based on your role, experience level, and job description for maximum effectiveness."
    },
    {
      id: 6,
      question: "Is Career Companion AI completely free?",
      answer: "Yes! Career Companion AI is completely free to use. All features including interview preparation, ATS analysis, coding practice, and email template generation are available at no cost. We believe in making career advancement tools accessible to everyone."
    }
  ], []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-sans min-h-screen text-white bg-black relative">
      {/* Fancy Animated BG */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-white/10"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="font-bold text-lg lg:text-2xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-sm"
              whileHover={{ scale: 1.06 }}
            >
              Career Companion AI
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                { label: "Features", id: "features" },
                { label: "How it works", id: "how-it-works" },
                { label: "Testimonials", id: "testimonials" },
                { label: "FAQs", id: "faqs" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-300 hover:text-white font-medium relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 w-0 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCTA}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-semibold px-7 py-2 rounded-xl shadow-lg transition-all duration-300"
              >
                {user ? "Dashboard" : "Get Started"}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
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
            height: mobileMenuOpen ? "auto" : 0
          }}
          className="lg:hidden bg-black/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
        >
          <div className="px-6 py-4 space-y-4">
            {[
              { label: "Features", id: "features" },
              { label: "How it works", id: "how-it-works" },
              { label: "Testimonials", id: "testimonials" },
              { label: "FAQs", id: "faqs" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block text-gray-300 hover:text-white font-medium w-full text-left py-2"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleCTA}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl w-full mt-4"
            >
              {user ? "Dashboard" : "Get Started"}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-white/10 to-white/0 border border-white/10 rounded-full px-8 py-3 mb-8 backdrop-blur-md"
            >
              <LuSparkles className="text-emerald-400" />
              <span className="text-gray-100 font-medium">AI-Powered Career Transformation</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl lg:text-7xl font-extrabold mb-7 leading-tight tracking-tight bg-gradient-to-r from-white via-blue-100 to-emerald-200 bg-clip-text text-transparent"
            >
              Master Your Career with{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">AI Intelligence</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.27 }}
              className="text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              From interview preparation to resume optimization, coding practice to email templates — your complete AI-powered career success platform.
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
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-xl"
              >
                Start Free Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("how-it-works")}
                className="border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all"
              >
                See How It Works
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 bg-gradient-to-b from-white/2 to-transparent">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-5">
              Powerful <span className="text-blue-400">AI Features</span> for Career Success
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Four comprehensive modules designed to transform every aspect of your career journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.id} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 bg-gradient-to-b from-transparent to-white/2">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-5">
              How It <span className="text-purple-400">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Four simple steps to transform your career with AI-powered insights
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                id: 1,
                title: "Create Profile",
                description: "Set up your experience level and career goals",
                icon: <LuUsers className="text-emerald-400" />
              },
              {
                id: 2,
                title: "AI Analysis",
                description: "Our AI creates personalized learning paths",
                icon: <LuBrain className="text-blue-400" />
              },
              {
                id: 3,
                title: "Practice & Improve",
                description: "Engage with tailored content and challenges",
                icon: <LuTarget className="text-purple-400" />
              },
              {
                id: 4,
                title: "Track Progress",
                description: "Monitor improvement with detailed analytics",
                icon: <LuTrendingUp className="text-orange-400" />
              }
            ].map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.17 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl flex items-center justify-center mx-auto text-3xl group-hover:scale-110 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-emerald-400 transition-colors">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-base">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 bg-gradient-to-b from-white/2 to-transparent">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-5">Success <span className="text-emerald-400">Stories</span></h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">Real professionals who transformed their careers with Career Companion AI</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-relaxed">
              Ready to <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Transform</span> Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Join thousands of professionals who have successfully advanced their careers with AI-powered tools.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCTA}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-bold px-14 py-4 rounded-xl text-xl shadow-2xl"
            >
              Start Your Journey Today
            </motion.button>
            <p className="text-gray-400 mt-4 text-sm">100% Free • No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-28 bg-gradient-to-b from-transparent to-white/2">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-6">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about Career Companion AI
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <FAQItem key={faq.id} faq={faq} index={idx} expandedFAQ={expandedFAQ} setExpandedFAQ={setExpandedFAQ} />
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
          <Login setCurrentPage={setCurrentPage} onClose={() => setOpenAuthModal(false)} />
        ) : (
          <SignUp setCurrentPage={setCurrentPage} onClose={() => setOpenAuthModal(false)} />
        )}
      </Modal>
    </div>
  );
};

export default LandingPage;
