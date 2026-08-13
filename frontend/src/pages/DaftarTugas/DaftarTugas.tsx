import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState } from 'react';
import { CaretRight, CheckCircle, Clock, UploadSimple, Check } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import type { TugasItem } from '../../types';

export default function DaftarTugas() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { token } = useAppStore();
  
  const [tugasTab, setTugasTab] = useState<'Belum Dikerjakan' | 'Selesai' | 'Terlewat'>('Belum Dikerjakan');
  const [selectedTugas, setSelectedTugas] = useState<TugasItem | null>(null);
  
  // State for fetching and submitting
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [uploadText, setUploadText] = useState<string>('');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTugas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/tugas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTugasList(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTugas();
  }, [token]);

  const handleSubmitTugas = async (tugasId: string) => {
    if (!fileBase64 && !uploadText) {
      alert("Masukkan jawaban atau upload file terlebih dahulu");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/tugas/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: tugasId,
          submission_text: uploadText,
          file_base64: fileBase64
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Tugas berhasil dikumpulkan!");
        setSelectedTugas(null);
        setUploadText('');
        setFileBase64('');
        setFileName('');
        fetchTugas(); // Refresh list
      } else {
        alert(data.message || "Gagal mengumpulkan tugas");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestLate = async (tugasId: string) => {
    if (!uploadText) {
      alert("Silakan masukkan alasan keterlambatan Anda");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/tugas/request-late', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: tugasId,
          reason: uploadText
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Permintaan izin berhasil dikirim ke guru");
        setSelectedTugas(null);
        setUploadText('');
        fetchTugas(); // Refresh list
      } else {
        alert(data.message || "Gagal mengirim permintaan");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
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
        {isLoading ? (
          <div className="text-center py-10 bg-white rounded-xl border border-[#e5e4e7] opacity-70">
            <p className="text-xs font-bold text-[#19414d]">Memuat tugas...</p>
          </div>
        ) : tugasList.filter(t => t.status === tugasTab).length === 0 ? (
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
                <span className={`flex items-center gap-1 ${['Terlewat', 'Izin Ditolak'].includes(t.status) ? 'text-rose-500' :
                    t.status === 'Selesai' ? 'text-emerald-500' : 'text-amber-600'
                  }`}>
                  {t.status === 'Selesai' ? <CheckCircle className="w-3.5 h-3.5" weight="fill" /> : <Clock className="w-3.5 h-3.5" />}
                  {t.status === 'Minta Izin' ? 'Menunggu Izin Guru' : t.status === 'Izin Diberikan' ? 'Izin Diberikan' : t.status === 'Izin Ditolak' ? 'Izin Ditolak' : t.due}
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
            {(selectedTugas.status === 'Belum Dikerjakan' || selectedTugas.status === 'Izin Diberikan') && (
              <div className="space-y-4">
                {selectedTugas.status === 'Izin Diberikan' && (
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-xs font-medium mb-2">
                    Guru telah mengizinkan Anda untuk mengumpulkan tugas terlambat. Silakan upload file Anda sekarang.
                  </div>
                )}
                <label className="border-2 border-dashed border-[#e5e4e7] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#fcfbf7] hover:bg-[#19414d]/5 hover:border-[#19414d]/30 transition-colors cursor-pointer group relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => setFileBase64(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <UploadSimple className="w-8 h-8 text-[#19414d] mb-2 group-hover:-translate-y-1 transition-transform" />
                  <p className="text-sm font-bold text-[#19414d]">{fileName || 'Upload File Tugas'}</p>
                  <p className="text-xs text-[#6b6375] mt-1">PDF, JPG, PNG (Max 10MB)</p>
                </label>
                <input
                  type="text"
                  placeholder="Pesan tambahan untuk guru... (opsional)"
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                />
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitTugas(selectedTugas.id)}
                  className="w-full bg-[#19414d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#19414d]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-70 disabled:scale-100"
                >
                  {isSubmitting ? 'Mengirim...' : (selectedTugas.status === 'Izin Diberikan' ? 'Kumpulkan (Terlambat)' : 'Submit Tugas Sekarang')}
                </button>
              </div>
            )}
            
            {selectedTugas.status === 'Terlewat' && (
              <div className="space-y-4">
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 text-xs font-medium mb-2">
                  Batas waktu pengumpulan telah terlewat. Anda harus meminta izin kepada guru untuk dapat mengumpulkan.
                </div>
                <input
                  type="text"
                  placeholder="Tulis alasan keterlambatan Anda di sini..."
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-rose-400 bg-white"
                />
                <button
                  disabled={isSubmitting}
                  onClick={() => handleRequestLate(selectedTugas.id)}
                  className="w-full bg-rose-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-70 disabled:scale-100"
                >
                  {isSubmitting ? 'Mengirim...' : 'Minta Izin Kumpulkan Terlambat'}
                </button>
              </div>
            )}

            {selectedTugas.status === 'Minta Izin' && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-sm font-medium flex flex-col items-center text-center gap-2">
                <Clock className="w-6 h-6 text-amber-600" />
                <span>Permohonan izin Anda sedang menunggu persetujuan guru.</span>
              </div>
            )}

            {selectedTugas.status === 'Izin Ditolak' && (
              <div className="p-4 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 text-sm font-medium flex flex-col items-center text-center gap-2">
                <span className="font-bold">Izin Ditolak</span>
                <span className="text-xs">Guru tidak mengizinkan Anda untuk mengumpulkan tugas ini karena alasan tertentu.</span>
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
