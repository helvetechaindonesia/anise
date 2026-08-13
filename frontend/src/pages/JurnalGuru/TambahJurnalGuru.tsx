import React, { useState } from 'react';
import { CaretRight, BookOpen, Clock, CalendarBlank, Link, Camera, CheckCircle, SpinnerGap } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

export default function TambahJurnalGuru({ onBack }: { onBack: () => void }) {
  const { userProfile } = useAppStore();
  
  const [kelas, setKelas] = useState('10 IPA 1');
  const [mapel, setMapel] = useState(userProfile?.subjects || 'Mata Pelajaran');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktuMulai, setWaktuMulai] = useState('07:15');
  const [waktuSelesai, setWaktuSelesai] = useState('08:45');
  
  const [topik, setTopik] = useState('');
  const [pesan, setPesan] = useState('');
  const [linkRef, setLinkRef] = useState('');
  const [hasTask, setHasTask] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" weight="fill" />
        </div>
        <h2 className="text-xl font-bold text-[#19414d] mb-2">Jadwal Berhasil Dibuat</h2>
        <p className="text-xs text-[#6b6375]">Jurnal telah ditambahkan dan akan muncul di beranda siswa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-5 animate-in slide-in-from-bottom-8 duration-300 pb-24 relative h-full min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d] leading-tight">Buat Jurnal Baru</h2>
          <p className="text-[11px] text-[#6b6375] mt-0.5">Rencanakan Jadwal Mengajar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Info Kelas & Waktu */}
        <div className="bg-white rounded-3xl p-5 border border-[#e5e4e7] shadow-sm space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 block">Kelas</label>
            <select 
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full text-sm font-bold text-[#121212] p-3 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-2 focus:ring-[#19414d]/10 transition-all"
            >
              <option value="10 IPA 1">10 IPA 1</option>
              <option value="10 IPA 2">10 IPA 2</option>
              <option value="10 IPS 1">10 IPS 1</option>
              <option value="11 IPA 1">11 IPA 1</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 block">Mata Pelajaran</label>
            <input 
              type="text"
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              className="w-full text-sm font-bold text-[#121212] p-3 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-2 focus:ring-[#19414d]/10 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 block">Tanggal & Waktu</label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-12 sm:col-span-6 relative">
                <CalendarBlank className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6375]" weight="bold" />
                <input 
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-sm font-bold text-[#121212] pl-9 p-3 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-2 focus:ring-[#19414d]/10 transition-all"
                />
              </div>
              <div className="col-span-6 sm:col-span-3 relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6375]" weight="bold" />
                <input 
                  type="time"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                  className="w-full text-sm font-bold text-[#121212] pl-9 p-3 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-2 focus:ring-[#19414d]/10 transition-all"
                />
              </div>
              <div className="col-span-6 sm:col-span-3 relative">
                <input 
                  type="time"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                  className="w-full text-sm font-bold text-[#121212] p-3 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-2 focus:ring-[#19414d]/10 transition-all text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Konten Jurnal */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" weight="fill" /> Topik / Materi Pembelajaran <span className="text-rose-500">*</span>
            </label>
            <textarea 
              required
              rows={3}
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Bab 2 - Sistem Ekskresi Manusia..."
              className="w-full text-sm font-medium p-3.5 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CaretRight className="w-3.5 h-3.5 text-[#19414d]" weight="bold" /> Pesan Tambahan untuk Siswa
            </label>
            <textarea 
              rows={2}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Catatan khusus, misal: 'Jangan lupa bawa alat peraga' (Opsional)"
              className="w-full text-sm font-medium p-3.5 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-indigo-500" weight="bold" /> Link Referensi
            </label>
            <input 
              type="url"
              value={linkRef}
              onChange={(e) => setLinkRef(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm font-medium p-3.5 rounded-xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all shadow-sm placeholder:text-[#a09caf]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-500" weight="fill" /> Lampiran File / Foto
            </label>
            <button type="button" className="w-full py-3 border-2 border-dashed border-[#e5e4e7] rounded-xl flex items-center justify-center gap-2 bg-[#f8fafc] hover:bg-[#e5e4e7]/50 transition-colors">
              <Camera className="w-4 h-4 text-[#6b6375]" weight="duotone" />
              <span className="text-xs font-bold text-[#6b6375]">Upload Foto (Opsional)</span>
            </button>
          </div>

          <label className="flex items-center gap-3 p-4 border border-[#e5e4e7] rounded-xl bg-white shadow-sm cursor-pointer select-none">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={hasTask}
                onChange={(e) => setHasTask(e.target.checked)}
                className="peer w-5 h-5 appearance-none border-2 border-[#e5e4e7] rounded checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
              />
              <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" weight="bold" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#121212]">Sertakan Tugas Baru</p>
              <p className="text-[10px] text-[#6b6375] mt-0.5">Beri tanda bahwa ada tugas untuk kelas ini</p>
            </div>
          </label>
        </div>

        {/* Submit Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#e5e4e7] z-40 max-w-md mx-auto">
          <button 
            type="submit"
            disabled={isSubmitting || !topik}
            className="w-full py-3.5 bg-[#19414d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#19414d]/20 hover:bg-[#122e36] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <SpinnerGap className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" weight="bold" />
                Posting Jurnal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
