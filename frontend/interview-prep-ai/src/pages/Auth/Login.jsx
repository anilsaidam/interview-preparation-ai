import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { LuX } from "react-icons/lu";

const Login = ({ onClose }) => {
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
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="max-w-md w-full p-6 bg-black rounded-xl shadow-lg relative">
        <button
          type="button"
          className=" cursor-pointer absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300 z-50 bg-black/30 hover:bg-black/50 rounded-full p-2"
          onClick={() => {
            if (onClose) onClose();
            else navigate("/"); // fallback navigate to homepage if onClose not provided
          }}
        >
          <LuX className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
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
        <form onSubmit={handleLogin} className="space-y-5">
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
            className="w-full cursor-pointer bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "SIGN IN"}
          </button>
          <div className="text-center mt-4 text-white/60">
            <p>New to our platform?</p>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-2 cursor-pointer w-full border-2 border-white text-white py-3 rounded-lg hover:bg-white hover:text-black transition"
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
