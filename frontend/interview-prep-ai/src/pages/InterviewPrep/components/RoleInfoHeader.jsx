import React from 'react';

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return (
    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-sm p-6 min-h-[220px] flex flex-col justify-between">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{role}</h1>
        <p className="text-sm text-gray-600 mt-2">{topicsToFocus}</p>
      </div>

      <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-white bg-black px-3 py-1 rounded-full whitespace-nowrap">
            Experience: {experience} {experience == 1 ? "Year" : "Years"}
          </div>
          <div className="text-xs font-semibold text-white bg-black px-3 py-1 rounded-full whitespace-nowrap">
            {questions} Q&A
          </div>
          <div className="text-xs font-semibold text-white bg-black px-3 py-1 rounded-full whitespace-nowrap">
            Last Updated: {lastUpdated}
          </div>
      </div>
      
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};

export default RoleInfoHeader;
