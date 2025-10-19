import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuSparkles,
  LuMessageSquare,
  LuGraduationCap,
  LuStar,
  LuLogOut,
  LuX,
  LuArrowDown,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../context/userContext";
import {
  features,
  testimonials,
  faqs,
  userGroups,
  Footer,
} from "../utils/landingpageData";

const FeatureCard = ({ feature, index, user, navigate }) => {
  const handleFeatureClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(feature.route); // each feature should have its route defined in landingpageData.js
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <div className="relative bg-black border border-zinc-800 rounded-2xl p-8 h-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 p-3 rounded-xl shadow-lg border border-zinc-800 ${
                feature.color === "emerald"
                  ? "bg-emerald-950"
                  : feature.color === "blue"
                  ? "bg-blue-950"
                  : feature.color === "purple"
                  ? "bg-purple-950"
                  : "bg-orange-950"
              }`}
            >
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 text-white">
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
                      className={`mt-2 w-1.5 h-1.5 rounded-full ${
                        feature.color === "emerald"
                          ? "bg-emerald-500"
                          : feature.color === "blue"
                          ? "bg-blue-500"
                          : feature.color === "purple"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                      }`}
                    ></div>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFeatureClick}
                className={`${
                  feature.color === "emerald"
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : feature.color === "blue"
                    ? "bg-blue-700 hover:bg-blue-800"
                    : feature.color === "purple"
                    ? "bg-purple-700 hover:bg-purple-800"
                    : "bg-orange-700 hover:bg-orange-800"
                } text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-250 shadow-lg focus:outline-none cursor-pointer border border-zinc-800`}
              >
                {feature.cta}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
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

// ---------------- FAQ Component ----------------
const FAQItem = ({ faq, expandedFAQ, setExpandedFAQ }) => {
  const isOpen = expandedFAQ === faq.id;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-black border border-zinc-800 rounded-2xl overflow-hidden hover:bg-zinc-900/50 transition-all"
    >
      <button
        onClick={() => setExpandedFAQ(isOpen ? null : faq.id)}
        className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-900/30"
      >
        <span className="text-lg font-semibold text-white">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <LuArrowDown className="w-5 h-5 text-zinc-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-6 pb-5"
          >
            <p className="text-zinc-400 text-base">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LandingPage = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [logoutModal, setLogoutModal] = useState({ show: false });

  const handleCTA = () => {
    if (!user) navigate("/login");
    else navigate("/dashboard");
  };
  const askLogout = () => setLogoutModal({ show: true });
  const closeLogoutModal = () => setLogoutModal({ show: false });
  const confirmLogout = () => {
    clearUser();
    closeLogoutModal();
  };
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-inter min-h-screen text-zinc-100 bg-black relative">
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-black backdrop-blur-md border-b border-zinc-800"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="font-bold text-xl lg:text-2xl text-white cursor-pointer flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              onClick={() => window.scrollTo(0, 0)}
            >
              <img
                src="/career_logo.png"
                alt="Career Companion AI Logo"
                className="w-12 h-12 object-contain"
              />

              <span>Career Companion AI</span>
            </motion.div>

            <div className="hidden lg:flex items-center space-x-10">
              {[
                {
                  label: "Features",
                  id: "features",
                  icon: (
                    <LuMessageSquare className="inline-block mr-1 text-zinc-400" />
                  ),
                },

                {
                  label: "For Whom",
                  id: "who-is-it-for",
                  icon: (
                    <LuGraduationCap className="inline-block mr-1 text-zinc-400" />
                  ),
                },

                {
                  label: "Testimonials",
                  id: "testimonials",
                  icon: <LuStar className="inline-block mr-1 text-zinc-400" />,
                },

                {
                  label: "FAQs",
                  id: "faqs",
                  icon: <LuX className="inline-block mr-1 text-zinc-400" />,
                },
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
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 border border-emerald-700 cursor-pointer"
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
                  onClick={() => navigate("/login")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 border border-emerald-700 cursor-pointer"
                >
                  Get Started
                </motion.button>
              )}
            </div>

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

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: mobileMenuOpen ? 1 : 0,
            height: mobileMenuOpen ? "auto" : 0,
          }}
          className="lg:hidden bg-black backdrop-blur-md border-t border-zinc-800 overflow-hidden"
        >
          <div className="px-6 py-4 space-y-4">
            {[
              { label: "Features", id: "features" },

              { label: "For Whom?", id: "who-is-it-for" },

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

            {user && (
              <button
                onClick={askLogout}
                className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium w-full text-left py-2 cursor-pointer transition-colors"
              >
                <LuLogOut className="w-5 h-5" /> Logout
              </button>
            )}

            <button
              onClick={handleCTA}
              className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg w-full mt-4 cursor-pointer border border-emerald-700"
            >
              {user ? "Dashboard" : "Start Free Now"}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-28 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-6 py-2.5 mb-10 cursor-pointer"
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
              <span className="text-emerald-400">AI Intelligence</span>
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
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-10 py-4 rounded-lg text-lg shadow-xl cursor-pointer border border-emerald-700 transition-all"
              >
                Start Free Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("features")}
                className="border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900 text-white font-semibold px-10 py-4 rounded-lg text-lg transition-all cursor-pointer"
              >
                See Features
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section*/}
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
              Powerful <span className="text-emerald-400">AI Features</span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Four comprehensive modules designed to transform every aspect of
              your career journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={idx}
                user={user}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for section */}

      <section
        id="who-is-it-for"
        className="py-32 bg-black border-y border-zinc-800"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">
              Who Is This For?
            </h2>

            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Tailored tools and guidance for every stage of your professional
              journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {userGroups.map((group, idx) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center bg-black border border-zinc-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-4">{group.icon}</div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {group.title}
                </h3>

                <p className="text-zinc-400 text-base text-center">
                  {group.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}

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
              Success <span className="text-emerald-400">Stories</span>
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

      {/* ---------------- FAQ Section ---------------- */}
      <section id="faqs" className="py-32 bg-black border-t border-zinc-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-white">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about Career Companion AI.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-5">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                expandedFAQ={expandedFAQ}
                setExpandedFAQ={setExpandedFAQ}
              />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
