import React from "react";
import { LuX } from "react-icons/lu";

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  hideHeader = false, 
  title = "", 
  maxWidth = "max-w-4xl" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-zinc-900 border border-zinc-700 rounded-2xl ${maxWidth} w-full max-h-[95vh] overflow-hidden shadow-2xl`}>
        {!hideHeader && (
          <div className="flex items-center justify-between p-6 border-b border-zinc-700">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-xl transition-colors duration-300"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;