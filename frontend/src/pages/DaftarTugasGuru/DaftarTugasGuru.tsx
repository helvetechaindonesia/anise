import React, { useState } from 'react';
import { CaretRight, Plus, CheckCircle, FileText, Clock, FileDashed } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import TambahTugasGuru from './TambahTugasGuru';
import DetailTugasGuru from './DetailTugasGuru';

// --- Dashboard Component ---
function TugasDashboard({ onSelectTugas, onAddTugas }: { onSelectTugas: (t: any) => void, onAddTugas: () => void }) {
  // Dummy history
  const dummyHistory = [
    { id: 201, title: 'Tugas Proyek Tengah Semester', subject: 'Matematika - 10 IPA 1', due: 'Besok, 23:59', status: 'Belum Dikerjakan' },
    { id: 202, title: 'Latihan Soal Matriks', subject: 'Matematika - 11 IPA 1', due: 'Senin Depan', status: 'Belum Dikerjakan' },
    { id: 203, title: 'Tugas Harian 1', subject: 'Matematika - 10 IPS 2', due: 'Selesai', status: 'Selesai' },
  ];

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-[#19414d] tracking-tight">Tugas Mengajar</h2>
          <p className="text-xs text-[#6b6375] font-medium mt-0.5">Riwayat Penugasan & Penilaian</p>
        </div>
        <button 
          onClick={onAddTugas}
          className="w-10 h-10 bg-[#19414d] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" weight="bold" />
        </button>
      </div>

      <div className="space-y-3 mt-4">
        <h3 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-2">Daftar Tugas</h3>
        {dummyHistory.map(tugas => (
          <div 
            key={tugas.id} 
            onClick={() => onSelectTugas(tugas)}
            className="bg-white p-4 rounded-2xl border border-[#e5e4e7] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#19414d] transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tugas.status === 'Selesai' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                {tugas.status === 'Selesai' ? <CheckCircle className="w-6 h-6 text-emerald-500" weight="fill" /> : <FileText className="w-6 h-6 text-blue-500" weight="duotone" />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-[#121212] group-hover:text-[#19414d] transition-colors text-[13px] truncate">{tugas.title}</h4>
                <p className="text-[10px] text-[#6b6375] font-semibold mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Tenggat: {tugas.due}
                </p>
                <p className="text-[11px] text-[#19414d] font-bold mt-1 line-clamp-1 opacity-80">{tugas.subject}</p>
              </div>
            </div>
            <CaretRight className="w-4 h-4 text-[#a09caf] group-hover:text-[#19414d] transition-colors shrink-0 ml-2" weight="bold" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Export ---
export default function DaftarTugasGuru() {
  const { selectedTugasGuru, setSelectedTugasGuru } = useAppStore();
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (isCreatingNew) {
    return <TambahTugasGuru onBack={() => setIsCreatingNew(false)} />;
  }

  if (selectedTugasGuru) {
    return (
      <DetailTugasGuru 
        tugas={selectedTugasGuru} 
        onBack={() => setSelectedTugasGuru(null)} 
      />
    );
  }

  return <TugasDashboard onSelectTugas={setSelectedTugasGuru} onAddTugas={() => setIsCreatingNew(true)} />;
}
