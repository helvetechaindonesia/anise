import React from 'react';
import { House, BookOpen, Trophy, User, Scan, ChartLineUp } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startPresensi?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, startPresensi }) => {
  const userProfile = useAppStore(state => state.userProfile);
  const isGuru = userProfile?.role_type?.toLowerCase() === 'guru';

  const renderTab = (tab: { id: string; icon: any; label: string }) => {
    const isActive = activeTab === tab.id;
    return (
      <button 
        key={tab.id}
        onClick={() => setActiveTab(tab.id as any)}
        className="flex flex-col items-center justify-center w-full h-full cursor-pointer group"
      >
        <tab.icon 
          className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} 
          weight={isActive ? 'fill' : 'regular'} 
        />
        <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <div className="z-40 w-full shrink-0 relative">
      <nav className="bg-[#19414d]/90 backdrop-blur-2xl rounded-t-[20px] shadow-[0_-10px_30px_rgba(25,65,77,0.2)] border-t border-white/15 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),10px)] h-[70px]">
        
        {/* Grid of 5 columns */}
        <div className="grid grid-cols-5 h-full items-center">
          {renderTab({ id: 'home', icon: House, label: 'Home' })}
          {renderTab({ id: 'jurnal', icon: BookOpen, label: 'Jadwal' })}
          
          {/* Empty space for center button */}
          <div className="flex justify-center items-center pointer-events-none" />

          {isGuru 
            ? renderTab({ id: 'poin', icon: ChartLineUp, label: 'KPI' })
            : renderTab({ id: 'poin', icon: Trophy, label: 'Poin' })
          }
          {renderTab({ id: 'profile', icon: User, label: 'Profile' })}
        </div>

        {/* Center Floating Action Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[24px]">
          <button 
            onClick={startPresensi}
            className="w-[56px] h-[56px] rounded-full bg-emerald-500 border-[4px] border-[#fcfbf7] shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <Scan className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" weight="bold" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
