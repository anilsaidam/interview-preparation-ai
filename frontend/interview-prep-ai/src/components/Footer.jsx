import React from "react";
import { Link } from "react-router-dom";
import { LuGithub, LuLinkedin, LuTwitter } from "react-icons/lu";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-zinc-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            Interview Prep AI
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="#" className="hover:text-gray-900 dark:hover:text-white">
            Privacy
          </Link>
          <Link to="#" className="hover:text-gray-9 00 dark:hover:text-white">
            Terms
          </Link>
          <Link to="#" className="hover:text-gray-900 dark:hover:text-white">
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-200">
          <a
            href="#"
            aria-label="GitHub"
            className="hover:text-black dark:hover:text-white"
          >
            <LuGithub />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="hover:text-black dark:hover:text-white"
          >
            <LuLinkedin />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="hover:text-black dark:hover:text-white"
          >
            <LuTwitter />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
