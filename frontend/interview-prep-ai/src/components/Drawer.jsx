import React from 'react'
import {LuX} from "react-icons/lu";

const Drawer = ({isOpen, onClose, title, children}) => {
  return (
    <div className={`fixed top-[64px] right-0 z-40 h-[calc(100dvh-64px)] p-4 overflow-y-auto transition-transform bg-black w-full md:w-[40vw] shadow-2xl shadow-cyan-800/10 border-r border-l-gray-800 ${
            isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        tabIndex="-1"
        aria-labelledby='drawer-right-label'
    >
        

        {/* Body Content */}
        <div className='text-sm mx-3 mb-6'>{children}</div>

    </div>
  )
}

export default Drawer
