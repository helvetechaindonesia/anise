import React, { useState } from 'react';
import { TrendUp, Sparkle } from '@phosphor-icons/react';
import { useDataStore } from '../../store/useDataStore';

export default function Poin() {
  const mutasiPoin = useDataStore((state) => state.mutasiPoin);
  const addPoinMutasi = useDataStore((state) => state.addPoinMutasi);
  
  const totalPoin = 100 + mutasiPoin.reduce((acc, curr) => acc + curr.points, 0);

  const [newPoinTitle, setNewPoinTitle] = useState('');
  const [newPoinValue, setNewPoinValue] = useState(10);
  const [newPoinType, setNewPoinType] = useState<'prestasi' | 'pelanggaran'>('prestasi');

  const handleAddPoin = () => {
    if (!newPoinTitle.trim()) return;
    const newMutasi = {
      id: Date.now(),
      title: newPoinTitle,
      date: 'Hari ini',
      points: newPoinType === 'prestasi' ? Number(newPoinValue) : -Number(newPoinValue),
      type: newPoinType,
      notes: 'Diinput oleh Guru (Demo Mode)'
    };
    addPoinMutasi(newMutasi);
    setNewPoinTitle('');
  };

  return (
    <div className="space-y-6 pt-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Dashboard Poin & Prestasi</h2>
        <p className="text-xs text-[#6b6375]">Sistem penjaminan mutu karakter siswa & guru</p>
      </div>

      {/* Total Poin Card */}
      <div className="bg-gradient-to-br from-[#19414d] to-[#122e36] text-white p-5 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#fcfbf7]/60 block font-semibold">Total Saldo Poin Karakter</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold tracking-tight">{totalPoin}</span>
            <span className="text-xs font-semibold text-emerald-400">Poin Aktif</span>
          </div>
          <span className="text-[10px] text-[#fcfbf7]/70 block mt-2">Peringkat 5 Terbaik dari 32 Siswa</span>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <TrendUp className="w-7 h-7 text-emerald-400" />
        </div>
      </div>

      {/* SIMULASI GURU INPUT (Untuk demo kelayakan fitur KPI) */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e4e7] space-y-3.5">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#19414d] uppercase tracking-wider">Simulasi Pemberian Poin (Demo Guru)</h3>
          <span className="text-[9px] px-2 py-0.5 bg-[#19414d]/10 text-[#19414d] font-bold rounded">GURU ROLE</span>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nama Prestasi / Pelanggaran..."
            value={newPoinTitle}
            onChange={(e) => setNewPoinTitle(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newPoinType}
              onChange={(e) => setNewPoinType(e.target.value as any)}
              className="text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
            >
              <option value="prestasi">Prestasi (+)</option>
              <option value="pelanggaran">Pelanggaran (-)</option>
            </select>
            <input
              type="number"
              value={newPoinValue}
              onChange={(e) => setNewPoinValue(Number(e.target.value))}
              className="text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
              placeholder="Nilai Poin"
            />
          </div>
          <button
            onClick={handleAddPoin}
            className="w-full py-2.5 bg-[#19414d] hover:bg-[#19414d]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Sparkle className="w-3.5 h-3.5" weight="duotone" />
            Terbitkan Poin Baru
          </button>
        </div>
      </div>

      {/* Riwayat Mutasi Poin */}
      <div>
        <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-3">Riwayat Mutasi Poin</h4>
        <div className="space-y-2">
          {mutasiPoin.map(m => (
            <div key={m.id} className="bg-white p-3.5 rounded-xl border border-[#e5e4e7] flex justify-between items-center hover:shadow-sm transition-all">
              <div>
                <h5 className="text-xs font-bold text-[#121212]">{m.title}</h5>
                <span className="text-[10px] text-[#6b6375] font-light block mt-0.5">{m.date} • {m.notes}</span>
              </div>
              <span className={`text-xs font-black shrink-0 ${m.type === 'prestasi' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m.points > 0 ? `+${m.points}` : m.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
