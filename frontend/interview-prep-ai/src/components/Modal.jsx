import React from "react";

const Modal = ({ children, isOpen, onClose, title, hideHeader }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40">
      {/* Modal Content */}
      <div className="relative flex flex-col bg-white dark:bg-zinc-900 shadow-lg rounded-lg overflow-hidden max-w-md w-full">
        

        {/* Optional header */}
        {!hideHeader && title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
            <h3 className="md:text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
