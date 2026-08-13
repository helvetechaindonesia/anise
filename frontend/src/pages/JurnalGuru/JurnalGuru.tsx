import React, { useState } from 'react';
import { CaretRight, BookOpen, Clock, Users, WarningCircle, CheckCircle, Warning, XCircle, Image as ImageIcon, Camera, Plus, CalendarBlank } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

// --- Dashboard Component ---
function JurnalDashboard({ onSelectJournal }: { onSelectJournal: (j: any) => void }) {
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
          onClick={() => onSelectJournal({ id: Date.now(), class: 'Pilih Kelas', subject: 'Pilih Mata Pelajaran', time: 'Sekarang', status: 'active', materi: '' })}
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

// --- Detail/Form Component ---
const dummyStudents = [
  { id: 1, name: 'Ahmad Fauzi', nisn: '0012345678', gender: 'L' },
  { id: 2, name: 'Bunga Lestari', nisn: '0012345679', gender: 'P' },
  { id: 3, name: 'Chandra Wijaya', nisn: '0012345680', gender: 'L' },
  { id: 4, name: 'Dina Mariana', nisn: '0012345681', gender: 'P' },
  { id: 5, name: 'Eko Prasetyo', nisn: '0012345682', gender: 'L' },
];

function DetailJurnalGuru({ journal, onBack }: { journal: any, onBack: () => void }) {
  const { userProfile } = useAppStore();
  const isCompleted = journal.status === 'completed';

  const [materi, setMateri] = useState(isCompleted ? (journal.materi || 'Materi sudah diisi sebelumnya.') : '');
  const [catatan, setCatatan] = useState(isCompleted ? 'Tidak ada kejadian khusus.' : '');
  const [presensi, setPresensi] = useState<Record<number, string>>(
    dummyStudents.reduce((acc, student) => ({ ...acc, [student.id]: isCompleted ? 'H' : 'H' }), {})
  );

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePresensiChange = (studentId: number, status: string) => {
    if (isCompleted) return;
    setPresensi(prev => ({ ...prev, [studentId]: status }));
  };

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
        <h2 className="text-xl font-bold text-[#19414d] mb-2">Jurnal Berhasil Disimpan</h2>
        <p className="text-xs text-[#6b6375]">Laporan mengajar dan presensi kelas telah tercatat di sistem.</p>
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
          <p className="text-[11px] text-[#6b6375] mt-0.5">{isCompleted ? 'Arsip Laporan KBM' : 'Laporan KBM Harian'}</p>
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
        
        {/* Materi Pembelajaran */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-600" weight="duotone" />
            </div>
            <h3 className="font-bold text-[#121212] text-[15px]">Materi & Kegitan</h3>
          </div>
          <textarea 
            required
            rows={3}
            disabled={isCompleted}
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Tuliskan KD, materi pokok, atau deskripsi kegiatan belajar mengajar hari ini..."
            className="w-full text-sm font-medium p-4 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf] disabled:bg-[#f8fafc] disabled:text-[#6b6375]"
          />
        </div>

        {/* Presensi Kelas Jurnal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Users className="w-5 h-5 text-purple-600" weight="duotone" />
              </div>
              <h3 className="font-bold text-[#121212] text-[15px]">Presensi Jurnal</h3>
            </div>
            <span className="text-[10px] bg-[#e5e4e7] text-[#6b6375] px-2 py-1 rounded-md font-bold">
              {dummyStudents.length} Siswa
            </span>
          </div>
          
          <div className="bg-white rounded-2xl border-2 border-[#e5e4e7] shadow-sm overflow-hidden">
            <div className="p-3 bg-[#f8fafc] border-b border-[#e5e4e7] grid grid-cols-12 gap-2 text-[10px] font-bold text-[#6b6375] uppercase tracking-wider text-center">
              <div className="col-span-6 text-left pl-2">Nama Siswa</div>
              <div className="col-span-6">Status</div>
            </div>
            
            <div className="divide-y divide-[#e5e4e7]/60">
              {dummyStudents.map((student) => {
                const status = presensi[student.id];
                const isAbsent = status !== 'H';
                
                return (
                  <div key={student.id} className={`p-3 grid grid-cols-12 gap-2 items-center transition-colors ${isAbsent ? 'bg-rose-50/30' : 'hover:bg-[#f8fafc]'}`}>
                    <div className="col-span-6 pl-2">
                      <p className={`text-xs font-bold leading-tight truncate ${isAbsent ? 'text-rose-900' : 'text-[#121212]'}`}>{student.name}</p>
                      <p className="text-[9px] text-[#6b6375] mt-0.5">{student.nisn}</p>
                    </div>
                    
                    <div className="col-span-6 flex justify-end gap-1 pr-2">
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'H')}
                        disabled={isCompleted}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'H' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf]'
                        }`}
                      >
                        H
                      </button>
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'S')}
                        disabled={isCompleted}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'S' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf]'
                        }`}
                      >
                        S
                      </button>
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'I')}
                        disabled={isCompleted}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'I' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf]'
                        }`}
                      >
                        I
                      </button>
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'A')}
                        disabled={isCompleted}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'A' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf]'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] font-semibold text-[#6b6375] pl-2 flex items-center gap-1.5">
            <WarningCircle className="w-3.5 h-3.5" />
            H: Hadir, S: Sakit, I: Izin, A: Alfa
          </p>
        </div>

        {/* Catatan Tambahan */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Warning className="w-5 h-5 text-amber-600" weight="duotone" />
            </div>
            <h3 className="font-bold text-[#121212] text-[15px]">Catatan / Kejadian</h3>
          </div>
          <textarea 
            rows={2}
            disabled={isCompleted}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tidak ada catatan (opsional)..."
            className="w-full text-sm font-medium p-4 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf] disabled:bg-[#f8fafc] disabled:text-[#6b6375]"
          />
        </div>

        {/* Submit Action */}
        {!isCompleted && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#e5e4e7] z-40 max-w-md mx-auto">
            <button 
              type="submit"
              className="w-full py-3.5 bg-[#19414d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#19414d]/20 hover:bg-[#122e36] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" weight="bold" />
              Simpan Jurnal & Presensi
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

  if (selectedJournalGuru) {
    return (
      <DetailJurnalGuru 
        journal={selectedJournalGuru} 
        onBack={() => setSelectedJournalGuru(null)} 
      />
    );
  }

  return <JurnalDashboard onSelectJournal={setSelectedJournalGuru} />;
}
