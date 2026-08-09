import React from 'react';
import { Bell } from '@phosphor-icons/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fcfbf7]/80 backdrop-blur-md text-[#19414d] px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/assets/logo-smk.png" alt="Logo SMK N 1 Sragi" className="w-9 h-9 object-contain shrink-0" />
        <div className="flex flex-col">
          <h1 className="text-[15px] font-extrabold tracking-tight leading-none">SMK N 1 Sragi</h1>
          <span className="text-[9px] font-medium text-[#6b6375] mt-0.5">Anise by Helvetecha</span>
        </div>
      </div>
      <div className="flex items-center relative shrink-0">
        <button 
          onClick={() => setActiveTab('notifikasi')}
          className="relative p-1.5 transition-all text-[#19414d] hover:opacity-80 cursor-pointer"
        >
          <Bell className="w-5 h-5" weight={activeTab === 'notifikasi' ? 'duotone' : 'regular'} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>
      </div>

      {/* 75% Bottom Border */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-px bg-black/20"></div>
    </header>
  );
};

export default Header;
