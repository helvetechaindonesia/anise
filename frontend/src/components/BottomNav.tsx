import React from 'react';
import { House, BookOpen, Trophy, User, Scan } from '@phosphor-icons/react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startPresensi?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, startPresensi }) => {
  const renderTab = (tab: { id: string; icon: any; label: string }) => {
    const isActive = activeTab === tab.id;
    return (
      <button 
        key={tab.id}
        onClick={() => setActiveTab(tab.id as any)}
        className={`flex items-center justify-center h-[40px] rounded-full transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
          isActive 
            ? 'bg-white text-[#19414d] px-3.5 shadow-md' 
            : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10 w-[40px]'
        }`}
      >
        <tab.icon className="w-5 h-5 shrink-0" weight={isActive ? 'duotone' : 'regular'} />
        <div className={`grid transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isActive ? 'grid-cols-[1fr] opacity-100 ml-2 translate-x-0' : 'grid-cols-[0fr] opacity-0 ml-0 -translate-x-2'
        }`}>
          <span className="overflow-hidden font-bold text-[12px] tracking-wide whitespace-nowrap">
            {tab.label}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="z-40 w-full shrink-0 relative">
      <nav className="bg-[#19414d]/90 backdrop-blur-2xl rounded-t-[20px] shadow-[0_-10px_30px_rgba(25,65,77,0.2)] border-t border-white/15 flex items-center justify-between px-4 pt-2 pb-[max(env(safe-area-inset-bottom),10px)]">
        
        {/* Left Tabs */}
        <div className="flex gap-1 sm:gap-2">
          {[
            { id: 'home', icon: House, label: 'Home' },
            { id: 'jurnal', icon: BookOpen, label: 'Jurnal' },
          ].map(renderTab)}
        </div>

        {/* Center Floating Action Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[14px]">
          <button 
            onClick={startPresensi}
            className="w-[48px] h-[48px] rounded-full bg-emerald-500 border-[3px] border-[#fcfbf7] shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-white hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          >
            <Scan className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" weight="bold" />
          </button>
        </div>

        {/* Right Tabs */}
        <div className="flex gap-1 sm:gap-2">
          {[
            { id: 'poin', icon: Trophy, label: 'Poin' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(renderTab)}
        </div>

      </nav>
    </div>
  );
};

export default BottomNav;
