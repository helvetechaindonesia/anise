import React from 'react';
import { BookOpen, CaretRight, PushPin, ChatCircleText, CheckCircle, Heart } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Jurnal() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const jurnalList = useDataStore((state) => state.jurnalList);

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Jurnal Harian</h2>
        <p className="text-xs text-[#6b6375]">Rekap materi harian dan penugasan aktif Anda</p>
      </div>

      {/* Lihat Tugas Card */}
      <div
        onClick={() => setActiveTab('daftar_tugas')}
        className="bg-gradient-to-br from-[#19414d] to-[#122e36] rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-[#19414d]/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-6 h-6 text-emerald-400" weight="duotone" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[#fcfbf7]">Lihat Daftar Tugas</h3>
            <p className="text-[11px] text-[#fcfbf7]/80 mt-0.5">Kelola PR dan tenggat waktu Anda</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <CaretRight className="w-4 h-4 text-white" weight="bold" />
        </div>
      </div>

      {/* JURNAL TIMELINE FEED */}
      <div className="space-y-4 pt-2">
        {jurnalList.map((j) => (
          <div key={j.id} className="p-4 rounded-2xl bg-white border border-[#e5e4e7] shadow-sm hover:shadow-md transition-all">
            {/* Social Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#19414d] text-white flex items-center justify-center font-bold flex-shrink-0">
                {j.teacher.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#121212] leading-none">{j.teacher}</h4>
                <p className="text-[11px] text-[#6b6375] mt-1 font-medium flex items-center gap-1.5">
                  <span className="text-[#19414d]">{j.subject}</span>
                  <span>•</span>
                  <span>{j.postedAt}</span>
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-3 mb-4 pl-1">
              <div>
                <p className="text-xs font-bold text-[#19414d] flex items-center gap-1.5 mb-1">
                  <PushPin className="w-4 h-4 text-rose-500" weight="fill" /> MATERI HARI INI:
                </p>
                <p className="text-sm font-semibold text-[#121212] leading-relaxed">{j.topic}</p>
              </div>

              {j.notes && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-[#19414d] flex items-center gap-1.5 mb-1">
                    <ChatCircleText className="w-4 h-4 text-[#19414d]" weight="fill" /> PESAN DARI GURU:
                  </p>
                  <p className="text-[13px] text-[#121212] leading-relaxed italic border-l-2 border-[#19414d]/20 pl-2">
                    {j.notes}
                  </p>
                </div>
              )}

              {j.hasTask && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <CheckCircle className="w-3 h-3" weight="fill" /> Dilengkapi Tugas Baru
                  </span>
                </div>
              )}
            </div>

            {/* Social Footer */}
            <div className="pt-3 border-t border-[#e5e4e7] flex flex-wrap items-center gap-4 text-xs font-bold text-[#6b6375]">
              <button className="flex items-center gap-1.5 hover:text-[#19414d] transition-colors cursor-pointer">
                <ChatCircleText className="w-5 h-5" weight="duotone" /> {j.comments} Komentar
              </button>
              <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer">
                <Heart className="w-5 h-5" weight="duotone" /> {j.likes} Suka
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
