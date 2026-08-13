import React, { useState, useEffect } from 'react';
import { CaretRight, Plus, CheckCircle, FileText, Clock, XCircle, SpinnerGap } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { API_BASE_URL } from '../../utils/apiConfig';
import TambahTugasGuru from './TambahTugasGuru';
import DetailTugasGuru from './DetailTugasGuru';

// --- Dashboard Component ---
function TugasDashboard({ onSelectTugas, onAddTugas }: { onSelectTugas: (t: any) => void, onAddTugas: () => void }) {
  const { token } = useAppStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/tugas/guru', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          const mappedTasks = data.data.map((t: any) => ({
            id: String(t.id),
            title: t.judul || t.title || 'Tugas',
            subject: t.mapel ? `${t.mapel} - ${t.kelas}` : (t.subject || 'Mapel'),
            due: t.deadline || t.due || '-',
            desc: t.deskripsi || t.desc || '',
            points: 100,
            status: (t.dikumpulkan && t.totalSiswa && t.dikumpulkan === t.totalSiswa) ? 'Selesai' : 'Belum Dikerjakan'
          }));
          setTasks(mappedTasks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchTasks();
  }, [token]);

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
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <SpinnerGap className="w-8 h-8 text-[#19414d] animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-sm text-[#6b6375] py-10 bg-white rounded-2xl border border-dashed border-[#e5e4e7]">
            Belum ada tugas yang dibuat.
          </div>
        ) : (
          tasks.map(tugas => (
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
          ))
        )}
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
