import React, { useRef, useState } from 'react';
import { LuUser, LuUpload, LuTrash, LuCamera } from "react-icons/lu";

const ProfilePhotoSelecter = ({ image, setImage, preview, setPreview }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);

      const previewPath = URL.createObjectURL(file);
      if (setPreview) {
        setPreview(previewPath);
      }
      setPreviewUrl(previewPath);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);

    if (setPreview) {
      setPreview(null);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex justify-center">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <div className="w-20 h-20 flex items-center justify-center bg-white/5 border-2 border-white/20 rounded-full relative cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all duration-300 group">
          <LuUser className="text-3xl text-white/40 group-hover:text-white/60 transition-colors duration-300" />
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center bg-white text-black rounded-full absolute -bottom-0.5 -right-0.5 cursor-pointer hover:bg-white/90 transition-all duration-300 shadow-lg"
            onClick={onChooseFile}
          >
            <LuCamera className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={preview || previewUrl}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center bg-white text-black rounded-full cursor-pointer hover:bg-white/90 transition-all duration-300"
              onClick={onChooseFile}
            >
              <LuCamera className="w-3 h-3" />
            </button>
          </div>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full absolute -bottom-0.5 -right-0.5 cursor-pointer transition-all duration-300 shadow-lg"
            onClick={handleRemoveImage}
          >
            <LuTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelecter;
