import React, { useState } from 'react';
import { CaretRight, CheckCircle, SpinnerGap, BookOpen, Clock, TextAa } from '@phosphor-icons/react';

export default function TambahTugasGuru({ onBack }: { onBack: () => void }) {
  const [kelas, setKelas] = useState('10 IPA 1');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

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
        <h2 className="text-xl font-bold text-[#19414d] mb-2">Tugas Berhasil Dibuat</h2>
        <p className="text-xs text-[#6b6375]">Tugas telah ditambahkan dan didistribusikan ke siswa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-5 animate-in slide-in-from-bottom-8 duration-300 pb-24 relative h-full min-h-[80vh]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d] leading-tight">Buat Tugas Baru</h2>
          <p className="text-[11px] text-[#6b6375] mt-0.5">Berikan penugasan ke siswa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-3xl p-5 border border-[#e5e4e7] shadow-sm space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 block">Kelas Tujuan</label>
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
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <TextAa className="w-3.5 h-3.5 text-blue-500" weight="fill" /> Judul Tugas
            </label>
            <input 
              required
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Makalah Sistem Ekskresi"
              className="w-full text-sm font-medium p-3.5 rounded-xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all shadow-sm placeholder:text-[#a09caf]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" weight="fill" /> Deskripsi / Instruksi
            </label>
            <textarea 
              required
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan instruksi pengerjaan tugas secara jelas..."
              className="w-full text-sm font-medium p-3.5 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf]"
            />
          </div>

          <div>
             <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" weight="fill" /> Batas Pengumpulan (Deadline)
            </label>
            <input 
              required
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-sm font-medium p-3.5 rounded-xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all shadow-sm text-[#121212]"
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#e5e4e7] z-40 max-w-md mx-auto">
          <button 
            type="submit"
            disabled={isSubmitting || !judul}
            className="w-full py-3.5 bg-[#19414d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#19414d]/20 hover:bg-[#122e36] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <SpinnerGap className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" weight="bold" />
                Buat dan Kirim Tugas
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
