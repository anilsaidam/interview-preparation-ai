// components/Cards/ProfileInfoCard.jsx
import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";

export const getAvatarUrl = (user) => {
  if (user?.profileImageUrl) return user.profileImageUrl;
  const name = user?.name?.trim() || "U";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0D8ABC&color=fff`;
};

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/");
  };

  if (!user) return null;

  const avatar = getAvatarUrl(user);

  return (
    <div className="flex items-center">
      <img
        src={avatar}
        alt="avatar"
        className="w-11 h-11 rounded-full mr-3 border border-gray-200 dark:border-zinc-700 object-cover"
      />
      <div>
        <div className="text-[15px] text-black dark:text-white font-semibold leading-4">
          {user.name || "User"}
        </div>
        <button
          className="text-teal-600 dark:text-teal-400 text-xs font-medium cursor-pointer hover:underline"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
