import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = () => {
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
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-black border-r border-white/10 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Welcome Back</h1>
          <p className="text-xl text-white/70 leading-relaxed">
            Access your dashboard and continue your journey with our platform. 
            Sign in to unlock all features and manage your account.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          </div>

          {/* Close Button */}
          <button
            type="button"
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors duration-300"
            onClick={() => navigate("/")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-white/60">Enter your credentials to access your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-4 bg-black border-2 border-white/20 text-white placeholder-white/40 rounded-lg focus:border-white focus:outline-none transition-all duration-300"
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
                  className="w-full px-4 py-4 bg-black border-2 border-white/20 text-white placeholder-white/40 rounded-lg focus:border-white focus:outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 px-6 rounded-lg hover:bg-white/90 focus:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'SIGN IN'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/60">New to our platform?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="w-full border-2 border-white text-white font-bold py-4 px-6 rounded-lg hover:bg-white hover:text-black focus:bg-white focus:text-black transition-all duration-300"
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
