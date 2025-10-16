import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePhotoSelecter from "../Inputs/ProfilePhotoSelecter";
import { validateEmail } from "../../utils/helper";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { LuX } from "react-icons/lu";

const SignUpModal = ({ setCurrentPage, onClose }) => {
  const [profilePic, setProfilePic] = useState();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    let profileImageUrl = "";

    if (!fullName) {
      setError("Please enter the full name.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter the password");
      setLoading(false);
      return;
    }

    try {
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        onClose();
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
    <div className="p-8 max-w-md mx-auto relative">
      {/* Close Button */}
      <button
        type="button"
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300 z-50 bg-black/30 hover:bg-black/50 rounded-full p-2 backdrop-blur-sm"
        onClick={onClose}
      >
        <LuX className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 616 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Join Our Platform</h2>
        <p className="text-white/60">Create your account to get started</p>
      </div>

      {/* SignUp Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Profile Photo */}
        <div className="flex justify-center mb-4">
          <ProfilePhotoSelecter image={profilePic} setImage={setProfilePic} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-600 text-white placeholder-white/40 rounded-lg focus:border-white focus:outline-none transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-600 text-white placeholder-white/40 rounded-lg focus:border-white focus:outline-none transition-all duration-300"
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
              placeholder="Create a strong password"
              className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-600 text-white placeholder-white/40 rounded-lg focus:border-white focus:outline-none transition-all duration-300"
              required
            />
            <p className="text-white/40 text-xs mt-1">Minimum 8 characters required</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-white/90 focus:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            'CREATE ACCOUNT'
          )}
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-zinc-900 text-white/60">Already have an account?</span>
          </div>
        </div>

        {/* Sign In Link */}
        <button
          type="button"
          onClick={() => setCurrentPage("login")}
          className="w-full border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-black focus:bg-white focus:text-black transition-all duration-300"
        >
          SIGN IN
        </button>
      </form>
    </div>
  );
};

export default SignUpModal;