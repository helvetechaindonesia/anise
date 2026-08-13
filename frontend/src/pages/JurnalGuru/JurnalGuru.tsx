import React, { useState } from 'react';
import { CaretRight, BookOpen, Clock, Users, WarningCircle, CheckCircle, Warning, XCircle, Image as ImageIcon, Camera } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

// Dummy list of students in the class
const dummyStudents = [
  { id: 1, name: 'Ahmad Fauzi', nisn: '0012345678', gender: 'L' },
  { id: 2, name: 'Bunga Lestari', nisn: '0012345679', gender: 'P' },
  { id: 3, name: 'Chandra Wijaya', nisn: '0012345680', gender: 'L' },
  { id: 4, name: 'Dina Mariana', nisn: '0012345681', gender: 'P' },
  { id: 5, name: 'Eko Prasetyo', nisn: '0012345682', gender: 'L' },
];

export default function JurnalGuru() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { userProfile } = useAppStore();

  const [materi, setMateri] = useState('');
  const [catatan, setCatatan] = useState('');
  
  // State for attendance: 'H' (Hadir), 'S' (Sakit), 'I' (Izin), 'A' (Alfa)
  // Default all to 'H'
  const [presensi, setPresensi] = useState<Record<number, string>>(
    dummyStudents.reduce((acc, student) => ({ ...acc, [student.id]: 'H' }), {})
  );

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePresensiChange = (studentId: number, status: string) => {
    setPresensi(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Real implementation would submit to backend here
    setTimeout(() => {
      setActiveTab('home');
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
    <div className="space-y-6 pt-5 animate-in fade-in duration-200 pb-24 relative h-full min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d] leading-tight">Jurnal Mengajar</h2>
          <p className="text-[11px] text-[#6b6375] mt-0.5">Laporan KBM Harian</p>
        </div>
      </div>

      {/* Class Info Card */}
      <div className="bg-gradient-to-br from-[#19414d] to-[#256173] rounded-3xl p-5 shadow-lg relative overflow-hidden text-white">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-sm border border-white/10 shadow-inner inline-block mb-3">
              SEDANG BERLANGSUNG
            </span>
            <h3 className="text-2xl font-black mb-1 tracking-tight">10 IPA 1</h3>
            <p className="text-sm font-medium text-emerald-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4" weight="duotone" />
              {userProfile?.subjects || 'Mata Pelajaran'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-white bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
              <Clock className="w-4 h-4 text-emerald-400" weight="bold" />
              <span className="font-bold text-xs tracking-wider">07:15 - 08:45</span>
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
            rows={4}
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Tuliskan KD, materi pokok, atau deskripsi kegiatan belajar mengajar hari ini..."
            className="w-full text-sm font-medium p-4 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-[#19414d] focus:ring-4 focus:ring-[#19414d]/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf]"
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
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'H' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf] hover:bg-[#e5e4e7]'
                        }`}
                      >
                        H
                      </button>
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'S')}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'S' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf] hover:bg-[#e5e4e7]'
                        }`}
                      >
                        S
                      </button>
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'I')}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'I' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf] hover:bg-[#e5e4e7]'
                        }`}
                      >
                        I
                      </button>
                      <button 
                        type="button"
                        onClick={() => handlePresensiChange(student.id, 'A')}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          status === 'A' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500 ring-offset-1' : 'bg-[#f0f0f0] text-[#a09caf] hover:bg-[#e5e4e7]'
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
            H: Hadir, S: Sakit, I: Izin, A: Alfa (Tanpa Keterangan)
          </p>
        </div>

        {/* Catatan Tambahan & Pelanggaran */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Warning className="w-5 h-5 text-amber-600" weight="duotone" />
            </div>
            <h3 className="font-bold text-[#121212] text-[15px]">Catatan / Kejadian</h3>
          </div>
          <textarea 
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tuliskan jika ada siswa bermasalah, kejadian khusus, atau catatan untuk wali kelas (opsional)..."
            className="w-full text-sm font-medium p-4 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none shadow-sm placeholder:text-[#a09caf]"
          />
        </div>

        {/* Upload Bukti */}
        <div className="space-y-3 pb-8">
           <div className="flex items-center gap-2">
            <div className="p-2 bg-[#f8fafc] rounded-xl border border-[#e5e4e7]">
              <Camera className="w-5 h-5 text-[#6b6375]" weight="duotone" />
            </div>
            <h3 className="font-bold text-[#121212] text-[15px]">Bukti Mengajar</h3>
          </div>
          <button type="button" className="w-full py-4 border-2 border-dashed border-[#e5e4e7] rounded-2xl flex flex-col items-center justify-center gap-2 bg-[#fcfbf7] hover:bg-[#f8fafc] transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ImageIcon className="w-5 h-5 text-[#19414d]" weight="duotone" />
            </div>
            <span className="text-xs font-bold text-[#6b6375]">Upload Foto KBM (Opsional)</span>
          </button>
        </div>

        {/* Submit Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#e5e4e7] z-40 max-w-md mx-auto">
          <button 
            type="submit"
            className="w-full py-3.5 bg-[#19414d] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#19414d]/20 hover:bg-[#122e36] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" weight="bold" />
            Simpan Jurnal & Presensi
          </button>
        </div>

      </form>
    </div>
  );
}
