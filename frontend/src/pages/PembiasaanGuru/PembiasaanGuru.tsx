import React, { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, CheckCircle, WarningCircle, BookBookmark, HandCoins, Users, X, Sun, Star, Basketball, ForkKnife, BookOpen, UsersThree, Moon } from '@phosphor-icons/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getDefaultAvatar } from '../../utils/avatar';

// Mock data based on 7 habits
const mockStudents = [
  { id: 1, name: 'Aditya Pratama', kelas: '10 IPA 1', habits: [true, false, true, true, false, true, false], stats: [
    { subject: 'Bangun Pagi', A: 80, fullMark: 100 }, { subject: 'Beribadah', A: 40, fullMark: 100 }, { subject: 'Berolahraga', A: 90, fullMark: 100 }, { subject: 'Makan Sehat', A: 70, fullMark: 100 }, { subject: 'Belajar', A: 85, fullMark: 100 }, { subject: 'Sosial', A: 60, fullMark: 100 }, { subject: 'Tidur', A: 50, fullMark: 100 }
  ]},
  { id: 2, name: 'Budi Santoso', kelas: '10 IPA 1', habits: [true, true, true, true, true, true, true], stats: [
    { subject: 'Bangun Pagi', A: 90, fullMark: 100 }, { subject: 'Beribadah', A: 85, fullMark: 100 }, { subject: 'Berolahraga', A: 80, fullMark: 100 }, { subject: 'Makan Sehat', A: 95, fullMark: 100 }, { subject: 'Belajar', A: 90, fullMark: 100 }, { subject: 'Sosial', A: 95, fullMark: 100 }, { subject: 'Tidur', A: 90, fullMark: 100 }
  ]},
  { id: 3, name: 'Citra Kirana', kelas: '10 IPS 2', habits: [false, false, false, true, false, false, false], stats: [
    { subject: 'Bangun Pagi', A: 30, fullMark: 100 }, { subject: 'Beribadah', A: 20, fullMark: 100 }, { subject: 'Berolahraga', A: 40, fullMark: 100 }, { subject: 'Makan Sehat', A: 50, fullMark: 100 }, { subject: 'Belajar', A: 60, fullMark: 100 }, { subject: 'Sosial', A: 40, fullMark: 100 }, { subject: 'Tidur', A: 30, fullMark: 100 }
  ]},
  { id: 4, name: 'Dewi Lestari', kelas: '11 IPA 2', habits: [true, true, false, true, true, false, true], stats: [
    { subject: 'Bangun Pagi', A: 85, fullMark: 100 }, { subject: 'Beribadah', A: 80, fullMark: 100 }, { subject: 'Berolahraga', A: 30, fullMark: 100 }, { subject: 'Makan Sehat', A: 75, fullMark: 100 }, { subject: 'Belajar', A: 80, fullMark: 100 }, { subject: 'Sosial', A: 50, fullMark: 100 }, { subject: 'Tidur', A: 85, fullMark: 100 }
  ]},
  { id: 5, name: 'Eko Patrio', kelas: '11 IPS 1', habits: [false, true, true, true, true, true, false], stats: [
    { subject: 'Bangun Pagi', A: 45, fullMark: 100 }, { subject: 'Beribadah', A: 90, fullMark: 100 }, { subject: 'Berolahraga', A: 85, fullMark: 100 }, { subject: 'Makan Sehat', A: 85, fullMark: 100 }, { subject: 'Belajar', A: 70, fullMark: 100 }, { subject: 'Sosial', A: 80, fullMark: 100 }, { subject: 'Tidur', A: 40, fullMark: 100 }
  ]},
  { id: 6, name: 'Fajar Nugraha', kelas: '12 IPA 1', habits: [true, true, true, true, false, false, true], stats: [
    { subject: 'Bangun Pagi', A: 95, fullMark: 100 }, { subject: 'Beribadah', A: 80, fullMark: 100 }, { subject: 'Berolahraga', A: 75, fullMark: 100 }, { subject: 'Makan Sehat', A: 85, fullMark: 100 }, { subject: 'Belajar', A: 40, fullMark: 100 }, { subject: 'Sosial', A: 50, fullMark: 100 }, { subject: 'Tidur', A: 90, fullMark: 100 }
  ]},
  { id: 7, name: 'Gita Gutawa', kelas: '12 IPS 2', habits: [true, true, true, true, true, true, true], stats: [
    { subject: 'Bangun Pagi', A: 90, fullMark: 100 }, { subject: 'Beribadah', A: 95, fullMark: 100 }, { subject: 'Berolahraga', A: 90, fullMark: 100 }, { subject: 'Makan Sehat', A: 90, fullMark: 100 }, { subject: 'Belajar', A: 95, fullMark: 100 }, { subject: 'Sosial', A: 95, fullMark: 100 }, { subject: 'Tidur', A: 90, fullMark: 100 }
  ]},
];

