import React from 'react';
import { Scan, Notebook, CheckSquareOffset, ClipboardText, WarningCircle, Sparkle, Trophy, BookBookmark, ChartLineUp } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';

interface QuickMenuProps {
  startPresensi: () => void;
  setActiveTab: (tab: string) => void;
}

const QuickMenu: React.FC<QuickMenuProps> = ({ startPresensi, setActiveTab }) => {
  const setShowAiChat = useAppStore((state) => state.setShowAiChat);
  const userProfile = useAppStore((state) => state.userProfile);
  const isGuru = userProfile?.role_type?.toLowerCase() === 'guru';

  return (
    <div className="!mt-8">
      <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-3">Layanan Cepat</h4>
      <div className="grid grid-cols-4 gap-y-6 gap-x-3">
        
        {/* ROW 1 */}
        <button 
          onClick={() => setActiveTab('presensi')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            <Scan className="w-6 h-6" weight="duotone" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">Presensi</span>
        </button>

        <button 
          onClick={() => setActiveTab('jurnal')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            <BookBookmark className="w-6 h-6" weight="duotone" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">
            {isGuru ? 'Jurnal Mengajar' : 'Jadwal'}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('daftar_tugas')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            <Notebook className="w-6 h-6" weight="duotone" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">Tugas</span>
        </button>

        <button 
          onClick={() => setActiveTab('pembiasaan')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            <CheckSquareOffset className="w-6 h-6" weight="duotone" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">Pembiasaan</span>
        </button>

        {/* ROW 2 */}
        <button 
          onClick={() => setActiveTab('poin')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            {isGuru ? <ChartLineUp className="w-6 h-6" weight="duotone" /> : <Trophy className="w-6 h-6" weight="duotone" />}
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">{isGuru ? 'KPI' : 'Poin & Prestasi'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('agenda_penilaian')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            <ClipboardText className="w-6 h-6" weight="duotone" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">Agenda Penilaian</span>
        </button>

        <button 
          onClick={() => setActiveTab('lapor_kesiswaan')}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all">
            <WarningCircle className="w-6 h-6" weight="duotone" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">Lapor Kesiswaan</span>
        </button>

        <button 
          onClick={() => setShowAiChat(true)}
          className="flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-[#19414d] flex items-center justify-center text-white shadow-lg shadow-[#19414d]/20 group-hover:scale-105 active:scale-95 transition-all relative">
            <Sparkle className="w-6 h-6" weight="duotone" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#fcfbf7] animate-pulse" />
          </div>
          <span className="text-[10px] font-bold mt-2.5 text-[#121212] tracking-tight leading-tight">Tanya Anise</span>
        </button>

      </div>
    </div>
  );
};

export default QuickMenu;
