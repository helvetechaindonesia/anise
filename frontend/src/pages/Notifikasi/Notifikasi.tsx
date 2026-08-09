import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Notifikasi() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const notifications = useDataStore((state) => state.notifications);

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#19414d]">Kotak Masuk Notifikasi</h2>
          <p className="text-xs text-[#6b6375]">Pemberitahuan akademik, presensi, dan poin karakter Anda</p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="px-3.5 py-1.5 bg-[#19414d]/10 hover:bg-[#19414d]/20 transition-all rounded-lg text-xs font-bold text-[#19414d]"
        >
          Kembali
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e4e7] overflow-hidden divide-y divide-[#e5e4e7] shadow-sm">
        {notifications.map(n => (
          <div key={n.id} className="p-4 hover:bg-[#19414d]/5 transition-colors space-y-1">
            <div className="flex justify-between items-start gap-2">
              <span className="font-bold text-sm text-[#19414d] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${n.type === 'tugas' ? 'bg-amber-500' : n.type === 'poin' ? 'bg-emerald-500' : 'bg-[#19414d]'}`} />
                {n.title}
              </span>
              <span className="text-[10px] text-[#6b6375] font-semibold shrink-0">{n.time}</span>
            </div>
            <p className="text-xs text-[#6b6375] leading-relaxed pl-3.5">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
