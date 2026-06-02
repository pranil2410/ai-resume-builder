import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-[#070709] border-t border-zinc-850/80 py-6 px-6 text-center select-none shrink-0 w-full">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div>
          <span className="font-semibold text-zinc-400">© 2026 AI Resume & CV Builder.</span> All Rights Reserved.
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 font-mono text-[11px]">
          <div>
            <span className="text-zinc-600">Team Leader:</span>{" "}
            <span className="text-violet-400 font-semibold">Yatharth Hemani</span>
          </div>
          <span className="hidden sm:inline text-zinc-800">|</span>
          <div>
            <span className="text-zinc-600">Team Members:</span>{" "}
            <span className="text-zinc-400 font-medium">Pranil Belge</span>
            <span className="text-zinc-700 mx-1.5">•</span>
            <span className="text-zinc-400 font-medium">Abhishek Yadgire</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
