import React, { useState } from 'react';
import { CaretRight, CheckCircle, Clock, UploadSimple, Check } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import type { TugasItem } from '../../types';

export default function DaftarTugas() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { tugasList, updateTugasStatus } = useDataStore();
  
  const [tugasTab, setTugasTab] = useState<'Belum Dikerjakan' | 'Selesai' | 'Terlewat'>('Belum Dikerjakan');
  const [selectedTugas, setSelectedTugas] = useState<TugasItem | null>(null);
  const [uploadFile, setUploadFile] = useState<string>('');

  const handleSubmitTugas = (tugasId: number) => {
    updateTugasStatus(tugasId, 'Selesai');
    setSelectedTugas(null);
    setUploadFile('');
  };

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('jurnal')}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d]">Daftar Tugas</h2>
          <p className="text-xs text-[#6b6375]">Kelola PR dan tenggat waktu akademis Anda</p>
        </div>
      </div>

      {/* Tab Category Filter */}
      <div className="flex rounded-lg bg-white p-1 border border-[#e5e4e7] gap-0.5 overflow-x-auto custom-scrollbar">
        {(['Belum Dikerjakan', 'Selesai', 'Terlewat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTugasTab(tab)}
            className={`flex-1 min-w-max text-center px-4 py-2 text-[10px] sm:text-xs font-bold rounded-md capitalize transition-all ${tugasTab === tab
                ? 'bg-[#19414d] text-white shadow-sm'
                : 'text-[#6b6375] hover:text-[#121212]'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tugas List */}
      <div className="space-y-3">
        {tugasList.filter(t => t.status === tugasTab).length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-[#e5e4e7] text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto opacity-40 mb-2" weight="duotone" />
            <p className="text-xs font-medium text-[#6b6375]">Tidak ada tugas di kategori ini.</p>
          </div>
        ) : (
          tugasList.filter(t => t.status === tugasTab).map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTugas(t)}
              className="bg-white p-4 rounded-xl shadow-sm border border-[#e5e4e7] hover:border-[#19414d] transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {t.subject}
                </span>
                <span className="text-[10px] text-[#6b6375] font-semibold">{t.points} Poin</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#121212] leading-tight">{t.title}</h4>
                <p className="text-xs text-[#6b6375] line-clamp-2 mt-1">{t.desc}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#e5e4e7] text-[10px] font-semibold">
                <span className={`flex items-center gap-1 ${t.status === 'Terlewat' ? 'text-rose-500' :
                    t.status === 'Selesai' ? 'text-emerald-500' : 'text-amber-600'
                  }`}>
                  {t.status === 'Selesai' ? <CheckCircle className="w-3.5 h-3.5" weight="fill" /> : <Clock className="w-3.5 h-3.5" />}
                  {t.due}
                </span>
                <span className="text-[#19414d] flex items-center gap-1 font-bold">
                  Buka Detail <CaretRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DETIAL TUGAS */}
      {selectedTugas && (
        <div className="absolute inset-0 z-50 bg-[#121212]/60 flex items-end justify-center px-4 pb-4 max-w-[430px] mx-auto rounded-[36px] sm:rounded-[44px] overflow-hidden">
          <div className="bg-white w-full rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2.5 py-1 rounded-full uppercase">
                {selectedTugas.subject}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedTugas(null); }}
                className="text-xs font-bold text-[#6b6375] hover:text-[#121212] cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#121212]">{selectedTugas.title}</h3>
              <span className="text-[10px] text-rose-500 font-bold block mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Batas Pengumpulan: {selectedTugas.due}
              </span>
            </div>

            <div className="p-4 bg-[#19414d]/5 rounded-xl border border-[#19414d]/10 mb-6 text-sm text-[#121212] leading-relaxed">
              {selectedTugas.desc}
            </div>
            {selectedTugas.status === 'Belum Dikerjakan' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#e5e4e7] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#fcfbf7] hover:bg-[#19414d]/5 hover:border-[#19414d]/30 transition-colors cursor-pointer group">
                  <UploadSimple className="w-8 h-8 text-[#19414d] mb-2 group-hover:-translate-y-1 transition-transform" />
                  <p className="text-sm font-bold text-[#19414d]">Upload File Tugas</p>
                  <p className="text-xs text-[#6b6375] mt-1">PDF, JPG, PNG (Max 10MB)</p>
                </div>
                <input
                  type="text"
                  placeholder="Pesan tambahan untuk guru..."
                  value={uploadFile}
                  onChange={(e) => setUploadFile(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                />
                <button
                  onClick={() => handleSubmitTugas(selectedTugas.id)}
                  className="w-full bg-[#19414d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#19414d]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  Submit Tugas Sekarang
                </button>
              </div>
            )}

            {selectedTugas.status === 'Selesai' && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-medium flex items-center gap-2">
                <Check className="w-4.5 h-4.5 text-emerald-600" />
                <span>Tugas Anda telah terkumpul: <span className="font-bold">{selectedTugas.submittedFile || 'Terkirim.pdf'}</span></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
