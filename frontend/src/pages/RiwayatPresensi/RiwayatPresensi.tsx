import React from 'react';
import { Scan, CheckCircle, Clock, CaretRight } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

export default function RiwayatPresensi() {
  const startPresensi = useAppStore((state) => state.startPresensi);

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#19414d]">Riwayat Presensi</h2>
          <p className="text-xs text-[#6b6375]">Rekapitulasi kehadiran harian Anda</p>
        </div>
        <button
          onClick={startPresensi}
          className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-emerald-600 transition-colors"
        >
          <Scan className="w-4 h-4" weight="bold" />
          Scan Wajah
        </button>
      </div>

      {/* Rekap Card */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e4e7] flex justify-between items-center shadow-sm">
        <div className="text-center flex-1 border-r border-[#e5e4e7]">
          <span className="text-[10px] text-[#6b6375] font-bold uppercase">Hadir</span>
          <span className="block text-xl font-black text-emerald-600">22</span>
        </div>
        <div className="text-center flex-1 border-r border-[#e5e4e7]">
          <span className="text-[10px] text-[#6b6375] font-bold uppercase">Sakit/Izin</span>
          <span className="block text-xl font-black text-amber-500">2</span>
        </div>
        <div className="text-center flex-1">
          <span className="text-[10px] text-[#6b6375] font-bold uppercase">Alpa</span>
          <span className="block text-xl font-black text-rose-500">0</span>
        </div>
      </div>

      {/* List Riwayat */}
      <div className="space-y-3">
        {[
          { id: 1, date: 'Hari ini, 07:12 WIB', status: 'Hadir', type: 'Wajah & GPS Terverifikasi', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { id: 2, date: 'Kemarin, 06:58 WIB', status: 'Hadir', type: 'Wajah & GPS Terverifikasi', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { id: 3, date: '3 Hari yang lalu', status: 'Sakit', type: 'Surat Keterangan Dokter', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-[#e5e4e7] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" weight="fill" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#121212]">{item.status}</h4>
                  <span className="text-[10px] text-[#6b6375] font-medium">{item.date} • {item.type}</span>
                </div>
              </div>
              <CaretRight className="w-4 h-4 text-[#6b6375]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
