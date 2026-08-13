import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { Scan, CheckCircle, Clock, CaretRight, WarningCircle, CaretDown, CaretUp, XCircle, Prohibit } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

export default function RiwayatPresensi() {
  const startPresensi = useAppStore((state) => state.startPresensi);
  const token = localStorage.getItem('token');
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<any>({ H: 0, T: 0, P: 0, Pulang_Asli: 0, TAM: 0, TAP: 0, TAMP: 0, Sakit: 0, Izin: 0, Alpa: 0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/presensi/riwayat', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.status === 'success') {
          setStats(json.data.stats);
          setHistory(json.data.history);
        }
      } catch (err) {
        console.error("Gagal mengambil data", err);
      }
    };
    fetchData();
  }, [token]);

  const getIconAndColor = (status: string) => {
    switch(status) {
      case 'H': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Hadir' };
      case 'T': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Terlambat' };
      case 'P': return { icon: WarningCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Pulang Awal' };
      case 'TAM': return { icon: Prohibit, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Tidak Absen Masuk' };
      case 'TAP': return { icon: Prohibit, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Tidak Absen Pulang' };
      case 'TAMP': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100', label: 'Telat Masuk & Pulang' };
      default: return { icon: CheckCircle, color: 'text-zinc-500', bg: 'bg-zinc-50', label: status };
    }
  };

  return (
    <div className="space-y-6 pt-5 animate-in fade-in duration-200">
      
      {/* Kartu Presensi Utama */}
      <div className="bg-gradient-to-br from-[#19414d] to-[#255b6a] p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div>
            <h2 className="text-xl font-bold">Mulai Presensi</h2>
            <p className="text-xs text-white/70">Waktu berjalan, pastikan presensi tepat waktu</p>
          </div>
          <button
            onClick={startPresensi}
            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Scan className="w-6 h-6" weight="bold" />
          </button>
        </div>

        {/* Insight Utama */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 grid grid-cols-3 gap-2 mb-3 relative z-10">
          <div className="text-center">
            <span className="block text-[10px] text-white/70 font-bold uppercase tracking-wider mb-0.5">Hadir</span>
            <span className="block text-xl font-black">{stats.H}</span>
          </div>
          <div className="text-center border-l border-white/20">
            <span className="block text-[10px] text-white/70 font-bold uppercase tracking-wider mb-0.5">Terlambat</span>
            <span className="block text-xl font-black text-amber-300">{stats.T}</span>
          </div>
          <div className="text-center border-l border-white/20">
            <span className="block text-[10px] text-white/70 font-bold uppercase tracking-wider mb-0.5">Tidak Hadir</span>
            <span className="block text-xl font-black text-rose-300">{stats.Sakit + stats.Izin + stats.Alpa}</span>
          </div>
        </div>

        {/* Detail Statistik Ekstra */}
        {isExpanded && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 grid grid-cols-3 gap-2 mb-3 animate-in slide-in-from-top-2 fade-in relative z-10">
            <div className="text-center">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Plg Awal (PA)</span>
              <span className="block text-sm font-bold text-orange-300">{stats.Pulang_Awal}</span>
            </div>
            <div className="text-center border-l border-white/10">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Pulang (P)</span>
              <span className="block text-sm font-bold text-emerald-300">{stats.Pulang}</span>
            </div>
            <div className="text-center border-l border-white/10">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Kembali</span>
              <span className="block text-sm font-bold text-teal-300">{stats.Kembali}</span>
            </div>
            <div className="text-center mt-2">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">TAM</span>
              <span className="block text-sm font-bold text-rose-300">{stats.TAM}</span>
            </div>
            <div className="text-center border-l border-white/10 mt-2">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">TAP</span>
              <span className="block text-sm font-bold text-rose-300">{stats.TAP}</span>
            </div>
            <div className="text-center border-l border-white/10 mt-2">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">TAMP</span>
              <span className="block text-sm font-bold text-rose-300">{stats.TAMP}</span>
            </div>
            <div className="text-center mt-2">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Sakit</span>
              <span className="block text-sm font-bold text-amber-300">{stats.Sakit}</span>
            </div>
            <div className="text-center border-l border-white/10 mt-2">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Izin</span>
              <span className="block text-sm font-bold text-amber-300">{stats.Izin}</span>
            </div>
            <div className="text-center border-l border-white/10 mt-2">
              <span className="block text-[9px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Alpa</span>
              <span className="block text-sm font-bold text-red-400">{stats.Alpa}</span>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center text-xs text-white/80 font-medium flex items-center justify-center gap-1 hover:text-white transition-colors relative z-10"
        >
          {isExpanded ? 'Tutup Detail' : 'Lihat Detail Status Lainnya'}
          {isExpanded ? <CaretUp className="w-3 h-3" /> : <CaretDown className="w-3 h-3" />}
        </button>
      </div>

      <div>
        <h3 className="font-bold text-[#19414d] mb-4">Riwayat presensi</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-sm text-[#6b6375] p-5 bg-white rounded-xl border border-[#e5e4e7]">
              Belum ada riwayat presensi.
            </div>
          ) : (
            history.map((item) => {
              const { icon: Icon, color, bg, label } = getIconAndColor(item.status);
              return (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-[#e5e4e7] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 ${bg} ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#121212]">{label}</h4>
                      <span className="text-[10px] text-[#6b6375] font-medium block mt-0.5">{item.tanggal}</span>
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        {item.metode}
                      </span>
                    </div>
                  </div>
                  {item.jam && (
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-black text-[#19414d]">{item.jam}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
