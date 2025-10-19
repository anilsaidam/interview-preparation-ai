import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePhotoSelecter from "../../components/Inputs/ProfilePhotoSelecter";
import { validateEmail } from "../../utils/helper";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { LuX } from "react-icons/lu";

const SignUp = ({ onClose }) => {
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
          className="absolute cursor-pointer top-4 right-4 text-white/80 hover:text-white transition-colors duration-300 z-50 bg-black/30 hover:bg-black/50 rounded-full p-2"
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
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Join Our Platform
          </h1>
        </div>
        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="flex justify-center mb-4">
            <ProfilePhotoSelecter image={profilePic} setImage={setProfilePic} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-black border-2 border-white/20 text-white placeholder-white/40 rounded-lg focus:border-white transition"
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
              placeholder="Create a strong password"
              className="w-full px-4 py-3 bg-black border-2 border-white/20 text-white placeholder-white/40 rounded-lg focus:border-white transition"
              required
            />
            <p className="text-white/40 text-xs mt-1">
              Minimum 8 characters required
            </p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>
          <div className="text-center mt-4 text-white/60">
            <p>Already have an account?</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-2 cursor-pointer w-full border-2 border-white text-white py-3 rounded-lg hover:bg-white hover:text-black transition"
            >
              SIGN IN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
