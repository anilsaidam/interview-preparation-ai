// Login.jsx

import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { LuX } from "react-icons/lu";

// Add onClose prop to Login component
const Login = ({ onClose, setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter the password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-md relative">
        {/* Close Button */}
        <button
          type="button"
          className="absolute cursor-pointer top-4 right-4 text-white/80 hover:text-white transition-colors duration-300 z-50 bg-black/30 hover:bg-black/50 rounded-full p-2 backdrop-blur-sm"
          onClick={onClose} // Use the onClose prop to close the modal
        >
          <LuX className="w-6 h-6" />
        </button>

        <div className="lg:hidden text-center mb-8 pt-12">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome Back
          </h1>
        </div>
        <div className="mb-6 lg:mb-10">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
            Sign In
          </h2>
          <p className="text-white/60 text-sm lg:text-base">
            Enter your credentials to access your account
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5 lg:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-black border-2 border-white/20 text-white placeholder-white/40 rounded-lg focus:border-white transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-black border-2 border-white/20 text-white placeholder-white/40 rounded-lg focus:border-white transition"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "SIGN IN"}
          </button>

          <div className="text-center mt-4 text-white/60">
            <p>New to our platform?</p>
            <button
              onClick={() => setCurrentPage("signup")}
              type="button"
              className="mt-2 w-full border-2 border-white text-white py-3 rounded-lg hover:bg-white hover:text-black transition"
            >
              CREATE ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
