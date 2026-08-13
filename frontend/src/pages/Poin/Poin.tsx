import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { TrendUp, TrendDown, SealCheck, SpinnerGap, WarningCircle } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

interface PoinData {
  baseScore: number;
  totalPrestasi: number;
  totalPelanggaran: number;
  finalScore: number;
  grade: string;
  history: Array<{
    id: string;
    title: string;
    type: 'prestasi' | 'pelanggaran';
    category: string;
    points: number;
    notes: string;
    date: string;
    reporter: string;
  }>;
}

export default function Poin() {
  const { token } = useAppStore();
  const [data, setData] = useState<PoinData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API_BASE_URL + '/api/poin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.status === 'success') {
        setData(resData.data);
      } else {
        setError(resData.message || 'Gagal mengambil data poin');
      }
    })
    .catch(err => {
      setError('Terjadi kesalahan jaringan.');
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#6b6375]">
        <SpinnerGap className="w-8 h-8 animate-spin text-[#19414d] mb-4" />
        <p className="text-sm font-semibold">Memuat riwayat karakter...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-rose-500">
        <WarningCircle className="w-12 h-12 mb-4" />
        <p className="text-sm font-semibold text-center">{error || 'Data tidak ditemukan.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Poin & Prestasi</h2>
        <p className="text-xs text-[#6b6375]">Akumulasi nilai karakter selama tahun ajaran ini</p>
      </div>

      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-[#19414d] to-[#122e36] text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Decor */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#fcfbf7]/60 font-bold block mb-1">Nilai Akhir Karakter</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{data.finalScore}</span>
              <span className="text-sm font-bold text-emerald-400">/ {data.grade}</span>
            </div>
            <p className="text-[10px] text-[#fcfbf7]/70 mt-2 max-w-[200px] leading-relaxed">
              Dihitung dari basis poin 100 ditambah prestasi dan dikurangi pelanggaran.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
            <SealCheck className="w-7 h-7 text-emerald-400" weight="duotone" />
          </div>
        </div>

        {/* Separated Totals */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Total Prestasi</span>
            </div>
            <span className="text-xl font-bold">+{data.totalPrestasi}</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendDown className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Pelanggaran</span>
            </div>
            <span className="text-xl font-bold">-{data.totalPelanggaran}</span>
          </div>
        </div>
      </div>

      {/* Riwayat Mutasi Poin */}
      <div>
        <h4 className="text-[11px] font-bold text-[#6b6375] uppercase tracking-wider mb-4 px-1">Riwayat Poin</h4>
        
        {data.history.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-[#e5e4e7] text-center shadow-sm">
            <p className="text-sm font-semibold text-[#19414d]">Belum Ada Riwayat</p>
            <p className="text-xs text-[#6b6375] mt-1">Kamu belum memiliki catatan prestasi atau pelanggaran di tahun ajaran ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.history.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-2xl border border-[#e5e4e7] flex items-start gap-3 hover:shadow-md transition-all">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.type === 'prestasi' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {m.type === 'prestasi' ? <TrendUp className="w-4 h-4" /> : <TrendDown className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="text-sm font-bold text-[#121212] leading-tight">{m.title}</h5>
                    <span className={`text-sm font-black shrink-0 ${m.type === 'prestasi' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.type === 'prestasi' ? `+${m.points}` : `-${m.points}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 mb-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#6b6375] font-semibold border border-[#e5e4e7] uppercase tracking-wide">
                      {m.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#94a3b8] font-medium">{m.date}</span>
                  </div>
                  <p className="text-[11px] text-[#6b6375] font-medium leading-relaxed bg-[#f8fafc] p-2 rounded-lg border border-[#f1f5f9]">
                    <span className="text-[#19414d] font-bold block mb-0.5">Catatan {m.reporter}:</span>
                    "{m.notes}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
