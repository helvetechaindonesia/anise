import React, { useState, useEffect } from 'react';
import { PencilSimpleLine, ListChecks, Plus, CheckCircle, SpinnerGap } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function JurnalGuru() {
  const { token, userProfile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'tulis' | 'riwayat'>('tulis');
  
  // Form State
  const [form, setForm] = useState({
    kelas: '',
    mapel: '',
    materi: '',
    catatan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Riwayat State
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);

  const fetchRiwayat = async () => {
    setIsLoadingRiwayat(true);
    try {
      const res = await fetch('/api/jurnal/guru', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRiwayat(data.data || []);
      }
    } catch (err) {
      console.error("Gagal load riwayat jurnal:", err);
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'riwayat') {
      fetchRiwayat();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/jurnal/guru', {
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
        setForm({ kelas: '', mapel: '', materi: '', catatan: '' });
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert(data.message || 'Gagal menyimpan jurnal');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-5 pb-24 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Jurnal Mengajar</h2>
        <p className="text-xs text-[#6b6375]">Input materi ajar dan lihat riwayat mengajar Anda</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#e5e4e7]/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('tulis')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === 'tulis' ? 'bg-white text-[#19414d] shadow-sm' : 'text-[#6b6375]'
          }`}
        >
          <PencilSimpleLine weight={activeTab === 'tulis' ? 'bold' : 'regular'} className="w-4 h-4" />
          Tulis Jurnal
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === 'riwayat' ? 'bg-white text-[#19414d] shadow-sm' : 'text-[#6b6375]'
          }`}
        >
          <ListChecks weight={activeTab === 'riwayat' ? 'bold' : 'regular'} className="w-4 h-4" />
          Riwayat
        </button>
      </div>

      {/* Tulis Jurnal Form */}
      {activeTab === 'tulis' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-[#e5e4e7] shadow-sm space-y-4">
          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" weight="fill" />
              <p className="text-[11px] font-bold text-emerald-700">Jurnal mengajar berhasil disimpan!</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6375]">Kelas / Rombel *</label>
              <input
                type="text"
                required
                value={form.kelas}
                onChange={(e) => setForm({...form, kelas: e.target.value})}
                placeholder="Cth: XII RPL 1"
                className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6375]">Mata Pelajaran *</label>
              <input
                type="text"
                required
                value={form.mapel}
                onChange={(e) => setForm({...form, mapel: e.target.value})}
                placeholder="Cth: Pemrograman Dasar"
                className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Topik Materi *</label>
            <textarea
              required
              rows={3}
              value={form.materi}
              onChange={(e) => setForm({...form, materi: e.target.value})}
              placeholder="Masukkan ringkasan materi yang diajarkan hari ini..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-3 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={form.catatan}
              onChange={(e) => setForm({...form, catatan: e.target.value})}
              placeholder="Cth: Tugas kelompok bab 3 dikumpulkan minggu depan."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-3 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all resize-none"
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
                <Plus weight="bold" className="w-4 h-4" /> Simpan Jurnal
              </>
            )}
          </button>
        </form>
      )}

      {/* Riwayat Tab */}
      {activeTab === 'riwayat' && (
        <div className="space-y-3">
          {isLoadingRiwayat ? (
             <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <SpinnerGap className="w-8 h-8 text-[#19414d] animate-spin mb-2" />
              <p className="text-xs text-[#19414d] font-bold">Memuat riwayat...</p>
            </div>
          ) : riwayat.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#e5e4e7]">
              <p className="text-sm text-[#6b6375]">Belum ada riwayat jurnal.</p>
            </div>
          ) : (
            riwayat.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-[#e5e4e7] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#121212]">{item.mapel}</h4>
                    <p className="text-[11px] font-bold text-[#19414d] mt-0.5">Kelas: {item.kelas}</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#6b6375] bg-[#e5e4e7]/50 px-2 py-1 rounded-md">
                    {item.tanggal}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e5e4e7] mt-2">
                  <p className="text-[12px] text-[#121212] leading-relaxed"><span className="font-bold text-[#6b6375]">Topik:</span> {item.materi}</p>
                  {item.catatan && (
                    <p className="text-[11px] text-[#19414d] mt-2 italic bg-[#19414d]/5 p-2 rounded-lg">"{item.catatan}"</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