export default function PembiasaanGuru() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletedCount = (student: typeof mockStudents[0]) => {
    return student.habits.filter(Boolean).length;
  };

  return (
    <div className="space-y-5 pt-5 pb-24 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Pemantauan Pembiasaan</h2>
        <p className="text-xs text-[#6b6375]">Pantau aktivitas harian (Sholat, Sedekah, Membaca) seluruh siswa</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Sun, label: 'Bangun', count: 156, color: 'emerald' },
          { icon: Star, label: 'Ibadah', count: 124, color: 'indigo' },
          { icon: Basketball, label: 'Olahraga', count: 89, color: 'rose' },
          { icon: ForkKnife, label: 'Makan', count: 210, color: 'amber' },
          { icon: BookOpen, label: 'Belajar', count: 145, color: 'blue' },
          { icon: UsersThree, label: 'Sosial', count: 178, color: 'purple' },
          { icon: Moon, label: 'Tidur', count: 92, color: 'teal' },
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-50 rounded-2xl p-2 border border-${stat.color}-100 flex flex-col items-center justify-center text-center`}>
            <div className={`w-6 h-6 bg-${stat.color}-200 text-${stat.color}-700 rounded-full flex items-center justify-center mb-1`}>
              <stat.icon className="w-3.5 h-3.5" weight="fill" />
            </div>
            <span className={`text-sm font-bold text-${stat.color}-800`}>{stat.count}</span>
            <span className={`text-[8px] font-bold text-${stat.color}-600 uppercase`}>{stat.label}</span>
          </div>
        ))}
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
                <div 
                  key={student.id} 
                  className="p-3 hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#121212]">{student.name}</h4>
                      <p className="text-[10px] font-medium text-[#6b6375]">{student.kelas}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${completed === 7 ? 'bg-emerald-100 text-emerald-700' : completed > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {completed}/7 Selesai
                    </div>
                  </div>
                  
                  {/* Indicators */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { icon: Sun, label: 'Pagi' },
                      { icon: Star, label: 'Ibadah' },
                      { icon: Basketball, label: 'Olah' },
                      { icon: ForkKnife, label: 'Makan' },
                      { icon: BookOpen, label: 'Belajar' },
                      { icon: UsersThree, label: 'Sosial' },
                      { icon: Moon, label: 'Tidur' },
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-1 px-1.5 py-1 rounded border shrink-0 ${student.habits[idx] ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        <item.icon className="w-3 h-3" weight={student.habits[idx] ? "fill" : "regular"} />
                        <span className="text-[9px] font-bold">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Insight Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedStudent(null)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#f8fafc] text-[#6b6375] hover:bg-[#e5e4e7] hover:text-[#121212] transition-colors z-10"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
            
            <div className="p-6 flex flex-col items-center border-b border-[#e5e4e7] bg-[#f8fafc]/50">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-100 bg-white p-1 mb-3">
                <img 
                  src={getDefaultAvatar()} 
                  alt={selectedStudent.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg text-[#121212] text-center">{selectedStudent.name}</h3>
              <p className="text-xs font-medium text-[#6b6375] bg-[#e5e4e7] px-3 py-1 rounded-full mt-2">Kelas {selectedStudent.kelas}</p>
            </div>
            
            <div className="p-5">
              <h4 className="text-xs font-bold text-[#19414d] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Analisis Karakter
              </h4>
              
              <div className="h-64 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedStudent.stats}>
                    <PolarGrid stroke="#e5e4e7" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b6375', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name={selectedStudent.name} 
                      dataKey="A" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="#10b981" 
                      fillOpacity={0.2} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-[#fcfbf7] p-3 rounded-xl border border-[#e5e4e7]">
                  <p className="text-[10px] text-[#6b6375] font-semibold mb-1">Skor Rata-Rata</p>
                  <p className="text-xl font-black text-[#19414d]">
                    {Math.round(selectedStudent.stats.reduce((acc, curr) => acc + curr.A, 0) / 5)}<span className="text-[11px] font-semibold text-[#9ca3af]">/100</span>
                  </p>
                </div>
                <div className="bg-[#fcfbf7] p-3 rounded-xl border border-[#e5e4e7]">
                  <p className="text-[10px] text-[#6b6375] font-semibold mb-1">Konsistensi</p>
                  <p className="text-xl font-black text-emerald-600">
                    {getCompletedCount(selectedStudent) === 7 ? 'Tinggi' : getCompletedCount(selectedStudent) >= 4 ? 'Sedang' : 'Rendah'}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
