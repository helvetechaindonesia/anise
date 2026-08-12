import React from 'react';
import { QrCode } from '@phosphor-icons/react';

import type { User } from '../types/User';

interface DigitalCardProps {
  hasPresensiToday: boolean;
  role: string;
  setActiveTab: (tab: string) => void;
  userProfile?: User | null;
}

const DigitalCard: React.FC<DigitalCardProps> = ({ hasPresensiToday, role, setActiveTab, userProfile }) => {
  return (
    <div 
      onClick={() => setActiveTab('profile')}
      className="relative rounded-2xl bg-gradient-to-br from-[#19414d] via-[#215362] to-[#122e36] text-white p-4 sm:p-5 shadow-2xl overflow-hidden border-t border-white/20 border-l-white/20 border-b-black/40 border-r-black/40 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center w-full aspect-[1.58] animate-float3d animate-shimmer"
    >
      {/* Intense Smooth Glossy Lamination Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/10 to-transparent opacity-90 pointer-events-none z-0 mix-blend-overlay"></div>
      <div className="absolute -top-[60%] -left-[20%] w-[180%] h-[150%] bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.1)_40%,transparent_70%)] pointer-events-none z-0 blur-[30px] -rotate-12"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none z-0 mix-blend-soft-light"></div>

      {/* Group Container for Center Alignment */}
      <div className="flex items-center justify-center gap-4 sm:gap-5 w-full h-full z-10 px-2 sm:px-4">
        {/* Left Side: Photo Frame (Fluid Responsive) */}
        <div className="w-[38%] max-w-[140px] aspect-[3/4] bg-white/10 rounded-xl border-2 border-white/40 overflow-hidden flex flex-col justify-end shrink-0 relative shadow-xl z-20">
          <img 
            src={userProfile?.avatar_url || "/assets/budi.png"} 
            alt={userProfile?.full_name || "Pelajar"} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Status Banner */}
          <div className={`w-full py-1.5 text-[10px] sm:text-[11px] font-black text-center text-white z-10 ${hasPresensiToday ? 'bg-[#00c853]' : 'bg-[#ff2a5f]'}`}>
            {hasPresensiToday ? 'HADIR' : 'ABSEN'}
          </div>
        </div>

        {/* Right Side: Details & Identity */}
        <div className="flex-1 flex flex-col justify-center py-2 z-10 relative @container overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <img src="/assets/logo-smk.png" alt="Logo SMK N 1 Sragi" className="w-[4cqw] min-w-[12px] max-w-[20px] object-contain shrink-0" />
            <span className="text-[clamp(8px,4.5cqw,12px)] font-bold tracking-wide text-white whitespace-nowrap">SMK N 1 Sragi</span>
          </div>

          <h2 className="text-[clamp(10px,6.3cqw,16px)] font-black text-white tracking-wide uppercase leading-tight mb-2 sm:mb-2.5 [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),-1px_-1px_1px_rgba(255,255,255,0.4)] whitespace-nowrap">
            {userProfile?.role_type?.toLowerCase() === 'guru' ? 'KARTU PENGAJAR DIGITAL' : 'KARTU PELAJAR DIGITAL'}
          </h2>

          <div className="w-[90%] h-[1.5px] bg-black/50 border-b border-white/60 mb-2.5 sm:mb-3"></div>

          <div className="space-y-1.5 sm:space-y-2 text-[clamp(9px,5cqw,12px)] [text-shadow:1px_1px_1px_rgba(0,0,0,0.7),-1px_-1px_1px_rgba(255,255,255,0.3)]">
            <div className="flex items-center">
              <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">Nama</span>
              <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
              <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.full_name || '-'}</span>
            </div>
            
            {userProfile?.role_type?.toLowerCase() === 'guru' ? (
              <>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">NIP/NUP</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.nip_nuptk || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">Mapel</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.subjects || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">Walas</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.homeroom_class || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">Tugas</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 capitalize whitespace-nowrap truncate">{userProfile?.structural_roles || '-'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">NISN</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.nisn || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">NIS</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.nis || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">Kelas</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 whitespace-nowrap truncate">{userProfile?.class_name || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[20cqw] max-w-[45px] font-bold text-white shrink-0">Role</span>
                  <span className="w-[3cqw] max-w-[8px] text-white font-bold shrink-0">:</span>
                  <span className="font-semibold text-white flex-1 capitalize whitespace-nowrap truncate">{userProfile?.role_type || role}</span>
                </div>
              </>
            )}
          </div>

        </div>

        {/* bottom right icon */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-0">
          <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-white/20" weight="duotone" />
        </div>
      </div>
    </div>
  );
};

export default DigitalCard;
