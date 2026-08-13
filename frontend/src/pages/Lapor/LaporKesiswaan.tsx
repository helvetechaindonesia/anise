import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { CaretRight, WarningCircle, ShieldCheck, CheckCircle, Clock } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

interface ReportItem {
  id: string;
  category: string;
  description: string;
  status: string;
  date: string;
}

export default function LaporKesiswaan() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { token } = useAppStore();

  const [activeSegment, setActiveSegment] = useState<'baru' | 'riwayat'>('baru');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/siswa/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setReports(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  const handleSubmit = async () => {
    if (!category || !description) {
      alert("Harap lengkapi kategori dan deskripsi laporan");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/siswa/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, description })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Laporan berhasil dikirim ke Kesiswaan");
        setCategory('');
        setDescription('');
        setActiveSegment('riwayat');
        fetchReports();
      } else {
        alert(data.message || "Gagal mengirim laporan");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200 pb-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d]">Lapor Kesiswaan</h2>
          <p className="text-xs text-[#6b6375]">Sistem Aduan Keamanan & Fasilitas</p>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex gap-3 shadow-sm">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" weight="fill" />
        <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
          Sekolah menjamin penuh keamanan data pelapor. Laporan Anda hanya akan dibaca oleh Tim Kesiswaan / BK untuk segera ditindaklanjuti.
        </p>
      </div>

      <div className="flex rounded-lg bg-white p-1 border border-[#e5e4e7] gap-0.5">
        <button
          onClick={() => setActiveSegment('baru')}
          className={`flex-1 text-center px-4 py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
            activeSegment === 'baru'
              ? 'bg-[#19414d] text-white shadow-sm'
              : 'text-[#6b6375] hover:text-[#121212]'
          }`}
        >
          Buat Laporan Baru
        </button>
        <button
          onClick={() => setActiveSegment('riwayat')}
          className={`flex-1 text-center px-4 py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
            activeSegment === 'riwayat'
              ? 'bg-[#19414d] text-white shadow-sm'
              : 'text-[#6b6375] hover:text-[#121212]'
          }`}
        >
          Riwayat Laporan
        </button>
      </div>

      {activeSegment === 'baru' ? (
        <div className="bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#19414d] block mb-1.5">Kategori Masalah</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7] font-medium"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="BULLYING">Tindakan Bullying / Kekerasan</option>
              <option value="FASILITAS_RUSAK">Fasilitas Sekolah Rusak</option>
              <option value="PELANGGARAN_LAIN">Pelanggaran Tata Tertib</option>
              <option value="SARAN">Saran & Kritik</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#19414d] block mb-1.5">Kronologi Kejadian</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan detail kejadian (waktu, tempat, dan pihak yang terlibat)..."
              className="w-full text-xs p-3.5 rounded-xl border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7] resize-none leading-relaxed"
            ></textarea>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#19414d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#19414d]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm mt-2 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan Sekarang'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-10 bg-white rounded-xl border border-[#e5e4e7] opacity-70">
              <p className="text-xs font-bold text-[#19414d]">Memuat riwayat...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-[#e5e4e7] text-center">
              <WarningCircle className="w-10 h-10 text-[#6b6375] mx-auto opacity-40 mb-2" weight="duotone" />
              <p className="text-xs font-medium text-[#6b6375]">Belum ada riwayat laporan.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white p-4.5 rounded-2xl shadow-sm border border-[#e5e4e7] flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2.5 py-1 rounded-md tracking-wide">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-[#6b6375] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {report.date}
                  </span>
                </div>
                
                <p className="text-xs text-[#121212] leading-relaxed mt-1">
                  {report.description}
                </p>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-[#e5e4e7]">
                  <span className="text-[10px] font-bold text-[#6b6375]">Status Tindak Lanjut:</span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5
                    ${report.status === 'PENDING' ? 'bg-slate-100 text-slate-600' :
                      report.status === 'DIPROSES' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'}`}
                  >
                    {report.status === 'SELESAI' ? <CheckCircle className="w-3.5 h-3.5" weight="fill" /> : <Clock className="w-3.5 h-3.5" />}
                    {report.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
