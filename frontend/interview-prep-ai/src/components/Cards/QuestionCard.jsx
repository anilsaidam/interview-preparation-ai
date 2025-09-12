import React from 'react';
import { useState } from 'react';
import { LuChevronDown, LuPin, LuPinOff, LuSparkles } from 'react-icons/lu';
import AIResponsePreview from '../../pages/InterviewPrep/components/AIResponsePreview';

const QuestionCard = ({
    question,
    answer,
    onLearnMore,
    isPinned,
    onTogglePin,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className='bg-white rounded-lg mb-4 overflow-hidden py-4 px-5 shadow-xl shadow-gray-100/70 border border-gray-100/60 group'>
            {/* Header: Use flex to distribute items and allow wrapping on small screens */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                {/* Question Section */}
                <div className='flex items-start gap-3.5 flex-grow cursor-pointer' onClick={toggleExpand}>
                    <span className='flex-shrink-0 text-xs md:text-[15px] font-semibold text-gray-400 leading-[18px]'>
                        Q
                    </span>
                    <h3 className='flex-grow text-xs md:text-[14px] font-medium text-gray-800'>
                        {question}
                    </h3>
                </div>

                {/* Action Buttons Section */}
                <div className='flex items-center justify-end md:justify-start gap-2 ml-auto'>
                    <button
                        className={`flex items-center gap-2 text-xs text-indigo-800 font-medium bg-indigo-50 px-3 py-1 rounded text-nowrap border border-indigo-50 hover:border-indigo-200 cursor-pointer ${isExpanded ? "flex" : "hidden md:flex group-hover:flex"}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin();
                        }}
                    >
                        {isPinned ? <LuPinOff className='text-xs' /> : <LuPin className='text-xs' />}
                    </button>

                    <button
                        className={`flex items-center gap-2 text-xs text-cyan-800 font-medium bg-cyan-50 px-3 py-1 rounded text-nowrap border border-cyan-50 hover:border-cyan-200 cursor-pointer ${isExpanded ? "flex" : "hidden md:flex group-hover:flex"}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onLearnMore();
                        }}
                    >
                        <LuSparkles />
                        <span className='hidden md:block'>Learn More</span>
                    </button>

                    <button
                        className='text-gray-400 hover:text-gray-500 cursor-pointer'
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand();
                        }}
                    >
                        <LuChevronDown
                            size={20}
                            className={`transform transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Answer Content - Using a grid for height transition */}
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out mt-4 ${
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className='overflow-hidden'>
                    <div className='text-gray-700 bg-gray-50 px-5 py-3 rounded-lg'>
                        <AIResponsePreview content={answer} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;