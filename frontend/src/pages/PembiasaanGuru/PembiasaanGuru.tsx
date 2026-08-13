import React, { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, CheckCircle, WarningCircle, BookBookmark, HandCoins, Users } from '@phosphor-icons/react';

// Mock data
const mockStudents = [
  { id: 1, name: 'Aditya Pratama', kelas: '10 IPA 1', sholat: true, sedekah: false, bacaBuku: true },
  { id: 2, name: 'Budi Santoso', kelas: '10 IPA 1', sholat: true, sedekah: true, bacaBuku: true },
  { id: 3, name: 'Citra Kirana', kelas: '10 IPS 2', sholat: false, sedekah: false, bacaBuku: false },
  { id: 4, name: 'Dewi Lestari', kelas: '11 IPA 2', sholat: true, sedekah: false, bacaBuku: false },
  { id: 5, name: 'Eko Patrio', kelas: '11 IPS 1', sholat: false, sedekah: true, bacaBuku: true },
  { id: 6, name: 'Fajar Nugraha', kelas: '12 IPA 1', sholat: true, sedekah: true, bacaBuku: false },
  { id: 7, name: 'Gita Gutawa', kelas: '12 IPS 2', sholat: true, sedekah: true, bacaBuku: true },
];

export default function PembiasaanGuru() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletedCount = (student: typeof mockStudents[0]) => {
    let count = 0;
    if (student.sholat) count++;
    if (student.sedekah) count++;
    if (student.bacaBuku) count++;
    return count;
  };

  return (
    <div className="space-y-5 pt-5 pb-24 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Pemantauan Pembiasaan</h2>
        <p className="text-xs text-[#6b6375]">Pantau aktivitas harian (Sholat, Sedekah, Membaca) seluruh siswa</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mb-1">
            <CheckCircle className="w-5 h-5" weight="fill" />
          </div>
          <span className="text-lg font-bold text-emerald-800">124</span>
          <span className="text-[9px] font-bold text-emerald-600 uppercase">Sholat Dhuha</span>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center mb-1">
            <HandCoins className="w-5 h-5" weight="fill" />
          </div>
          <span className="text-lg font-bold text-amber-800">89</span>
          <span className="text-[9px] font-bold text-amber-600 uppercase">Sedekah</span>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center mb-1">
            <BookBookmark className="w-5 h-5" weight="fill" />
          </div>
          <span className="text-lg font-bold text-indigo-800">210</span>
          <span className="text-[9px] font-bold text-indigo-600 uppercase">Membaca</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" weight="bold" />
          <input 
            type="text" 
            placeholder="Cari nama atau kelas siswa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#e5e4e7] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
          />
        </div>
        <button className="w-10 h-10 shrink-0 bg-white border border-[#e5e4e7] rounded-xl flex items-center justify-center text-[#19414d] hover:bg-[#f8fafc] transition-colors">
          <FunnelSimple className="w-5 h-5" weight="bold" />
        </button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-[#e5e4e7] overflow-hidden shadow-sm">
        <div className="p-3 border-b border-[#e5e4e7] bg-[#f8fafc] flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#19414d]">
            <Users className="w-4 h-4" weight="duotone" /> Data Siswa Hari Ini
          </div>
          <span className="text-[10px] font-medium text-[#6b6375]">{filteredStudents.length} Siswa</span>
        </div>
        
        <div className="divide-y divide-[#e5e4e7]">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-[#6b6375] text-xs">
              Tidak ada siswa yang sesuai pencarian.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const completed = getCompletedCount(student);
              
              return (
                <div key={student.id} className="p-3 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#121212]">{student.name}</h4>
                      <p className="text-[10px] font-medium text-[#6b6375]">{student.kelas}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${completed === 3 ? 'bg-emerald-100 text-emerald-700' : completed > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {completed}/3 Selesai
                    </div>
                  </div>
                  
                  {/* Indicators */}
                  <div className="flex gap-2">
                    <div className={`flex items-center gap-1 px-1.5 py-1 rounded border ${student.sholat ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      {student.sholat ? <CheckCircle className="w-3 h-3" weight="fill" /> : <WarningCircle className="w-3 h-3" />}
                      <span className="text-[9px] font-bold">Dhuha</span>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 py-1 rounded border ${student.sedekah ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      {student.sedekah ? <CheckCircle className="w-3 h-3" weight="fill" /> : <WarningCircle className="w-3 h-3" />}
                      <span className="text-[9px] font-bold">Sedekah</span>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 py-1 rounded border ${student.bacaBuku ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      {student.bacaBuku ? <CheckCircle className="w-3 h-3" weight="fill" /> : <WarningCircle className="w-3 h-3" />}
                      <span className="text-[9px] font-bold">Membaca</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
