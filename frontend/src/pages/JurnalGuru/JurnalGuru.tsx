import React, { useState, useEffect } from 'react';
import { CaretRight, BookOpen, Clock, WarningCircle, CheckCircle, Warning, QrCode, CalendarBlank, Plus } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import TambahJurnalGuru from './TambahJurnalGuru';
import QRCode from 'react-qr-code';

// --- Dashboard Component ---
function JurnalDashboard({ onSelectJournal, onAddJournal }: { onSelectJournal: (j: any) => void, onAddJournal: () => void }) {
  // Dummy history
  const dummyHistory = [
    { id: 101, class: '10 IPA 1', subject: 'Matematika', time: 'Senin, 07:15 - 08:45', status: 'completed', materi: 'Trigonometri Lanjut' },
    { id: 102, class: '10 IPS 2', subject: 'Matematika', time: 'Senin, 09:00 - 10:30', status: 'completed', materi: 'Statistika Dasar' },
    { id: 103, class: '11 IPA 1', subject: 'Matematika', time: 'Selasa, 13:00 - 14:30', status: 'completed', materi: 'Matriks & Vektor' },
  ];

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-[#19414d] tracking-tight">Jurnal Mengajar</h2>
          <p className="text-xs text-[#6b6375] font-medium mt-0.5">Riwayat KBM & Laporan</p>
        </div>
        <button 
          onClick={onAddJournal}
          className="w-10 h-10 bg-[#19414d] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" weight="bold" />
        </button>
      </div>

      <div className="space-y-3 mt-4">
        <h3 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-2">Riwayat Jurnal</h3>
        {dummyHistory.map(j => (
          <div 
            key={j.id} 
            onClick={() => onSelectJournal(j)}
            className="bg-white p-4 rounded-2xl border border-[#e5e4e7] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#19414d] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-500" weight="fill" />
              </div>
              <div>
                <h4 className="font-bold text-[#121212] group-hover:text-[#19414d] transition-colors text-[13px]">{j.class} - {j.subject}</h4>
                <p className="text-[10px] text-[#6b6375] font-semibold mt-0.5 flex items-center gap-1">
                  <CalendarBlank className="w-3 h-3" />
                  {j.time}
                </p>
                <p className="text-[11px] text-[#19414d] font-bold mt-1 line-clamp-1 opacity-80">{j.materi}</p>
              </div>
            </div>
            <CaretRight className="w-4 h-4 text-[#a09caf] group-hover:text-[#19414d] transition-colors" weight="bold" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Detail/Form Component (VERIFIKASI / QR CODE PRESENSI) ---
function DetailJurnalGuru({ journal, onBack }: { journal: any, onBack: () => void }) {
  const { userProfile } = useAppStore();
  const isCompleted = journal.status === 'completed';

  const [catatan, setCatatan] = useState(isCompleted ? 'Tidak ada kejadian khusus.' : '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Auto close QR code when completed
  useEffect(() => {
    if (isCompleted) setShowQR(false);
  }, [isCompleted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" weight="fill" />
        </div>
        <h2 className="text-xl font-bold text-[#19414d] mb-2">Verifikasi Berhasil</h2>
        <p className="text-xs text-[#6b6375]">Sesi kelas dan catatan pelanggaran telah ditutup dan disimpan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-5 animate-in slide-in-from-right-4 duration-300 pb-24 relative h-full min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d] leading-tight">Detail Jurnal</h2>
          <p className="text-[11px] text-[#6b6375] mt-0.5">{isCompleted ? 'Arsip Laporan KBM' : 'Verifikasi KBM Berjalan'}</p>
        </div>
      </div>

      {/* Class Info Card */}
      <div className={`rounded-3xl p-5 shadow-lg relative overflow-hidden text-white ${isCompleted ? 'bg-gradient-to-br from-[#6b6375] to-[#4a4453]' : 'bg-gradient-to-br from-[#19414d] to-[#256173]'}`}>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-sm border border-white/10 shadow-inner inline-block mb-3">
              {isCompleted ? 'SELESAI' : (journal.status === 'active' ? 'SEDANG BERLANGSUNG' : 'BELUM DINILAI')}
            </span>
            <h3 className="text-2xl font-black mb-1 tracking-tight">{journal.class}</h3>
            <p className="text-sm font-medium text-white/80 flex items-center gap-2">
              <BookOpen className="w-4 h-4" weight="duotone" />
              {journal.subject || userProfile?.subjects}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-white bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
              <Clock className="w-4 h-4 text-white/80" weight="bold" />
              <span className="font-bold text-xs tracking-wider">{journal.time}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Fitur Presensi QR Code */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <QrCode className="w-5 h-5 text-emerald-600" weight="duotone" />
              </div>
              <h3 className="font-bold text-[#121212] text-[15px]">Presensi Jurnal (Otomatis)</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border-2 border-[#e5e4e7] shadow-sm p-5 flex flex-col items-center justify-center text-center space-y-4">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <CheckCircle className="w-12 h-12 text-emerald-500" weight="fill" />
                <div>
                  <p className="font-bold text-[#121212]">Presensi Selesai</p>
                  <p className="text-[11px] text-[#6b6375] mt-1">Sesi KBM ini telah ditutup, presensi tidak dapat diakses lagi.</p>
                </div>
              </div>
            ) : showQR ? (
              <div className="animate-in zoom-in duration-300 w-full flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border-2 border-[#19414d] shadow-lg mb-3">
                  <QRCode value={`anise-jurnal-${journal.id}-${Date.now()}`} size={160} fgColor="#19414d" />
                </div>
                <p className="text-xs font-bold text-[#19414d]">Minta siswa memindai QR Code ini</p>
                <p className="text-[10px] text-[#6b6375] mt-1">QR Code akan kadaluarsa otomatis saat sesi ditutup.</p>
                
                <button 
                  type="button"
                  onClick={() => setShowQR(false)}
                  className="mt-4 px-4 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  Tutup QR Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-2 w-full">
                <div className="w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center border border-[#e5e4e7]">
                  <QrCode className="w-8 h-8 text-[#6b6375]" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs text-[#6b6375]">Siswa akan mencatat kehadiran secara otomatis dengan memindai QR dari HP Anda.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="w-full mt-2 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-100 transition-colors flex justify-center items-center gap-2"
                >
                  <QrCode className="w-4 h-4" weight="bold" />
                  Hasilkan QR Presensi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Catatan Tambahan / Pelanggaran */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Warning className="w-5 h-5 text-amber-600" weight="duotone" />
            </div>
            <h3 className="font-bold text-[#121212] text-[15px]">Catatan / Insiden Kelas</h3>
          </div>
          <textarea 
            rows={3}
            disabled={isCompleted}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tuliskan jika ada siswa bermasalah, indisipliner, atau kejadian khusus (opsional)..."
            className="w-full text-sm font-medium p-4 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf] disabled:bg-[#f8fafc] disabled:text-[#6b6375]"
          />
          {!isCompleted && (
            <p className="text-[10px] font-semibold text-[#6b6375] pl-2 flex items-center gap-1.5">
              <WarningCircle className="w-3.5 h-3.5" />
              Siswa yang dicatat di sini dapat dilanjutkan ke Lapor Kesiswaan
            </p>
          )}
        </div>

        {/* Submit Action (Tutup Sesi) */}
        {!isCompleted && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#e5e4e7] z-40 max-w-md mx-auto">
            <button 
              type="submit"
              className="w-full py-3.5 bg-[#19414d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#19414d]/20 hover:bg-[#122e36] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" weight="bold" />
              Tutup & Verifikasi Sesi
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// --- Main Export ---
export default function JurnalGuru() {
  const { selectedJournalGuru, setSelectedJournalGuru } = useAppStore();
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (isCreatingNew) {
    return <TambahJurnalGuru onBack={() => setIsCreatingNew(false)} />;
  }

  if (selectedJournalGuru) {
    return (
      <DetailJurnalGuru 
        journal={selectedJournalGuru} 
        onBack={() => setSelectedJournalGuru(null)} 
      />
    );
  }

  return <JurnalDashboard onSelectJournal={setSelectedJournalGuru} onAddJournal={() => setIsCreatingNew(true)} />;
}
