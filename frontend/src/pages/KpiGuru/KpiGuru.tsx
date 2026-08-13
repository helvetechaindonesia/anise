import React from 'react';
import { Target, UsersThree, FileText, SealCheck } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function KpiGuru() {
  const { userProfile } = useAppStore();
  const kpiData = useDataStore((state) => state.kpiGuruData);

  const getBadgeColor = (nilai: string) => {
    switch (nilai.toLowerCase()) {
      case 'diatas ekspektasi':
      case 'amat baik':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'sesuai ekspektasi':
      case 'baik':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'kurang ekspektasi':
      case 'cukup':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pt-5 pb-24 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Penilaian Kinerja Guru (KPI)</h2>
        <p className="text-xs text-[#6b6375]">Evaluasi kompetensi dan perilaku kerja Anda</p>
      </div>

      {/* Main KPI Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#e5e4e7] overflow-hidden relative">
        {/* Header Periode */}
        <div className="bg-[#f8fafc] p-4 border-b border-[#e5e4e7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SealCheck className="w-5 h-5 text-[#19414d]" weight="fill" />
            <span className="font-bold text-[#121212] text-sm">Predikat Kinerja</span>
          </div>
          <div className="bg-[#19414d]/10 text-[#19414d] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
            {kpiData.periode}
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-[#e5e4e7]">
          {/* Praktik Kinerja */}
          <div className="p-5 flex justify-between items-start gap-4 hover:bg-[#f8fafc] transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-[#6b6375]" weight="duotone" />
                <h4 className="font-bold text-[#121212] text-sm">Praktik Kinerja</h4>
              </div>
              <p className="text-[11px] text-[#6b6375] leading-relaxed">
                Berdasarkan dokumen Tindak Lanjut dan Refleksi Tindak Lanjut.
              </p>
            </div>
            <div className="shrink-0 text-right flex flex-col items-end">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getBadgeColor(kpiData.praktikKinerja)}`}>
                {kpiData.praktikKinerja}
              </span>
            </div>
          </div>

          {/* Perilaku Kerja */}
          <div className="p-5 flex justify-between items-start gap-4 hover:bg-[#f8fafc] transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <UsersThree className="w-4 h-4 text-[#6b6375]" weight="duotone" />
                <h4 className="font-bold text-[#121212] text-sm">Perilaku Kerja</h4>
              </div>
              <p className="text-[11px] text-[#6b6375] leading-relaxed">
                Berdasarkan penilaian terhadap 7 aspek Perilaku Kerja.
              </p>
            </div>
            <div className="shrink-0 text-right flex flex-col items-end">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getBadgeColor(kpiData.perilakuKerja)}`}>
                {kpiData.perilakuKerja}
              </span>
            </div>
          </div>
        </div>

        {/* Final Predikat */}
        <div className="bg-gradient-to-r from-[#19414d]/5 to-transparent p-5 border-t border-[#e5e4e7] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#19414d]" weight="duotone" />
            <div>
              <h4 className="font-bold text-[#19414d] text-sm">Predikat Kinerja Akhir</h4>
              <p className="text-[10px] text-[#6b6375] font-semibold mt-0.5">Total Skor: {kpiData.score} / 100</p>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-xl text-xs font-black border ${getBadgeColor(kpiData.predikatAkhir)} shadow-sm`}>
            {kpiData.predikatAkhir}
          </div>
        </div>
      </div>

      {/* 7 Aspek BerAKHLAK Table */}
      <div>
        <h3 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-4 px-1">Rincian 7 Aspek Perilaku Kerja</h3>
        
        <div className="bg-white rounded-2xl border border-[#e5e4e7] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#e5e4e7]">
            {kpiData.aspekBerAkhlak.map((aspek, idx) => (
              <div key={idx} className="p-4 hover:bg-[#f8fafc] transition-colors flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-[#f8fafc] border border-[#e5e4e7] flex items-center justify-center shrink-0 text-[#19414d] text-[10px] font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h5 className="text-sm font-bold text-[#121212]">{aspek.nama}</h5>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getBadgeColor(aspek.nilai)}`}>
                      {aspek.nilai}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6b6375]">{aspek.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
