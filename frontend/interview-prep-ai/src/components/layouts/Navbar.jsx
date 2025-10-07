// components/Navbar/Navbar.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

// Fallback avatar generator: uses first letter of user name if no profile image.
const baseAvatar = (u) => {
  const name = u?.name?.trim() || "U";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0D8ABC&color=fff`;
};

// Build avatar URL with cache-busting so updates reflect instantly
const getAvatarUrl = (u, cacheBust) => {
  if (u?.profileImageUrl) {
    const sep = u.profileImageUrl.includes("?") ? "&" : "?";
    return `${u.profileImageUrl}${sep}v=${cacheBust}`;
  }
  return baseAvatar(u);
};

const Navbar = () => {
  const { user, updateUser, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Restore user on refresh (prevents logout on reload if token is valid)
  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        if (!user) {
          const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
          const freshUser = res?.data?.user || res?.data;
          if (mounted && freshUser) updateUser(freshUser);
        }
      } catch {
        // Silently ignore; auth layer handles redirects if needed
      }
    };
    restore();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cache-buster for avatar refresh after upload/remove
  const [cacheBust, setCacheBust] = useState(() => Date.now());

  // Navbar state
  const avatarUrl = useMemo(
    () => getAvatarUrl(user || {}, cacheBust),
    [user, cacheBust]
  );
  const displayName = user?.name || "User";

  // Profile image change modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Profile dropdown (username with Logout)
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Mobile nav (hamburger -> vertical list)
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef(null);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const onChooseFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5MB)");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const closeModal = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview("");
    setOpenModal(false);
  };

  // Upload new image, then refresh profile
  const onSaveImage = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axiosInstance.post(
        API_PATHS.IMAGE.UPLOAD_IMAGE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Use the user data returned from the upload API
      const freshUser = response.data?.user;
      if (freshUser) {
        updateUser(freshUser);
        setCacheBust(Date.now());
        toast.success(response.data?.message || "Profile picture updated");
      } else {
        // Fallback: fetch profile if user data not returned
        const profileRes = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        const fallbackUser = profileRes?.data?.user || profileRes?.data;
        if (fallbackUser) {
          updateUser(fallbackUser);
          setCacheBust(Date.now());
        }
        toast.success("Image uploaded");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove current image (server should handle remove flag)
  const onRemoveImage = async () => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("remove", "true");
      const response = await axiosInstance.post(
        API_PATHS.IMAGE.UPLOAD_IMAGE,
        formData
      );

      // Use the user data returned from the remove API
      const freshUser = response.data?.user;
      if (freshUser) {
        updateUser(freshUser);
        setCacheBust(Date.now());
        toast.success(response.data?.message || "Profile picture removed");
      } else {
        // Fallback: fetch profile if user data not returned
        const profileRes = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        const fallbackUser = profileRes?.data?.user || profileRes?.data;
        updateUser(fallbackUser || { ...(user || {}), profileImageUrl: "" });
        setCacheBust(Date.now());
        toast.success("Profile picture removed");
      }
      // Do not close modal automatically; user might want to choose new file after removing
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to remove profile picture"
      );
    } finally {
      setUploading(false);
    }
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      localStorage.clear();
      clearUser?.();
    } finally {
      navigate("/");
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [profileOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [mobileOpen]);

  return (
    <>
      <div className="h-16 bg-black border-b border-white/10 py-2.5 px-3 sm:px-4 md:px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-white/10 text-white"
              aria-label="Open Menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white sm:w-[22px] sm:h-[22px]"
              >
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <Link to="/" className="group">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-5 transition-colors duration-300 hover:text-emerald-400">
                <span className="hidden sm:inline">Career Companion AI</span>
                <span className="sm:hidden">Career AI</span>
              </h2>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
            <Link
              to="/dashboard"
              className="text-white/85 hover:text-white transition-colors duration-300 font-medium relative group text-sm lg:text-base"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/interview-prep/new"
              className="text-white/85 hover:text-white transition-colors duration-300 font-medium relative group text-sm lg:text-base"
            >
              <span className="hidden lg:inline">Interview Prep</span>
              <span className="lg:hidden">Interview</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/ats-score"
              className="text-white/85 hover:text-white transition-colors duration-300 font-medium relative group text-sm lg:text-base"
            >
              <span className="hidden lg:inline">ATS Checker</span>
              <span className="lg:hidden">ATS</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/coding"
              className="text-white/85 hover:text-white transition-colors duration-300 font-medium relative group text-sm lg:text-base"
            >
              Coding
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/templates"
              className="text-white/85 hover:text-white transition-colors duration-300 font-medium relative group text-sm lg:text-base"
            >
              Templates
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* Right: Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className="flex items-center gap-2 sm:gap-3 rounded-xl px-1 sm:px-2 py-1 hover:bg-white/10 transition-colors"
              title="Profile"
            >
              <img
                key={avatarUrl} // re-mount on cache-bust change to reflect new image
                src={avatarUrl}
                alt="avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/20 object-cover"
              />
              <span className="hidden sm:block text-white font-semibold text-sm lg:text-base truncate max-w-20 lg:max-w-none">
                {displayName}
              </span>
              <svg
                className="hidden sm:block w-3 h-3 sm:w-4 sm:h-4 text-white/80 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                  <div className="text-white font-semibold truncate">
                    {displayName}
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setOpenModal(true);
                    }}
                    className="mt-2 w-full text-left text-sm text-white/85 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    Change photo
                  </button>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full text-left text-sm text-red-300 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile slide-out menu */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] flex">
            <div
              className="flex-1 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div
              ref={mobileRef}
              className="w-64 sm:w-72 max-w-[85%] sm:max-w-[80%] h-full bg-zinc-900 border-l border-gray-700 shadow-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-base sm:text-lg">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/dashboard"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Dashboard
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/interview"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Interview Prep
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/ats-checker"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  ATS Checker
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/coding"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Coding Practice
                </Link>
                <Link
                  onClick={() => setMobileOpen(false)}
                  to="/resources"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Resources
                </Link>
              </nav>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    key={`m-${avatarUrl}`}
                    src={avatarUrl}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border border-white/20 object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setOpenModal(true);
                  }}
                  className="w-full text-left text-sm text-white/85 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >
                  Change photo
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="mt-2 w-full text-left text-sm text-red-300 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile image change modal */}
      {openModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-[90%] max-w-md bg-zinc-900 border border-gray-700 rounded-2xl p-6 z-[71]">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">
                Update Profile Picture
              </h3>
              <p className="text-gray-400 text-sm">
                Choose a clear, square image for best results (max 5MB).
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={preview || avatarUrl}
                  alt="preview"
                  className="w-20 h-20 rounded-full object-cover border border-gray-700"
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={onChooseFile}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                    disabled={uploading}
                  >
                    Choose Image
                  </button>
                  <button
                    onClick={onRemoveImage}
                    className="px-4 py-2 border border-red-500/40 text-red-300 rounded-xl hover:bg-red-500/10 transition-colors"
                    disabled={uploading || !user?.profileImageUrl}
                    title={
                      user?.profileImageUrl
                        ? "Remove current photo"
                        : "No photo to remove"
                    }
                  >
                    Remove
                  </button>
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={onSaveImage}
                className="px-5 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-[90%] max-w-sm bg-zinc-900 border border-gray-700 rounded-2xl p-6 z-[81]">
            <h3 className="text-lg font-bold text-white mb-2">Logout</h3>
            <p className="text-gray-300 mb-5">Are you sure want to log out?</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmLogout}
                className="px-5 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
