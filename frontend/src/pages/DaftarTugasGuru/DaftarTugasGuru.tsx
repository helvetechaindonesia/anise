import React, { useState, useEffect } from 'react';
import { PencilSimpleLine, ListChecks, Plus, CheckCircle, SpinnerGap, CaretRight, Users, Clock } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

export default function DaftarTugasGuru() {
  const setActiveTabApp = useAppStore((state) => state.setActiveTab);
  const { token } = useAppStore();
  const [activeTab, setActiveTab] = useState<'buat' | 'pantau'>('buat');
  
  // Form State
  const [form, setForm] = useState({
    journal_id: '',
    judul: '',
    deskripsi: '',
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Journals List for Dropdown
  const [journals, setJournals] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Jurnals untuk dropdown
    const fetchJournals = async () => {
      try {
        const res = await fetch('/api/jurnal/guru', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          // Hanya ambil jurnal yang belum punya tugas, backend tidak otomatis mem-filter jadi biarkan semua dulu (nanti akan gagal di post jika sudah punya)
          setJournals(data.data || []);
        }
      } catch (err) {
        console.error("Gagal load daftar jurnal:", err);
      }
    };
    fetchJournals();
  }, [token]);
  
  // Pantau State
  const [daftarTugas, setDaftarTugas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState<any | null>(null);

  const fetchDaftarTugas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tugas/guru', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDaftarTugas(data.data || []);
      }
    } catch (err) {
      console.error("Gagal load daftar tugas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pantau') {
      fetchDaftarTugas();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tugas/guru', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSubmitSuccess(true);
        setForm({ journal_id: '', judul: '', deskripsi: '', deadline: '' });
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert(data.message || 'Gagal menyimpan tugas');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-5 pb-24 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTabApp('jurnal')}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d]">Daftar Tugas</h2>
          <p className="text-xs text-[#6b6375]">Berikan tugas dan pantau pengumpulan siswa</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#e5e4e7]/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('buat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === 'buat' ? 'bg-[#19414d] text-white shadow-sm' : 'text-[#6b6375]'
          }`}
        >
          <PencilSimpleLine weight={activeTab === 'buat' ? 'bold' : 'regular'} className="w-4 h-4" />
          Buat Tugas Baru
        </button>
        <button
          onClick={() => setActiveTab('pantau')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === 'pantau' ? 'bg-[#19414d] text-white shadow-sm' : 'text-[#6b6375]'
          }`}
        >
          <ListChecks weight={activeTab === 'pantau' ? 'bold' : 'regular'} className="w-4 h-4" />
          Pantau Tugas
        </button>
      </div>

      {/* Tulis Tugas Form */}
      {activeTab === 'buat' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-[#e5e4e7] shadow-sm space-y-4">
          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" weight="fill" />
              <p className="text-[11px] font-bold text-emerald-700">Tugas berhasil di-publish ke siswa!</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Pilih Jurnal (Tautan Tugas) *</label>
            <select
              required
              value={form.journal_id}
              onChange={(e) => setForm({...form, journal_id: e.target.value})}
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
            >
              <option value="">-- Pilih Jurnal Mengajar --</option>
              {journals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.tanggal} | {j.kelas} - {j.mapel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Judul Tugas *</label>
            <input
              type="text"
              required
              value={form.judul}
              onChange={(e) => setForm({...form, judul: e.target.value})}
              placeholder="Cth: Latihan Soal Algoritma"
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Deskripsi / Instruksi Tugas *</label>
            <textarea
              required
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({...form, deskripsi: e.target.value})}
              placeholder="Masukkan instruksi pengerjaan..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-3 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Batas Pengumpulan (Deadline) *</label>
            <input
              type="datetime-local"
              required
              value={form.deadline}
              onChange={(e) => setForm({...form, deadline: e.target.value})}
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#19414d] hover:bg-[#122e36] text-white font-bold text-[13px] py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <SpinnerGap className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus weight="bold" className="w-4 h-4" /> Publish Tugas
              </>
            )}
          </button>
        </form>
      )}

      {/* Pantau Tugas Tab */}
      {activeTab === 'pantau' && (
        <div className="space-y-3">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <SpinnerGap className="w-8 h-8 text-[#19414d] animate-spin mb-2" />
              <p className="text-xs text-[#19414d] font-bold">Memuat daftar tugas...</p>
            </div>
          ) : daftarTugas.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#e5e4e7]">
              <p className="text-sm text-[#6b6375]">Belum ada tugas yang diberikan.</p>
            </div>
          ) : (
            daftarTugas.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedTugas(item)}
                className="bg-white rounded-xl p-4 border border-[#e5e4e7] shadow-sm hover:border-[#19414d] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2 py-1 rounded-md uppercase">
                    {item.kelas} • {item.mapel}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" /> {item.deadline}
                  </span>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#121212] leading-tight">{item.judul}</h4>
                  <p className="text-[11px] text-[#6b6375] line-clamp-1 mt-1">{item.deskripsi}</p>
                </div>
                <div className="pt-2 border-t border-[#e5e4e7] mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <Users className="w-4 h-4 text-emerald-600" weight="duotone" /> 
                    {item.dikumpulkan} / {item.totalSiswa} Mengumpulkan
                  </div>
                  <CaretRight className="w-4 h-4 text-[#19414d]" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Detail Pantau Tugas */}
      {selectedTugas && (
        <div className="absolute inset-0 z-50 bg-[#121212]/60 flex items-end justify-center px-4 pb-4 max-w-[430px] mx-auto rounded-[36px] sm:rounded-[44px] overflow-hidden">
          <div className="bg-white w-full rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2.5 py-1 rounded-full uppercase">
                  {selectedTugas.kelas}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedTugas(null); }}
                className="text-xs font-bold text-[#6b6375] hover:text-[#121212] cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#121212]">{selectedTugas.judul}</h3>
              <p className="text-xs text-[#6b6375] mt-1">{selectedTugas.deskripsi}</p>
            </div>

            <div className="flex items-center gap-4 py-3 border-y border-[#e5e4e7]">
              <div className="flex-1 text-center">
                <span className="block text-xl font-black text-emerald-600">{selectedTugas.dikumpulkan}</span>
                <span className="text-[9px] font-bold text-[#6b6375] uppercase">Dikumpulkan</span>
              </div>
              <div className="w-px h-8 bg-[#e5e4e7]"></div>
              <div className="flex-1 text-center">
                <span className="block text-xl font-black text-rose-500">{selectedTugas.totalSiswa - selectedTugas.dikumpulkan}</span>
                <span className="text-[9px] font-bold text-[#6b6375] uppercase">Belum Mengumpulkan</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-[#121212]">Daftar Siswa</h4>
              <div className="space-y-2">
                {/* Dummy list siswa */}
                {[
                  { nama: 'Budi Santoso', status: 'Selesai', file: 'Tugas_Budi.pdf' },
                  { nama: 'Ayu Lestari', status: 'Selesai', file: 'Tugas_Ayu_v2.pdf' },
                  { nama: 'Joko Anwar', status: 'Belum', file: null }
                ].map((siswa, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-[#e5e4e7] bg-[#fcfbf7]">
                    <div>
                      <h5 className="text-xs font-bold text-[#121212]">{siswa.nama}</h5>
                      {siswa.file && <span className="text-[10px] text-[#19414d] font-semibold flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3 text-emerald-500" /> {siswa.file}</span>}
                    </div>
                    {siswa.status === 'Selesai' ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Dinilai</span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Belum Ada</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
